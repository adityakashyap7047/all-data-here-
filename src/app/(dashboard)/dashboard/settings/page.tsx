'use client';

import { useState } from 'react';
import { User, Shield, Key, Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useSession } from 'next-auth/react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState('Admin User');
  const [email, setEmail] = useState('admin@notixcloud.com');

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-black text-white tracking-tight">Account Settings</h1>
        <p className="text-white/40 mt-1 text-sm">
          Manage your personal profile, security credentials, and authentication preferences.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <CardHeader className="p-0 pb-6 border-b border-white/[0.06]">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <User className="w-5 h-5 text-red-500" />
              Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label className="text-xs uppercase font-bold text-white/50 tracking-wider">Full Name</Label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="mt-2 bg-white/[0.04] border-white/10 text-white"
                />
              </div>
              <div>
                <Label className="text-xs uppercase font-bold text-white/50 tracking-wider">Email Address</Label>
                <Input 
                  value={email} 
                  disabled
                  className="mt-2 bg-white/[0.02] border-white/5 text-white/50"
                />
              </div>
            </div>
            <div className="pt-2">
              <Button className="bg-red-600 hover:bg-red-500 text-white">
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security & 2FA Card */}
        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <CardHeader className="p-0 pb-6 border-b border-white/[0.06]">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-500" />
              Security & Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-sm">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-white/40 mt-1">Protect your account using an authenticator app (TOTP)</p>
              </div>
              <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">Not Configured</Badge>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/[0.06]">
              <div>
                <p className="font-bold text-white text-sm">Change Password</p>
                <p className="text-xs text-white/40 mt-1">Update your account master password</p>
              </div>
              <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
                Update Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* API Access Card */}
        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <CardHeader className="p-0 pb-6 border-b border-white/[0.06]">
            <CardTitle className="text-lg font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-red-500" />
              API Tokens
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-6">
            <p className="text-xs text-white/50 leading-relaxed mb-4">
              API tokens allow programmatic control over your servers and DNS automation via CLI or Terraform.
            </p>
            <Button variant="outline" size="sm" className="border-white/10 text-white hover:bg-white/5">
              Generate New Token
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
