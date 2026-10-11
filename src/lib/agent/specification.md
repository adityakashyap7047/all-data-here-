# NOTIXCLOUD Node Agent Specification

## Overview

The NOTIXCLOUD Node Agent is a lightweight, secure daemon that runs on each VPS node to facilitate secure, authenticated communication with the control panel. It replaces direct SSH command execution with a controlled, auditable API.

## Architecture

```
┌─────────────────┐     HTTPS/TLS      ┌──────────────────┐
│  Control Panel  │ ◄─────────────────► │   Node Agent     │
│   (Next.js)     │   Mutual TLS       │   (Go/Rust)      │
└─────────────────┘                    └──────────────────┘
        │                                      │
        │         Encrypted Commands           │
        ▼                                      ▼
┌─────────────────┐                    ┌──────────────────┐
│  PostgreSQL     │                    │  Minecraft       │
│  (Audit Log)    │                    │  Server Processes│
└─────────────────┘                    └──────────────────┘
```

## Security Model

### Authentication
- **Mutual TLS (mTLS)**: Both client and server present certificates
- **Per-Node Credentials**: Each node has unique certificate/key pair
- **Agent Token**: Short-lived JWT for API authentication (rotated periodically)
- **Certificate Pinning**: Agent validates control panel certificate fingerprint

### Authorization
- **Least Privilege**: Agent runs as dedicated non-root user (`notix-agent`)
- **Command Allowlist**: Only pre-approved commands can be executed
- **Resource Quotas**: CPU, RAM, disk limits enforced per server
- **Network Isolation**: Agent only connects to control panel (egress only)

### Data Protection
- **Encryption in Transit**: TLS 1.3 for all communication
- **Encryption at Rest**: Sensitive configs encrypted with AES-256-GCM
- **No Secrets in Logs**: Private keys, tokens redacted from all output
- **Audit Trail**: All commands and results logged with timestamps

## Communication Protocol

### Transport
- **Protocol**: HTTPS with mTLS
- **Port**: 443 (configurable)
- **Keep-Alive**: Enabled with 30s heartbeat

### Registration Flow
```
1. Admin adds node in control panel → generates agent token
2. Admin runs installation script on VPS
3. Agent starts → POST /agent/register with node info + public key
4. Control panel validates → returns agent token + config
5. Agent stores token securely → begins heartbeat loop
```

### Heartbeat Loop
```
Every 30s (configurable):
1. Collect system metrics (CPU, RAM, disk, network)
2. POST /agent/health with metrics + running server list
3. Receive pending commands + config updates
4. Execute commands sequentially
4. POST /agent/command-result for each completed command
```

### Command Execution
```
Control Panel → POST /agent/command (queued)
                    ↓
Agent picks up on next heartbeat
                    ↓
Validate command against allowlist
                    ↓
Execute with timeout + resource limits
                    ↓
Stream stdout/stderr to control panel (if requested)
                    ↓
POST /agent/command-result with exit code + output
```

## API Endpoints

### Agent → Control Panel

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/agent/register` | Register new node |
| POST | `/api/agent/health` | Send heartbeat + metrics |
| POST | `/api/agent/command-result` | Report command completion |
| POST | `/api/agent/events` | Stream events (startup, errors, etc.) |

### Control Panel → Agent

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agent/commands` | Get pending commands (long-poll) |
| POST | `/api/agent/config` | Push config updates |
| POST | `/api/agent/revoke` | Revoke agent (force shutdown) |

## Data Structures

See `src/lib/agent/types.ts` for TypeScript definitions.

## Installation

### Automated (Recommended)
```bash
curl -fsSL https://get.notixcloud.com/agent.sh | sh
```

### Manual
1. Download binary for your architecture
2. Create `/etc/notix-agent/config.yaml`
3. Create systemd service
4. Start and enable service

### Configuration (`/etc/notix-agent/config.yaml`)
```yaml
node_id: "auto"  # or specific ID
control_panel_url: "https://panel.notixcloud.com"
agent_token: "eyJhbGciOiJSUzI1NiIs..."
verify_tls: true
tls_cert_path: "/etc/notix-agent/certs/agent.crt"
tls_key_path: "/etc/notix-agent/certs/agent.key"
ca_cert_path: "/etc/notix-agent/certs/ca.crt"
heartbeat_interval: 30000
command_timeout: 300000
log_level: "info"
data_dir: "/var/lib/notix-agent"
servers_dir: "/var/lib/notix-agent/servers"
backups_dir: "/var/lib/notix-agent/backups"
temp_dir: "/tmp/notix-agent"
max_concurrent_operations: 3
```

## Server Management

### Directory Structure
```
/var/lib/notix-agent/
├── servers/
│   └── {server-id}/
│       ├── server.jar
│       ├── server.properties
│       ├── world/
│       ├── plugins/
│       ├── mods/
│       ├── logs/
│       ├── backups/
│       └── .notix-meta.json
├── backups/
├── temp/
└── agent.log
```

### Process Management
- Each Minecraft server runs as child process of agent
- Agent monitors process health, restarts on crash (if configured)
- Resource limits enforced via cgroups (if available) or `ulimit`
- Graceful shutdown: SIGTERM → wait 30s → SIGKILL

## Security Hardening

### On the VPS
```bash
# Create dedicated user
useradd -r -s /bin/false -d /var/lib/notix-agent notix-agent

# Set up directories
mkdir -p /var/lib/notix-agent/{servers,backups,temp}
chown -R notix-agent:notix-agent /var/lib/notix-agent
chmod 700 /var/lib/notix-agent

# Configure sudoers for specific commands (if needed)
echo 'notix-agent ALL=(ALL) NOPASSWD: /bin/systemctl start minecraft-*, /bin/systemctl stop minecraft-*' > /etc/sudoers.d/notix-agent
```

### Network
- Agent only initiates outbound connections to control panel
- No inbound ports required on VPS
- All traffic over TLS 1.3
- Optional: Restrict control panel IP via firewall

### Audit
- All commands logged with: timestamp, command, args, exit code, duration, stdout/stderr (truncated)
- Events streamed to control panel for centralized audit log
- Tamper-evident logging (append-only, signed)

## Development vs Production Nodes

| Feature | Development | Production |
|---------|-------------|------------|
| Host Key Verification | Optional | Required |
| TLS Verification | Optional | Required |
| Resource Metrics | Simulated | Real |
| Auto-Update | Disabled | Optional |
| Debug Logging | Enabled | Configurable |
| Resource Limits | Advisory | Enforced |

## Monitoring & Alerting

### Metrics Collected
- CPU usage (%)
- RAM usage (MB)
- Disk usage (MB)
- Network I/O (bytes/s)
- Load average
- Process count
- Uptime

### Alerts
- Node offline > 5 minutes
- CPU > 90% for 5 minutes
- RAM > 90% for 5 minutes
- Disk > 90%
- Command failure rate > 10%
- Agent version mismatch

## Updates

### Agent Self-Update
1. Control panel pushes new version metadata
2. Agent downloads and verifies signature
3. Agent replaces binary atomically
4. Agent restarts with new version

### Configuration Updates
- Pushed via health check response
- Applied without restart (most settings)
- Restart required for: TLS certs, network changes

## Troubleshooting

### Agent Won't Start
- Check config file syntax
- Verify TLS cert/key paths
- Verify control panel URL reachable
- Check logs: `journalctl -u notix-agent -f`

### Commands Timeout
- Increase `command_timeout` in config
- Check server process not hung
- Verify resource limits not too restrictive

### Connection Issues
- Verify control panel URL and port
- Check TLS certificates valid
- Verify firewall allows outbound 443
- Check system time synchronized (NTP)

## Future Enhancements

- [ ] WebSocket support for real-time command streaming
- [ ] Plugin/mod management API
- [ ] World backup/restore with compression
- [ ] Scheduled tasks (backups, restarts)
- [ ] Multi-panel support (HA)
- [ ] Prometheus metrics endpoint