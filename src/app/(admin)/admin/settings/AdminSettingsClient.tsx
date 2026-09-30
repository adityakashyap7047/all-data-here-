'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Loader2,
  Save,
  RefreshCw,
  Shield,
  Globe,
  Mail,
  CreditCard,
  Server,
  Database,
  Settings,
  Bell,
  Key,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

interface SettingData {
  id: string;
  key: string;
  value: any;
  category: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AdminSettingsClientProps {
  initialSettings: Record<string, SettingData[]>;
}

const settingSchemas: Record<string, z.ZodObject<any>> = {
  general: z.object({
    siteName: z.string().min(1),
    siteUrl: z.string().url(),
    supportEmail: z.string().email(),
    defaultLanguage: z.string(),
    maintenanceMode: z.boolean(),
  }),
  email: z.object({
    smtpHost: z.string(),
    smtpPort: z.number(),
    smtpUser: z.string(),
    smtpPass: z.string(),
    fromEmail: z.string().email(),
    fromName: z.string(),
  }),
  payment: z.object({
    stripeEnabled: z.boolean(),
    stripePublishableKey: z.string(),
    stripeSecretKey: z.string(),
    stripeWebhookSecret: z.string(),
    paypalEnabled: z.boolean(),
    paypalClientId: z.string(),
    paypalSecret: z.string(),
  }),
  security: z.object({
    jwtSecret: z.string(),
    jwtExpiry: z.string(),
    bcryptRounds: z.number(),
    rateLimitEnabled: z.boolean(),
    rateLimitWindow: z.number(),
    rateLimitMax: z.number(),
    twoFactorRequired: z.boolean(),
  }),
  vps: z.object({
    defaultOs: z.string(),
    defaultBackup: z.boolean(),
    provisionTimeout: z.number(),
    maxInstancesPerUser: z.number(),
  }),
  notifications: z.object({
    emailNotifications: z.boolean(),
    slackWebhook: z.string().optional(),
    discordWebhook: z.string().optional(),
  }),
};

type CategoryKey = keyof typeof settingSchemas;

function SettingsForm({ category, settings, onSave, loading }: {
  category: CategoryKey;
  settings: SettingData[];
  onSave: (data: any) => void;
  loading: boolean;
}) {
  const schema = settingSchemas[category];
  const defaultValues = settings.reduce((acc, s) => {
    try {
      acc[s.key] = typeof s.value === 'string' ? JSON.parse(s.value) : s.value;
    } catch {
      acc[s.key] = s.value;
    }
    return acc;
  }, {} as Record<string, any>);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const handleSubmit = (data: any) => {
    onSave(data);
  };

  const getIcon = (cat: CategoryKey) => {
    const icons: Record<CategoryKey, React.ReactNode> = {
      general: <Globe className="h-5 w-5" />,
      email: <Mail className="h-5 w-5" />,
      payment: <CreditCard className="h-5 w-5" />,
      security: <Shield className="h-5 w-5" />,
      vps: <Server className="h-5 w-5" />,
      notifications: <Bell className="h-5 w-5" />,
    };
    return icons[cat] || <Settings className="h-5 w-5" />;
  };

  const renderField = (key: string, fieldSchema: z.ZodTypeAny) => {
    const fieldType = fieldSchema._def.typeName;
    const value = form.watch(key);

    switch (fieldType) {
      case 'ZodBoolean':
        return (
          <div className="flex items-center gap-3">
            <Switch
              checked={value}
              onCheckedChange={(checked) => form.setValue(key, checked)}
              id={key}
            />
            <Label htmlFor={key} className="text-sm font-medium text-notix-text cursor-pointer">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </Label>
          </div>
        );
      case 'ZodNumber':
        return (
          <div>
            <Label htmlFor={key} className="text-sm font-medium text-notix-textMuted">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <Input
              type="number"
              id={key}
              {...form.register(key)}
              className="mt-1"
            />
            {form.formState.errors[key] && (
              <p className="text-sm text-red-400 mt-1">{String(form.formState.errors[key]?.message ?? 'Invalid value')}</p>
            )}
          </div>
        );
      case 'ZodString':
        const isPassword = key.toLowerCase().includes('pass') || key.toLowerCase().includes('secret') || key.toLowerCase().includes('key');
        const isEmail = key.toLowerCase().includes('email');
        const isUrl = key.toLowerCase().includes('url') || key.toLowerCase().includes('webhook');
        return (
          <div>
            <Label htmlFor={key} className="text-sm font-medium text-notix-textMuted">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <Input
              type={isPassword ? 'password' : isEmail ? 'email' : 'text'}
              id={key}
              {...form.register(key)}
              className="mt-1"
              placeholder={isUrl ? 'https://...' : ''}
            />
            {form.formState.errors[key] && (
              <p className="text-sm text-red-400 mt-1">{String(form.formState.errors[key]?.message ?? 'Invalid value')}</p>
            )}
          </div>
        );
      default:
        return (
          <div>
            <Label htmlFor={key} className="text-sm font-medium text-notix-textMuted">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
            </Label>
            <Input id={key} {...form.register(key)} className="mt-1" />
          </div>
        );
    }
  };

  const fields = Object.keys(defaultValues);

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => {
          const fieldSchema = schema.shape[field as keyof typeof schema.shape];
          return <div key={field}>{fieldSchema && renderField(field, fieldSchema)}</div>;
        })}
      </div>
      <div className="flex justify-end pt-4 border-t border-white/10">
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </Button>
      </div>
    </form>
  );
}

export default function AdminSettingsClient({ initialSettings }: AdminSettingsClientProps) {
  const [settings, setSettings] = React.useState<Record<string, SettingData[]>>(initialSettings);
  const [loading, setLoading] = React.useState<string | null>(null);

  const handleSave = async (category: CategoryKey, data: any) => {
    setLoading(category);
    try {
      const res = await fetch('/api/v1/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, settings: data }),
      });
      if (!res.ok) throw new Error('Failed to save');
      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} settings saved`);

      const updated = await fetch('/api/v1/admin/settings').then(r => r.json());
      setSettings(updated);
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(null);
    }
  };

  const categories: { key: CategoryKey; label: string }[] = [
    { key: 'general', label: 'General' },
    { key: 'email', label: 'Email' },
    { key: 'payment', label: 'Payments' },
    { key: 'security', label: 'Security' },
    { key: 'vps', label: 'VPS' },
    { key: 'notifications', label: 'Notifications' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Settings</h1>
          <p className="text-notix-textMuted">Configure platform settings</p>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((cat) => (
            <TabsTrigger key={cat.key} value={cat.key}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.key} value={cat.key}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  {getIcon(cat.key)}
                  {cat.label} Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SettingsForm
                  category={cat.key}
                  settings={settings[cat.key] || []}
                  onSave={(data) => handleSave(cat.key, data)}
                  loading={loading === cat.key}
                />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function getIcon(category: string) {
  const icons: Record<string, React.ReactNode> = {
    general: <Globe className="h-5 w-5" />,
    email: <Mail className="h-5 w-5" />,
    payment: <CreditCard className="h-5 w-5" />,
    security: <Shield className="h-5 w-5" />,
    vps: <Server className="h-5 w-5" />,
    notifications: <Bell className="h-5 w-5" />,
  };
  return icons[category] || <Settings className="h-5 w-5" />;
}

