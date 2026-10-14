'use client';

import { useState } from 'react';
import { MessageSquare, Plus, Clock, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Ticket {
  id: string;
  ticketNumber: string;
  subject: string;
  category: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  updatedAt: string;
}

const mockTickets: Ticket[] = [
  {
    id: 'tk-1',
    ticketNumber: 'TK-4821',
    subject: 'Request for secondary IPv4 allocation',
    category: 'Network',
    priority: 'NORMAL',
    status: 'IN_PROGRESS',
    updatedAt: '2 hours ago',
  },
  {
    id: 'tk-2',
    ticketNumber: 'TK-4510',
    subject: 'Port 25 outbound mail restriction lift',
    category: 'Technical',
    priority: 'HIGH',
    status: 'RESOLVED',
    updatedAt: '3 days ago',
  },
];

export default function TicketsPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Support Tickets</h1>
          <p className="text-white/40 mt-1 text-sm">
            Contact our 24/7 technical and billing support team.
          </p>
        </div>
        <Button className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20">
          <Plus className="w-4 h-4 mr-2" />
          Open New Ticket
        </Button>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">Your Tickets</CardTitle>
            <Badge variant="outline" className="border-white/10 text-white/60">
              {mockTickets.length} Tickets
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase font-bold text-white/40 tracking-wider">
                  <th className="px-6 py-4">Ticket ID</th>
                  <th className="px-6 py-4">Subject</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Priority</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Last Activity</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {mockTickets.map((tk) => (
                  <tr key={tk.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {tk.ticketNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white/90">
                      {tk.subject}
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {tk.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-white/70">
                        {tk.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {tk.status === 'RESOLVED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3.5 h-3.5" /> Resolved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          <Clock className="w-3.5 h-3.5" /> In Progress
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-white/40 text-xs">
                      {tk.updatedAt}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button variant="ghost" size="sm" className="text-white/60 hover:text-white">
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
