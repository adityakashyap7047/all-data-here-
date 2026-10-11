'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Server, Key, Terminal, CheckCircle, AlertCircle, XCircle,
  ChevronLeft, ChevronRight, Loader2, Shield, Network,
  HardDrive, Cpu, Database, Settings, Eye, EyeOff, Copy,
  Check, HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

const steps = [
  { id: 'basics', title: 'Basics', description: 'Node name, hostname, SSH port' },
  { id: 'auth', title: 'Authentication', description: 'SSH username, key, host fingerprint' },
  { id: 'verify', title: 'Verification', description: 'Test connection and verify resources' },
  { id: 'register', title: 'Register', description: 'Finalize and register the node' },
];

const osOptions = [
  { value: 'ubuntu-22.04', label: 'Ubuntu 22.04 LTS' },
  { value: 'ubuntu-24.04', label: 'Ubuntu 24.04 LTS' },
  { value: 'debian-12', label: 'Debian 12 (Bookworm)' },
  { value: 'debian-11', label: 'Debian 11 (Bullseye)' },
  { value: 'centos-9', label: 'CentOS Stream 9' },
  { value: 'almalinux-9', label: 'AlmaLinux 9' },
  { value: 'rockylinux-9', label: 'Rocky Linux 9' },
  { value: 'fedora-39', label: 'Fedora 39' },
  { value: 'arch', label: 'Arch Linux' },
  { value: 'other', label: 'Other / Custom' },
];

export default function AdminAddVPSClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [collapsed, setCollapsed] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    hostname: '',
    sshPort: '22',
    sshUsername: 'root',
    authType: 'SSH_KEY',
    sshPrivateKey: '',
    sshPublicKey: '',
    hostKeyFingerprint: '',
    nodeType: 'PRODUCTION',
    verifyHostKey: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: any } | null>(null);
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<{ success: boolean; nodeId?: string; message: string } | null>(null);

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!formData.name.trim()) newErrors.name = 'Node name is required';
      if (!formData.hostname.trim()) newErrors.hostname = 'Hostname or IP address is required';
      const port = parseInt(formData.sshPort);
      if (isNaN(port) || port < 1 || port > 65535) newErrors.sshPort = 'Valid SSH port (1-65535) required';
    }

    if (step === 1) {
      if (!formData.sshUsername.trim()) newErrors.sshUsername = 'SSH username is required';
      if (formData.authType === 'SSH_KEY' && !formData.sshPrivateKey.trim()) {
        newErrors.sshPrivateKey = 'SSH private key is required for key-based authentication';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
      setTestResult(null);
      setErrors({});
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setTestResult(null);
    setErrors({});
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const next = { ...prev }; delete next[field]; return next; });
    }
  };

  const handleTestConnection = async () => {
    if (!validateStep(1)) return;

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/admin/infrastructure/nodes/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hostname: formData.hostname,
          sshPort: parseInt(formData.sshPort),
          sshUsername: formData.sshUsername,
          sshPrivateKey: formData.sshPrivateKey,
          hostKeyFingerprint: formData.hostKeyFingerprint || undefined,
          verifyHostKey: formData.verifyHostKey,
        }),
      });

      const result = await response.json();
      setTestResult({ success: response.ok, message: result.message || 'Test completed', details: result.details });
    } catch (err) {
      setTestResult({ success: false, message: 'Connection test failed', details: err });
    } finally {
      setIsTesting(false);
    }
  };

  const handleRegister = async () => {
    if (!validateStep(2)) return;

    setIsRegistering(true);
    setRegistrationResult(null);

    try {
      const response = await fetch('/api/admin/infrastructure/nodes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          hostname: formData.hostname,
          sshPort: parseInt(formData.sshPort),
          sshUsername: formData.sshUsername,
          authType: formData.authType,
          sshPrivateKey: formData.sshPrivateKey,
          sshPublicKey: formData.sshPublicKey || undefined,
          hostKeyFingerprint: formData.hostKeyFingerprint || undefined,
          nodeType: formData.nodeType,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        setRegistrationResult({ success: true, nodeId: result.id, message: 'Node registered successfully' });
      } else {
        setRegistrationResult({ success: false, message: result.error?.message || 'Registration failed' });
      }
    } catch (err) {
      setRegistrationResult({ success: false, message: 'Registration failed' });
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="name" className="block text-sm font-medium text-notix-text">Node Name *</Label>
              <Input
                id="name"
                placeholder="e.g., production-node-1"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={cn('mt-1', errors.name && 'border-red-500 focus:border-red-500')}
                disabled={currentStep > 0}
              />
              {errors.name && <p className="mt-1 text-sm text-red-400">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="hostname" className="block text-sm font-medium text-notix-text">Hostname or IP Address *</Label>
              <Input
                id="hostname"
                placeholder="e.g., 192.0.2.1 or vps.example.com"
                value={formData.hostname}
                onChange={(e) => handleInputChange('hostname', e.target.value)}
                className={cn('mt-1', errors.hostname && 'border-red-500 focus:border-red-500')}
                disabled={currentStep > 0}
              />
              {errors.hostname && <p className="mt-1 text-sm text-red-400">{errors.hostname}</p>}
              <p className="mt-1 text-sm text-notix-textMuted">
                Enter the public IP address or fully qualified domain name of your VPS.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="sshPort" className="block text-sm font-medium text-notix-text">SSH Port *</Label>
                <Input
                  id="sshPort"
                  type="number"
                  min="1"
                  max="65535"
                  value={formData.sshPort}
                  onChange={(e) => handleInputChange('sshPort', e.target.value)}
                  className={cn('mt-1', errors.sshPort && 'border-red-500 focus:border-red-500')}
                  disabled={currentStep > 0}
                />
                {errors.sshPort && <p className="mt-1 text-sm text-red-400">{errors.sshPort}</p>}
              </div>

              <div>
                <Label htmlFor="nodeType" className="block text-sm font-medium text-notix-text">Node Type *</Label>
                <Select value={formData.nodeType} onValueChange={(v) => handleInputChange('nodeType', v)} disabled={currentStep > 0}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select node type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PRODUCTION">Production — Full verification, production workloads</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development — Limited verification, testing only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className="card-base border-yellow-500/20">
              <CardContent className="p-4">
                <div className="flex gap-3">
                  <HelpCircle className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-notix-textMuted">
                    <p className="font-medium text-yellow-400 mb-1">Development Node Limitations</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>No SSH host-key verification enforced</li>
                      <li>Resource metrics may be simulated</li>
                      <li>Not suitable for production Minecraft servers</li>
                      <li>Background processes may be terminated by OS</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div>
              <Label htmlFor="sshUsername" className="block text-sm font-medium text-notix-text">SSH Username *</Label>
              <Input
                id="sshUsername"
                placeholder="e.g., root, ubuntu, admin"
                value={formData.sshUsername}
                onChange={(e) => handleInputChange('sshUsername', e.target.value)}
                className={cn('mt-1', errors.sshUsername && 'border-red-500 focus:border-red-500')}
                disabled={currentStep > 1}
              />
              {errors.sshUsername && <p className="mt-1 text-sm text-red-400">{errors.sshUsername}</p>}
            </div>

            <div>
              <Label className="block text-sm font-medium text-notix-text">Authentication Method *</Label>
              <Select value={formData.authType} onValueChange={(v) => handleInputChange('authType', v)} disabled={currentStep > 1}>
                <SelectTrigger>
                  <SelectValue placeholder="Select authentication method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SSH_KEY">SSH Private Key (Recommended)</SelectItem>
                  <SelectItem value="AGENT">Node Agent (Install agent on VPS)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.authType === 'SSH_KEY' && (
              <>
                <div>
                  <Label htmlFor="sshPrivateKey" className="block text-sm font-medium text-notix-text">SSH Private Key *</Label>
                  <div className="relative mt-1">
                    <Textarea
                      id="sshPrivateKey"
                      placeholder="-----BEGIN OPENSSH PRIVATE KEY-----\n...\n-----END OPENSSH PRIVATE KEY-----"
                      value={formData.sshPrivateKey}
                      onChange={(e) => handleInputChange('sshPrivateKey', e.target.value)}
                      rows={8}
                      className={cn(
                        'font-mono text-sm',
                        !showPrivateKey && 'font-mono',
                        errors.sshPrivateKey && 'border-red-500 focus:border-red-500'
                      )}
                      disabled={currentStep > 1}
                    />
                    <div className="absolute right-2 top-2 flex gap-1">
                      <Button type="button" variant="ghost" size="icon" onClick={() => setShowPrivateKey(!showPrivateKey)}>
                        {showPrivateKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button type="button" variant="ghost" size="icon" onClick={() => copyToClipboard(formData.sshPrivateKey)}>
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {errors.sshPrivateKey && <p className="mt-1 text-sm text-red-400">{errors.sshPrivateKey}</p>}
                  <p className="mt-1 text-sm text-notix-textMuted">
                    Paste your OpenSSH private key. It will be encrypted at rest and never exposed to the browser.
                  </p>
                </div>

                <div>
                  <Label htmlFor="sshPublicKey" className="block text-sm font-medium text-notix-text">SSH Public Key (Optional)</Label>
                  <Textarea
                    id="sshPublicKey"
                    placeholder="ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAI..."
                    value={formData.sshPublicKey}
                    onChange={(e) => handleInputChange('sshPublicKey', e.target.value)}
                    rows={3}
                    className="mt-1 font-mono text-sm"
                    disabled={currentStep > 1}
                  />
                  <p className="mt-1 text-sm text-notix-textMuted">
                    If provided, used for agent registration. Otherwise derived from private key.
                  </p>
                </div>

                <div>
                  <Label htmlFor="hostKeyFingerprint" className="block text-sm font-medium text-notix-text">SSH Host Key Fingerprint (Optional)</Label>
                  <Input
                    id="hostKeyFingerprint"
                    placeholder="SHA256:xxx... or MD5:xx:xx:xx:..."
                    value={formData.hostKeyFingerprint}
                    onChange={(e) => handleInputChange('hostKeyFingerprint', e.target.value)}
                    className="mt-1"
                    disabled={currentStep > 1}
                  />
                  <p className="mt-1 text-sm text-notix-textMuted">
                    SSH host key fingerprint for verification. Run <code className="bg-white/5 px-1 rounded">{'ssh-keyscan -t rsa,ecdsa,ed25519 <host>'}</code> on the VPS to get it.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    id="verifyHostKey"
                    checked={formData.verifyHostKey}
                    onCheckedChange={(checked) => handleInputChange('verifyHostKey', checked.toString())}
                    disabled={currentStep > 1}
                  />
                  <Label htmlFor="verifyHostKey" className="text-sm text-notix-text cursor-pointer">
                    Verify SSH host key on connection (Recommended)
                  </Label>
                </div>
              </>
            )}

            {formData.authType === 'AGENT' && (
              <Card className="card-base border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-notix-textMuted">
                      <p className="font-medium text-blue-400 mb-1">Node Agent Authentication</p>
                      <p>Install the NOTIXCLOUD Node Agent on your VPS. The agent will register itself and maintain a persistent connection.</p>
                      <pre className="mt-2 bg-white/5 p-3 rounded text-xs overflow-x-auto"><code>curl -fsSL https://get.notixcloud.com/agent.sh | sh</code></pre>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex gap-3">
              <Server className="w-8 h-8 text-notix-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-notix-text">Connection Test</h3>
                <p className="text-sm text-notix-textMuted">Verify SSH connectivity and VPS resources before registering.</p>
              </div>
            </div>

            <Button
              onClick={handleTestConnection}
              disabled={isTesting || formData.authType === 'AGENT'}
              className="w-full sm:w-auto"
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing Connection...
                </>
              ) : (
                <>
                  <Terminal className="w-4 h-4 mr-2" />
                  Test SSH Connection
                </>
              )}
            </Button>

            {formData.authType === 'AGENT' && (
              <p className="text-sm text-notix-textMuted">
                Connection test not available for Agent mode. The agent will register itself after installation.
              </p>
            )}

            {testResult && (
              <Card className={cn('card-base', testResult.success ? 'border-green-500/20' : 'border-red-500/20')}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {testResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={cn('font-medium', testResult.success ? 'text-green-400' : 'text-red-400')}>
                        {testResult.message}
                      </p>
                      {testResult.details && (
                        <pre className="mt-2 bg-white/5 p-3 rounded text-xs overflow-x-auto text-notix-textMuted">
                          {JSON.stringify(testResult.details, null, 2)}
                        </pre>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {testResult?.success && (
              <Card className="card-base border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Network className="w-5 h-5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-400 mb-2">Next Steps</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-notix-textMuted">
                        <li>Review the connection test results above</li>
                        <li>Verify the detected OS, CPU, RAM, and disk match expectations</li>
                        <li>Click "Register Node" to complete the setup</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!testResult?.success && testResult && (
              <Card className="card-base border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-400 mb-2">Common Issues</p>
                      <ul className="list-disc list-inside space-y-1 text-sm text-notix-textMuted">
                        <li>Verify the hostname/IP is correct and reachable</li>
                        <li>Check SSH port is open (default 22)</li>
                        <li>Ensure the private key matches the authorized_keys on the VPS</li>
                        <li>Check host key fingerprint if verification is enabled</li>
                        <li>Verify firewall allows inbound SSH from this panel</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex gap-3">
              <Shield className="w-8 h-8 text-notix-accent flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium text-notix-text">Register Node</h3>
                <p className="text-sm text-notix-textMuted">Finalize registration and add the node to your infrastructure.</p>
              </div>
            </div>

            <Card className="card-base">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">Node Name</span>
                  <span className="font-medium text-notix-text">{formData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">Hostname</span>
                  <span className="font-mono text-sm text-notix-text">{formData.hostname}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">SSH Port</span>
                  <span className="text-notix-text">{formData.sshPort}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">SSH Username</span>
                  <span className="text-notix-text">{formData.sshUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">Auth Type</span>
                  <Badge variant="outline">{formData.authType}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-notix-textMuted">Node Type</span>
                  <Badge variant={formData.nodeType === 'PRODUCTION' ? 'default' : 'outline'}>
                    {formData.nodeType}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleRegister}
              disabled={isRegistering || (formData.authType === 'SSH_KEY' && !testResult?.success)}
              className="w-full sm:w-auto"
              size="lg"
            >
              {isRegistering ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Registering Node...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Register Node
                </>
              )}
            </Button>

            {registrationResult && (
              <Card className={cn('card-base', registrationResult.success ? 'border-green-500/20' : 'border-red-500/20')}>
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    {registrationResult.success ? (
                      <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    )}
                    <div>
                      <p className={cn('font-medium', registrationResult.success ? 'text-green-400' : 'text-red-400')}>
                        {registrationResult.message}
                      </p>
                      {registrationResult.success && (
                        <div className="mt-3 flex gap-2">
                          <Button asChild variant="default">
                            <Link href={`/admin/infrastructure/nodes/${registrationResult.nodeId}`}>
                              View Node Details
                            </Link>
                          </Button>
                          <Button asChild variant="outline">
                            <Link href="/admin/infrastructure/add">
                              Add Another Node
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {!testResult?.success && formData.authType === 'SSH_KEY' && (
              <p className="text-sm text-red-400">
                Please run a successful connection test before registering.
              </p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-notix-text">Add VPS Node</h1>
        <p className="text-notix-textMuted mt-1">Register a new infrastructure node for Minecraft hosting</p>
      </div>

      {/* Progress Steps */}
      <div className="relative">
        <div className="absolute top-6 left-0 right-0 h-1 bg-white/5" />
        {steps.map((step, index) => (
          <div key={step.id} className="relative flex items-center">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium z-10 transition-all',
                index < currentStep
                  ? 'bg-green-500 text-white'
                  : index === currentStep
                  ? 'bg-notix-accent text-white'
                  : 'bg-white/5 text-notix-textMuted'
              )}
            >
              {index < currentStep ? <Check className="w-5 h-5" /> : index + 1}
            </div>
            {!collapsed && (
              <div className="absolute left-16 right-16 top-6 h-1 bg-white/5" />
            )}
            <div className={cn('absolute left-1/2 -translate-x-1/2 top-20 text-center w-32', collapsed && 'hidden')}>
              <p className={cn('text-sm font-medium', index <= currentStep ? 'text-notix-text' : 'text-notix-textMuted')}>
                {step.title}
              </p>
              <p className="text-xs text-notix-textMuted">{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="h-16" />

      {/* Step Content */}
      <Card className="card-base">
        <CardHeader>
          <CardTitle>{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 0}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        {currentStep < steps.length - 1 ? (
          <Button onClick={handleNext}>
            Next <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}