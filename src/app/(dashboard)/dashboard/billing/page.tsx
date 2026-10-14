'use client';

import { useState } from 'react';
import { 
  CreditCard, DollarSign, Download, Plus, Clock, 
  CheckCircle, AlertTriangle, Shield, ArrowUpRight, 
  FileText, Wallet, Calendar, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'PAID' | 'PENDING' | 'OVERDUE';
  items: string;
}

const mockInvoices: Invoice[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2024-001',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    amount: 47.99,
    status: 'PAID',
    items: 'Enterprise VPS Plan (1 mo) - US East',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2024-002',
    date: '2024-02-01',
    dueDate: '2024-02-15',
    amount: 47.99,
    status: 'PAID',
    items: 'Enterprise VPS Plan (1 mo) - US East',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2024-003',
    date: '2024-04-01',
    dueDate: '2024-04-15',
    amount: 47.99,
    status: 'PENDING',
    items: 'Enterprise VPS Plan (1 mo) - US East',
  },
];

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState('invoices');

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="w-3.5 h-3.5" />
            Paid
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="w-3.5 h-3.5" />
            Overdue
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">Billing & Invoices</h1>
          <p className="text-white/40 mt-1 text-sm">
            Manage your payment methods, view invoices, and track server subscription charges.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="border-white/10 text-white hover:bg-white/5">
            <Wallet className="w-4 h-4 mr-2 text-red-500" />
            Add Funds
          </Button>
          <Button className="bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-600/20">
            <CreditCard className="w-4 h-4 mr-2" />
            Add Payment Method
          </Button>
        </div>
      </div>

      {/* Top Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-white/40">Account Balance</p>
              <p className="text-3xl font-black text-white mt-2">$0.00</p>
              <p className="text-xs text-white/30 mt-1">Prepaid credits available</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-red-600/10 border border-red-600/20 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-white/40">Next Billing Date</p>
              <p className="text-3xl font-black text-white mt-2">Apr 15</p>
              <p className="text-xs text-emerald-400 mt-1">Auto-pay enabled</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-white/40">Est. Monthly Bill</p>
              <p className="text-3xl font-black text-white mt-2">$47.99</p>
              <p className="text-xs text-white/30 mt-1">1 active enterprise VPS</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-600/10 border border-amber-600/20 flex items-center justify-center">
              <CreditCard className="w-6 h-6 text-amber-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold tracking-wider text-white/40">Payment Security</p>
              <p className="text-2xl font-bold text-white mt-2">Active</p>
              <p className="text-xs text-emerald-400 mt-1">256-bit SSL encrypted</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-600/10 border border-emerald-600/20 flex items-center justify-center">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs defaultValue="invoices" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white/[0.04] border border-white/[0.08] p-1 rounded-xl">
          <TabsTrigger 
            value="invoices" 
            className="rounded-lg text-white/60 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold"
          >
            Invoices & Receipts
          </TabsTrigger>
          <TabsTrigger 
            value="methods" 
            className="rounded-lg text-white/60 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold"
          >
            Payment Methods
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="rounded-lg text-white/60 data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold"
          >
            Billing Preferences
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Invoices */}
        <TabsContent value="invoices" className="space-y-4">
          <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl overflow-hidden">
            <CardHeader className="p-6 border-b border-white/[0.06]">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg font-bold text-white">Invoice History</CardTitle>
                  <p className="text-xs text-white/40 mt-1">All past and pending billing transactions</p>
                </div>
                <Badge variant="outline" className="border-white/10 text-white/60">
                  {mockInvoices.length} Invoices
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06] text-xs uppercase font-bold text-white/40 tracking-wider">
                      <th className="px-6 py-4">Invoice #</th>
                      <th className="px-6 py-4">Description</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Due Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.04]">
                    {mockInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-white">
                          {inv.invoiceNumber}
                        </td>
                        <td className="px-6 py-4 text-white/70">
                          {inv.items}
                        </td>
                        <td className="px-6 py-4 text-white/50">
                          {inv.date}
                        </td>
                        <td className="px-6 py-4 text-white/50">
                          {inv.dueDate}
                        </td>
                        <td className="px-6 py-4 font-bold text-white">
                          ${inv.amount.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(inv.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-white/60 hover:text-white hover:bg-white/10"
                            onClick={() => alert(`Downloading invoice ${inv.invoiceNumber}...`)}
                          >
                            <Download className="w-4 h-4 mr-1" />
                            PDF
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 2: Payment Methods */}
        <TabsContent value="methods" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/[0.05] border border-white/10 flex items-center justify-center">
                    <CreditCard className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-white">Visa ending in 4242</p>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-red-600/20 text-red-400 border border-red-600/30">
                        Default
                      </span>
                    </div>
                    <p className="text-xs text-white/40 mt-1">Expires 12/28 • Added on Jan 2024</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/[0.06]">
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" /> Ready for automatic renewals
                </span>
                <Button variant="ghost" size="sm" className="text-white/40 hover:text-white text-xs">
                  Edit
                </Button>
              </div>
            </Card>

            {/* Add Card Placeholder */}
            <div className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-red-600/40 hover:bg-red-600/[0.02] transition-all cursor-pointer group">
              <div className="w-12 h-12 rounded-xl bg-white/[0.03] group-hover:bg-red-600/10 flex items-center justify-center transition-colors">
                <Plus className="w-6 h-6 text-white/40 group-hover:text-red-500 transition-colors" />
              </div>
              <p className="font-bold text-white mt-3 text-sm">Add New Payment Method</p>
              <p className="text-xs text-white/40 mt-1">Support for Credit Card, PayPal, and Crypto</p>
            </div>
          </div>
        </TabsContent>

        {/* Tab 3: Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="bg-white/[0.02] border-white/[0.06] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-white mb-4">Billing Settings</h3>
            <div className="space-y-4 max-w-xl">
              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Automatic Renewals</p>
                  <p className="text-xs text-white/40">Automatically charge default payment method 2 days before server expiry</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-white/[0.06]">
                <div>
                  <p className="text-sm font-semibold text-white">Invoice Email Notifications</p>
                  <p className="text-xs text-white/40">Receive PDF receipts via email upon payment confirmation</p>
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">Enabled</Badge>
              </div>

              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-semibold text-white">Billing Currency</p>
                  <p className="text-xs text-white/40">Default currency for all invoices</p>
                </div>
                <span className="text-sm font-bold text-white">USD ($)</span>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
