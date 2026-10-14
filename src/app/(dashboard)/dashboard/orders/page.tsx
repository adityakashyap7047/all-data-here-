'use client';

import { useState } from 'react';
import { ShoppingBag, Server, CheckCircle, Clock, ExternalLink, Calendar, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  planName: string;
  date: string;
  total: number;
  status: 'COMPLETED' | 'PROCESSING' | 'PENDING';
  location: string;
}

const mockOrders: Order[] = [
  {
    id: 'ord-1',
    orderNumber: 'ORD-99214',
    planName: 'Enterprise VPS - 8 vCPU / 16GB RAM',
    date: '2024-03-01',
    total: 47.99,
    status: 'COMPLETED',
    location: 'US-EAST',
  },
  {
    id: 'ord-2',
    orderNumber: 'ORD-98102',
    planName: 'Standard VPS - 2 vCPU / 4GB RAM',
    date: '2024-01-15',
    total: 11.99,
    status: 'COMPLETED',
    location: 'EU-CENTRAL',
  },
];

export default function OrdersPage() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Order History</h1>
          <p className="text-white/40 mt-1 text-sm">
            View all your past hardware deployments, server orders, and upgrades.
          </p>
        </div>
        <Button asChild className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20">
          <Link href="/dashboard/vps/new">
            <Server className="w-4 h-4 mr-2" />
            Deploy New Instance
          </Link>
        </Button>
      </div>

      <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl overflow-hidden">
        <CardHeader className="p-6 border-b border-white/[0.06]">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-bold text-white">All Orders</CardTitle>
            <Badge variant="outline" className="border-white/10 text-white/60">
              {mockOrders.length} Orders
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase font-bold text-white/40 tracking-wider">
                  <th className="px-6 py-4">Order #</th>
                  <th className="px-6 py-4">Product / Plan</th>
                  <th className="px-6 py-4">Region</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4">Total</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {mockOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white">
                      {ord.orderNumber}
                    </td>
                    <td className="px-6 py-4 font-semibold text-white/90">
                      {ord.planName}
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {ord.location}
                    </td>
                    <td className="px-6 py-4 text-white/50">
                      {ord.date}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">
                      ${ord.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        Completed
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button asChild variant="ghost" size="sm" className="text-white/60 hover:text-white">
                        <Link href="/dashboard/vps">
                          View VPS
                          <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
                        </Link>
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
