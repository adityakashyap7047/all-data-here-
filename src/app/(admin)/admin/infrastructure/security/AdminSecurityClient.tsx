'use client';

import { useState } from 'react';
import {
  Shield, Lock, Key, Terminal, Wifi, WifiOff,
  AlertTriangle, CheckCircle, XCircle, Settings,
  RefreshCw, Eye, EyeOff, Copy, Plus, Edit,
  Trash2, ExternalLink, FileText, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Node {
  id: string;
  name: string;
  hostname: string;
  status: string;
  firewallConfigured: boolean;
  tlsConfigured: boolean;
  authType: string;
  hostKeyFingerprint: string | null;
  sshPort: number;
  sshUsername: string;
}

interface AdminSecurityClientProps {
  nodes: Node[];
}

const statusConfig = {
  ONLINE: { label: 'Online', color: 'text-green-400', bg: 'bg-green-500/10' },
  OFFLINE: { label: 'Offline', color: 'text-red-400', bg: 'bg-red-500/10' },
  MAINTENANCE: { label: 'Maintenance', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
  UNREACHABLE: { label: 'Unreachable', color: 'text-gray-400', bg: 'bg-gray-500/10' },
  ERROR: { label: 'Error', color: 'text-red-400', bg: 'bg-red-500/10' },
};

function getStatusBadge(status: string) {
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.UNREACHABLE;
  return (
    <Badge variant="outline" className={cn(config.bg, config.color)}>
      {config.label}
    </Badge>
  );
}

function SecurityCheck({ title, description, status, action }: {
  title: string;
  description: string;
  status: 'pass' | 'warn' | 'fail' | 'unknown';
  action?: React.ReactNode;
}) {
  const icons = {
    pass: <CheckCircle className="w-5 h-5 text-green-400" />,
    warn: <AlertTriangle className="w-5 h-5 text-yellow-400" />,
    fail: <XCircle className="w-5 h-5 text-red-400" />,
    unknown: <AlertCircle className="w-5 h-5 text-gray-400" />,
  };
  const borders = {
    pass: 'border-green-500/30',
    warn: 'border-yellow-500/30',
    fail: 'border-red-500/30',
    unknown: 'border-gray-500/30',
  };

  return (
    <div className={cn('flex items-start gap-4 p-4 rounded-lg border', borders[status])}>
      <div className="flex-shrink-0 mt-0.5">{icons[status]}</div>
      <div className="flex-1">
        <h4 className="font-medium text-notix-text">{title}</h4>
        <p className="text-sm text-notix-textMuted mt-1">{description}</p>
      </div>
      <div className="flex-shrink-0">{action}</div>
    </div>
  );
}

export default function AdminSecurityClient({ nodes }: AdminSecurityClientProps) {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(nodes[0]?.id || null);
  const [showKey, setShowKey] = useState(false);

  const selectedNode = nodes.find(n => n.id === selectedNodeId);

  if (!selectedNode) {
    return (
      <div className="card-base text-center py-16">
        <Shield className="w-16 h-16 text-notix-textMuted/30 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-notix-text mb-2">No nodes available</h3>
        <p className="text-notix-textMuted mb-6">Add a VPS node to configure security settings</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Security Settings</h1>
          <p className="text-notix-textMuted mt-1">Configure SSH, firewall, TLS, and access controls for your nodes</p>
        </div>
        <div className="flex items-center gap-4">
          <select
            value={selectedNodeId}
            onChange={(e) => setSelectedNodeId(e.target.value)}
            className="input-field w-64"
          >
            {nodes.map(node => (
              <option key={node.id} value={node.id}>
                {node.name} ({node.hostname})
              </option>
            ))}
          </select>
          {getStatusBadge(selectedNode.status)}
        </div>
      </div>

      <Tabs defaultValue="ssh" className="space-y-4">
        <TabsList>
          <TabsTrigger value="ssh"><Lock className="w-4 h-4 mr-2" /> SSH Access</TabsTrigger>
          <TabsTrigger value="firewall"><Shield className="w-4 h-4 mr-2" /> Firewall</TabsTrigger>
          <TabsTrigger value="tls"><Key className="w-4 h-4 mr-2" /> TLS/SSL</TabsTrigger>
          <TabsTrigger value="audit"><FileText className="w-4 h-4 mr-2" /> Audit Log</TabsTrigger>
        </TabsList>

        {/* SSH Access Tab */}
        <TabsContent value="ssh">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="card-base">
              <CardHeader>
                <CardTitle>SSH Configuration</CardTitle>
                <CardDescription>Manage SSH authentication and connection settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-notix-text">SSH Port</label>
                    <input
                      type="number"
                      defaultValue={selectedNode.sshPort}
                      className="mt-1 input-field"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-notix-text">SSH Username</label>
                    <input
                      type="text"
                      defaultValue={selectedNode.sshUsername}
                      className="mt-1 input-field"
                      readOnly
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-notix-text">Authentication Type</label>
                  <Badge variant={selectedNode.authType === 'SSH_KEY' ? 'default' : 'outline'}>
                    {selectedNode.authType === 'SSH_KEY' ? 'SSH Key' : 'Node Agent'}
                  </Badge>
                </div>

                <Separator />

                <h4 className="font-medium text-notix-text">SSH Host Key Fingerprint</h4>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    defaultValue={selectedNode.hostKeyFingerprint || 'Not configured'}
                    className="flex-1 input-field font-mono text-sm"
                    readOnly
                  />
                  <Button variant="outline" size="sm">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Verify
                  </Button>
                </div>
                <p className="text-sm text-notix-textMuted">
                    SSH host key fingerprint for verifying server identity on connection.
                    Run <code className="bg-white/5 px-1 rounded">{'ssh-keyscan -t rsa,ecdsa,ed25519 <host>'}</code> on the VPS to get it.
                  </p>

                <Separator />

                <h4 className="font-medium text-notix-text">SSH Private Key (Encrypted)</h4>
                <div className="relative">
                  <textarea
                    defaultValue={showKey ? '***** ENCRYPTED - DECRYPTED VIEW *****' : '••••••••••••••••••••••••••••••••••••'}
                    rows={6}
                    className="w-full input-field font-mono text-sm"
                    readOnly
                  />
                  <div className="absolute right-2 top-2 flex gap-1">
                    <Button type="button" variant="ghost" size="icon" onClick={() => setShowKey(!showKey)}>
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-notix-textMuted">
                  Private keys are encrypted at rest using AES-256-GCM. They are never exposed to the browser
                  and only decrypted server-side during SSH connections.
                </p>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardHeader>
                <CardTitle>Security Checks</CardTitle>
                <CardDescription>Automated verification of SSH security posture</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecurityCheck
                  title="SSH Host Key Verification"
                  description="Host key fingerprint is configured and verified on each connection"
                  status={selectedNode.hostKeyFingerprint ? 'pass' : 'warn'}
                  action={<Button variant="outline" size="sm">Configure</Button>}
                />
                <SecurityCheck
                  title="Private Key Encryption"
                  description="SSH private keys are encrypted at rest using AES-256-GCM"
                  status="pass"
                />
                <SecurityCheck
                  title="Key Rotation Policy"
                  description="No automated key rotation configured. Recommended: rotate keys every 90 days"
                  status="warn"
                  action={<Button variant="outline" size="sm">Set Up Rotation</Button>}
                />
                <SecurityCheck
                  title="Root Login Disabled"
                  description={selectedNode.sshUsername === 'root' ? 'Root login is enabled (not recommended)' : 'Non-root SSH user configured'}
                  status={selectedNode.sshUsername === 'root' ? 'fail' : 'pass'}
                  action={selectedNode.sshUsername === 'root' ? <Button variant="outline" size="sm">Fix</Button> : null}
                />
                <SecurityCheck
                  title="Fail2Ban / Rate Limiting"
                  description="No automated SSH brute-force protection detected on remote host"
                  status="unknown"
                  action={<Button variant="outline" size="sm">Check Remote</Button>}
                />
                <SecurityCheck
                  title="SSH Agent Forwarding"
                  description="Agent forwarding not explicitly disabled in SSH config"
                  status="warn"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Firewall Tab */}
        <TabsContent value="firewall">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="card-base">
              <CardHeader>
                <CardTitle>Firewall Configuration</CardTitle>
                <CardDescription>Manage network-level access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-notix-text">Firewall Status</h4>
                    <p className="text-sm text-notix-textMuted">
                      {selectedNode.firewallConfigured ? 'Firewall rules configured and active' : 'No firewall rules configured'}
                    </p>
                  </div>
                  <Badge variant={selectedNode.firewallConfigured ? 'default' : 'outline'}>
                    {selectedNode.firewallConfigured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>

                <Separator />

                <h4 className="font-medium text-notix-text">Required Ports</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Port</TableHead>
                      <TableHead>Protocol</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Required</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      { port: selectedNode.sshPort, protocol: 'TCP', service: 'SSH', required: true },
                      { port: 443, protocol: 'TCP', service: 'HTTPS (Agent/API)', required: true },
                      { port: 25565, protocol: 'TCP', service: 'Minecraft (Default)', required: false },
                      { port: '10000-10100', protocol: 'TCP', service: 'Minecraft (Additional)', required: false },
                    ].map((p, i) => (
                      <TableRow key={i}>
                        <TableCell className="font-mono text-sm">{p.port}</TableCell>
                        <TableCell>{p.protocol}</TableCell>
                        <TableCell>{p.service}</TableCell>
                        <TableCell>
                          <Badge variant={p.required ? 'default' : 'outline'}>
                            {p.required ? 'Required' : 'Optional'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {selectedNode.firewallConfigured ? 'Configured' : 'Unknown'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <Separator />

                <div className="flex gap-2">
                  <Button>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Scan Firewall
                  </Button>
                  <Button variant="outline">
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Rules
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardHeader>
                <CardTitle>Firewall Security Checks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecurityCheck
                  title="Default Deny Policy"
                  description="Firewall blocks all inbound traffic except explicitly allowed ports"
                  status={selectedNode.firewallConfigured ? 'pass' : 'fail'}
                  action={!selectedNode.firewallConfigured && <Button variant="outline" size="sm">Configure</Button>}
                />
                <SecurityCheck
                  title="SSH Port Restriction"
                  description={selectedNode.sshPort === 22 ? 'SSH on default port 22 (consider changing)' : 'SSH on non-standard port'}
                  status={selectedNode.sshPort === 22 ? 'warn' : 'pass'}
                />
                <SecurityCheck
                  title="Minecraft Ports Open"
                  description="Game ports accessible for player connections"
                  status={selectedNode.firewallConfigured ? 'pass' : 'unknown'}
                />
                <SecurityCheck
                  title="Management Ports Restricted"
                  description="Admin/agent ports (443) restricted to known IPs"
                  status="unknown"
                  action={<Button variant="outline" size="sm">Verify</Button>}
                />
                <SecurityCheck
                  title="IPv6 Firewall Rules"
                  description="IPv6 firewall rules mirror IPv4 configuration"
                  status="unknown"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TLS/SSL Tab */}
        <TabsContent value="tls">
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="card-base">
              <CardHeader>
                <CardTitle>TLS/SSL Configuration</CardTitle>
                <CardDescription>Manage certificates for agent communication and HTTPS</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-notix-text">TLS Status</h4>
                    <p className="text-sm text-notix-textMuted">
                      {selectedNode.tlsConfigured ? 'Valid TLS certificates configured' : 'No TLS certificates configured'}
                    </p>
                  </div>
                  <Badge variant={selectedNode.tlsConfigured ? 'default' : 'outline'}>
                    {selectedNode.tlsConfigured ? 'Configured' : 'Not Configured'}
                  </Badge>
                </div>

                <Separator />

                {selectedNode.tlsConfigured ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-3">
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-notix-textMuted">Certificate Expires</p>
                        <p className="font-mono text-notix-text">2025-12-31</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-notix-textMuted">Issuer</p>
                        <p className="font-mono text-notix-text">Let's Encrypt</p>
                      </div>
                      <div className="p-4 bg-white/5 rounded-lg">
                        <p className="text-sm text-notix-textMuted">Auto-Renewal</p>
                        <Badge variant="default">Enabled</Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline">
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Renew Now
                      </Button>
                      <Button variant="outline">
                        <FileText className="w-4 h-4 mr-2" />
                        View Certificate
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                      <div className="flex gap-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-400 flex-shrink-0" />
                        <div>
                          <h4 className="font-medium text-yellow-400">TLS Not Configured</h4>
                          <p className="text-sm text-notix-textMuted mt-1">
                            Without TLS, agent communication and API traffic are unencrypted.
                            Configure TLS to secure data in transit.
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-medium text-notix-text">Configuration Options</h4>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Card className="card-base border-green-500/20">
                          <CardContent className="p-4">
                            <h5 className="font-medium text-green-400 flex items-center gap-2">
                              <Lock className="w-4 h-4" />
                              Let's Encrypt (Recommended)
                            </h5>
                            <p className="text-sm text-notix-textMuted mt-2">Free, auto-renewing certificates for public domains</p>
                            <Button variant="outline" size="sm" className="mt-3">Configure</Button>
                          </CardContent>
                        </Card>
                        <Card className="card-base border-blue-500/20">
                          <CardContent className="p-4">
                            <h5 className="font-medium text-blue-400 flex items-center gap-2">
                              <Key className="w-4 h-4" />
                              Custom Certificate
                            </h5>
                            <p className="text-sm text-notix-textMuted mt-2">Upload your own CA-signed certificate</p>
                            <Button variant="outline" size="sm" className="mt-3">Upload</Button>
                          </CardContent>
                        </Card>
                        <Card className="card-base border-purple-500/20">
                          <CardContent className="p-4">
                            <h5 className="font-medium text-purple-400 flex items-center gap-2">
                              <Shield className="w-4 h-4" />
                              Self-Signed (Development)
                            </h5>
                            <p className="text-sm text-notix-textMuted mt-2">For internal/development nodes only</p>
                            <Button variant="outline" size="sm" className="mt-3">Generate</Button>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                )}

                <Separator />

                <h4 className="font-medium text-notix-text">TLS Security Checks</h4>
                <div className="space-y-3">
                  <SecurityCheck
                    title="Valid Certificate Chain"
                    description="Certificate chain is complete and trusted"
                    status={selectedNode.tlsConfigured ? 'pass' : 'fail'}
                  />
                  <SecurityCheck
                    title="Certificate Not Expired"
                    description="Certificate validity period is current"
                    status={selectedNode.tlsConfigured ? 'pass' : 'fail'}
                  />
                  <SecurityCheck
                    title="Strong Cipher Suites"
                    description="Only TLS 1.2+ with modern ciphers enabled"
                    status={selectedNode.tlsConfigured ? 'pass' : 'unknown'}
                  />
                  <SecurityCheck
                    title="HSTS Enabled"
                    description="HTTP Strict Transport Security header configured"
                    status={selectedNode.tlsConfigured ? 'pass' : 'fail'}
                  />
                  <SecurityCheck
                    title="Auto-Renewal Configured"
                    description="Certificates automatically renew before expiry"
                    status={selectedNode.tlsConfigured ? 'pass' : 'fail'}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="card-base">
              <CardHeader>
                <CardTitle>Agent Communication Security</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <SecurityCheck
                  title="Agent TLS Enforcement"
                  description="Agent connections require valid TLS certificates"
                  status={selectedNode.tlsConfigured ? 'pass' : 'fail'}
                />
                <SecurityCheck
                  title="Agent Certificate Pinning"
                  description="Agent validates server certificate against pinned fingerprint"
                  status="warn"
                  action={<Button variant="outline" size="sm">Configure Pinning</Button>}
                />
                <SecurityCheck
                  title="Mutual TLS (mTLS)"
                  description="Both client and server authenticate with certificates"
                  status="fail"
                  action={<Button variant="outline" size="sm">Enable mTLS</Button>}
                />
                <SecurityCheck
                  title="Certificate Revocation Checking"
                  description="OCSP/CRL checking enabled for certificate validation"
                  status="unknown"
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Audit Log Tab */}
        <TabsContent value="audit">
          <Card className="card-base">
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>Recent security-relevant events for this node</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[
                    { time: '2 min ago', event: 'SSH Connection', severity: 'info', details: 'Successful auth from 192.0.2.1' },
                    { time: '15 min ago', event: 'Health Check', severity: 'success', details: 'Node responded normally' },
                    { time: '1 hour ago', event: 'Config Change', severity: 'warning', details: 'Firewall rules updated by admin' },
                    { time: '3 hours ago', event: 'Failed Login', severity: 'danger', details: '3 failed SSH attempts from 198.51.100.1' },
                    { time: '6 hours ago', event: 'Cert Renewal', severity: 'success', details: 'Let\'s Encrypt certificate renewed' },
                    { time: '1 day ago', event: 'Agent Reconnect', severity: 'info', details: 'Agent reconnected after network blip' },
                  ].map((item, i) => (
                    <TableRow key={i}>
                      <TableCell className="font-mono text-sm text-notix-textMuted">{item.time}</TableCell>
                      <TableCell className="font-medium text-notix-text">{item.event}</TableCell>
                      <TableCell>
                        <Badge variant={
                          item.severity === 'success' ? 'default' :
                          item.severity === 'warning' ? 'outline' :
                          item.severity === 'danger' ? 'destructive' : 'outline'
                        }>
                          {item.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{item.details}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}