# VPS Setup Guide for NOTIXCLOUD

This guide covers the complete setup process for connecting a VPS to NOTIXCLOUD as a Minecraft hosting node.

## Prerequisites

### VPS Requirements
- **OS**: Ubuntu 22.04/24.04, Debian 11/12, CentOS 9, AlmaLinux 9, Rocky Linux 9
- **Architecture**: x86_64 (ARM64 supported for development only)
- **Resources**: Minimum 2 CPU cores, 4GB RAM, 20GB disk
- **Network**: Public IPv4 address, SSH access (port 22 or custom)
- **Access**: Root or sudo user with SSH key authentication

### Required Software (auto-installed if missing)
- OpenJDK 17+ or 21+ (for Minecraft 1.18+)
- Docker (optional, for containerized servers)
- systemd (for service management)
- curl, wget, tar, gzip, unzip

## Quick Setup (Automated)

### 1. Add Node in Control Panel
1. Go to **Admin → Infrastructure → Add VPS**
2. Fill in the wizard:
   - Node name (friendly identifier)
   - Hostname or IP address
   - SSH port (default 22)
   - SSH username (usually `root` or `ubuntu`)
   - Paste SSH private key
   - Optional: Host key fingerprint
3. Run connection test
4. Register node

### 2. Install Node Agent on VPS
```bash
# Run as root on the VPS
curl -fsSL https://get.notixcloud.com/agent.sh | sh
```

The script will:
- Create `notix-agent` user
- Download and verify agent binary
- Configure systemd service
- Register with control panel
- Start agent service

### 3. Verify Connection
- Check **Admin → Infrastructure → Connected Nodes**
- Node should show **Online** status
- Metrics should appear in **Node Resources**

## Manual Setup (Advanced)

### 1. Prepare VPS

#### Update System
```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS/AlmaLinux/Rocky
dnf update -y
```

#### Install Required Packages
```bash
# Ubuntu/Debian
apt install -y openjdk-21-jre-headless docker.io curl wget tar gzip unzip systemd

# CentOS/AlmaLinux/Rocky
dnf install -y java-21-openjdk-headless docker curl wget tar gzip unzip systemd
```

#### Configure Docker (optional)
```bash
systemctl enable --now docker
usermod -aG docker $USER
```

#### Create Dedicated User (Recommended)
```bash
useradd -r -m -s /bin/bash -d /home/notix notix
usermod -aG docker notix
```

#### Set Up SSH Key (if not using root)
```bash
# On your local machine
ssh-keygen -t ed25519 -f ~/.ssh/notixcloud_node -N ""

# Copy to VPS
ssh-copy-id -i ~/.ssh/notixcloud_node.pub notix@your-vps-ip

# Test
ssh -i ~/.ssh/notixcloud_node notix@your-vps-ip
```

### 2. Configure Firewall

#### UFW (Ubuntu/Debian)
```bash
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp      # SSH (change if using custom port)
ufw allow 443/tcp     # Agent HTTPS
ufw allow 25565/tcp   # Minecraft default
ufw allow 10000:10100/tcp  # Additional MC ports
ufw enable
```

#### firewalld (CentOS/AlmaLinux/Rocky)
```bash
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=25565/tcp
firewall-cmd --permanent --add-port=10000-10100/tcp
firewall-cmd --reload
```

#### iptables (Manual)
```bash
iptables -A INPUT -p tcp --dport 22 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -A INPUT -p tcp --dport 25565 -j ACCEPT
iptables -A INPUT -p tcp --dport 10000:10100 -j ACCEPT
iptables -A INPUT -m state --state ESTABLISHED,RELATED -j ACCEPT
iptables -A INPUT -i lo -j ACCEPT
iptables -P INPUT DROP
iptables-save > /etc/iptables/rules.v4
```

### 3. Configure SSH Hardening

Edit `/etc/ssh/sshd_config`:
```bash
Port 22                    # Or your custom port
PermitRootLogin no         # Disable root login
PubkeyAuthentication yes
PasswordAuthentication no
PermitEmptyPasswords no
ChallengeResponseAuthentication no
UsePAM yes
X11Forwarding no
AllowAgentForwarding no
AllowTcpForwarding no
ClientAliveInterval 300
ClientAliveCountMax 2
MaxAuthTries 3
LoginGraceTime 30
```

Restart SSH:
```bash
systemctl restart sshd
# or
systemctl restart ssh
```

### 4. Install Node Agent Manually

```bash
# Download agent (replace with actual URL)
ARCH=$(uname -m)
case $ARCH in
  x86_64) AGENT_ARCH="amd64" ;;
  aarch64) AGENT_ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

curl -fsSL "https://get.notixcloud.com/agent/linux/${AGENT_ARCH}/notix-agent" -o /usr/local/bin/notix-agent
chmod +x /usr/local/bin/notix-agent

# Create config directory
mkdir -p /etc/notix-agent
chown notix:notix /etc/notix-agent
chmod 700 /etc/notix-agent

# Create config file (will be populated after registration)
cat > /etc/notix-agent/config.yaml << 'EOF'
node_id: ""
control_panel_url: "https://your-panel.notixcloud.com"
agent_token: ""
verify_tls: true
heartbeat_interval: 30000
command_timeout: 300000
log_level: "info"
data_dir: "/var/lib/notix-agent"
servers_dir: "/var/lib/notix-agent/servers"
backups_dir: "/var/lib/notix-agent/backups"
temp_dir: "/tmp/notix-agent"
max_concurrent_operations: 3
EOF

chown notix:notix /etc/notix-agent/config.yaml
chmod 600 /etc/notix-agent/config.yaml

# Create data directories
mkdir -p /var/lib/notix-agent/{servers,backups,temp}
mkdir -p /var/log/notix-agent
chown -R notix:notix /var/lib/notix-agent /var/log/notix-agent

# Create systemd service
cat > /etc/systemd/system/notix-agent.service << 'EOF'
[Unit]
Description=NOTIXCLOUD Node Agent
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=notix
Group=notix
ExecStart=/usr/local/bin/notix-agent --config /etc/notix-agent/config.yaml
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=notix-agent

# Security
NoNewPrivileges=true
PrivateTmp=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=/var/lib/notix-agent /var/log/notix-agent /tmp/notix-agent
CapabilityBoundingSet=CAP_DAC_OVERRIDE CAP_CHOWN CAP_SETGID CAP_SETUID

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable --now notix-agent
```

### 5. Register Agent
```bash
# Get registration token from control panel
# Then run on VPS:
notix-agent register \
  --panel "https://your-panel.notixcloud.com" \
  --token "your-registration-token" \
  --name "your-node-name"
```

## TLS/SSL Configuration

### Option 1: Let's Encrypt (Recommended for Production)
```bash
# Install certbot
apt install -y certbot  # Ubuntu/Debian
dnf install -y certbot  # CentOS/AlmaLinux/Rocky

# Get certificate (replace with your domain)
certbot certonly --standalone -d node.yourdomain.com

# Certificates will be in /etc/letsencrypt/live/node.yourdomain.com/
# Configure agent to use:
# tls_cert_path: "/etc/letsencrypt/live/node.yourdomain.com/fullchain.pem"
# tls_key_path: "/etc/letsencrypt/live/node.yourdomain.com/privkey.pem"
```

### Option 2: Self-Signed (Development Only)
```bash
mkdir -p /etc/notix-agent/certs
openssl req -x509 -newkey rsa:4096 -keyout /etc/notix-agent/certs/agent.key \
  -out /etc/notix-agent/certs/agent.crt -days 365 -nodes \
  -subj "/CN=notix-agent"

chown notix:notix /etc/notix-agent/certs/*
chmod 600 /etc/notix-agent/certs/agent.key
chmod 644 /etc/notix-agent/certs/agent.crt
```

### Configure Agent for TLS
Edit `/etc/notix-agent/config.yaml`:
```yaml
verify_tls: true
tls_cert_path: "/etc/letsencrypt/live/node.yourdomain.com/fullchain.pem"
tls_key_path: "/etc/letsencrypt/live/node.yourdomain.com/privkey.pem"
ca_cert_path: "/etc/letsencrypt/live/node.yourdomain.com/chain.pem"
```

## Minecraft Server Setup

### Java Installation
```bash
# Ubuntu/Debian
apt install -y openjdk-21-jre-headless

# Verify
java -version
# Should show: openjdk version "21" or later
```

### Directory Structure (created by agent)
```
/var/lib/notix-agent/servers/
├── server-id/
│   ├── server.jar
│   ├── server.properties
│   ├── world/
│   ├── plugins/
│   ├── mods/
│   ├── logs/
│   ├── backups/
│   └── .notix-meta.json
```

### Server Properties Template
```properties
# server.properties
server-port=25565
server-ip=0.0.0.0
max-players=20
motd=NOTIXCLOUD Server
online-mode=true
enable-query=false
enable-rcon=false
rcon.password=changeme
rcon.port=25575
```

## DNS Configuration

### A Record
```
Type: A
Name: mc (or your subdomain)
Value: YOUR_VPS_IP
TTL: 300 (or Auto)
```

### SRV Record (for custom port)
```
Type: SRV
Name: _minecraft._tcp.mc
Priority: 0
Weight: 5
Port: 25565
Target: mc.yourdomain.com
```

## Monitoring & Maintenance

### Health Checks
The agent automatically reports:
- CPU, RAM, disk usage
- Network I/O
- Running server count
- Java/Docker versions
- Uptime and load average

### Log Locations
- Agent: `journalctl -u notix-agent -f`
- Minecraft servers: `/var/lib/notix-agent/servers/{id}/logs/`
- System: `/var/log/syslog` or `journalctl`

### Backup Strategy
The agent supports:
- Full world backups (tar.gz)
- Incremental backups (rsync)
- Scheduled backups (cron via agent config)
- Off-site upload (S3, FTP, SFTP)

### Updates
```bash
# System updates
apt update && apt upgrade -y

# Agent updates (automatic via control panel)
# Or manual:
curl -fsSL https://get.notixcloud.com/agent.sh | sh

# Java updates
apt update && apt install -y openjdk-21-jre-headless
```

## Troubleshooting

### Agent Won't Start
```bash
# Check logs
journalctl -u notix-agent -f

# Common issues:
# 1. Config syntax error → validate YAML
# 2. TLS cert missing → check paths in config
# 3. Can't reach panel → check DNS/firewall
# 4. Token expired → re-register agent
```

### Connection Issues
```bash
# Test from control panel server
ssh -i /path/to/key user@vps-ip

# Test agent port
curl -v https://vps-ip:443/health

# Check firewall
ufw status
firewall-cmd --list-all
iptables -L -n
```

### Server Issues
```bash
# Check server logs
/var/lib/notix-agent/servers/{id}/logs/latest.log

# Check resources
free -h
df -h
htop

# Restart server via agent API
curl -X POST https://panel/api/agent/command \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"serverId": "id", "action": "restart"}'
```

## Security Checklist

- [ ] Root SSH login disabled
- [ ] Password authentication disabled
- [ ] SSH on non-standard port
- [ ] Fail2Ban configured
- [ ] Firewall allows only required ports
- [ ] TLS certificates valid and auto-renewing
- [ ] Agent running as non-root user
- [ ] Private keys encrypted at rest
- [ ] Regular security updates scheduled
- [ ] Audit logging enabled

## Support

- Documentation: https://docs.notixcloud.com
- Issues: https://github.com/notixcloud/issues
- Discord: https://discord.gg/notixcloud