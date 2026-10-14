'use client';

import { Bell, CheckCircle, Info, AlertTriangle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const mockNotifications = [
  {
    id: '1',
    title: 'VPS Auto-backup completed',
    message: 'Scheduled backup for instance "web-prod-01" completed successfully (3.4 GB).',
    time: '2 hours ago',
    type: 'SUCCESS',
  },
  {
    id: '2',
    title: 'Invoice generated',
    message: 'Invoice INV-2024-003 has been generated for your upcoming billing period.',
    time: '1 day ago',
    type: 'INFO',
  },
  {
    id: '3',
    title: 'Scheduled maintenance notice',
    message: 'US-EAST node maintenance scheduled on April 20, 02:00 UTC. Zero downtime expected.',
    time: '3 days ago',
    type: 'WARNING',
  },
];

export default function NotificationsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Notifications</h1>
          <p className="text-white/40 mt-1 text-sm">
            Activity updates, alerts, and system notifications for your cloud resources.
          </p>
        </div>
        <Button variant="outline" className="border-white/10 text-white/70 hover:text-white hover:bg-white/5">
          Mark All as Read
        </Button>
      </div>

      <div className="space-y-3">
        {mockNotifications.map((notif) => (
          <Card key={notif.id} className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-5 hover:border-red-600/30 transition-all">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                {notif.type === 'SUCCESS' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                {notif.type === 'INFO' && <Info className="w-5 h-5 text-blue-400" />}
                {notif.type === 'WARNING' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm">{notif.title}</h3>
                  <span className="text-xs text-white/30">{notif.time}</span>
                </div>
                <p className="text-xs text-white/50 mt-1 leading-relaxed">{notif.message}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
