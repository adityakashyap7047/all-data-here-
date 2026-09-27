'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  Mail,
  User,
  MessageSquare,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const TICKET_STATUSES = ['OPEN', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'WAITING_STAFF', 'RESOLVED', 'CLOSED'] as const;
const TICKET_PRIORITIES = ['LOW', 'NORMAL', 'HIGH', 'URGENT', 'CRITICAL'] as const;
const TICKET_CATEGORIES = ['GENERAL', 'BILLING', 'TECHNICAL', 'VPS', 'NETWORK', 'SECURITY', 'ABUSE', 'SALES', 'FEATURE_REQUEST'] as const;

interface TicketData {
  id: string;
  userId: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
  user: { id: string; email: string; name: string | null };
  assignedToUser: { id: string; email: string; name: string | null } | null;
  _count: { messages: number };
  messages: { message: string; createdAt: Date; isStaff: boolean }[];
}

interface StaffData {
  id: string;
  email: string;
  name: string | null;
}

interface TicketsResponse {
  tickets: TicketData[];
  total: number;
  page: number;
  totalPages: number;
  staff: StaffData[];
}

interface AdminTicketsClientProps {
  initialData: TicketsResponse;
  searchParams: {
    page?: string;
    search?: string;
    status?: string;
    priority?: string;
    category?: string;
    assignedTo?: string;
    sort?: string;
    order?: string;
  };
}

function TicketDetailDialog({ ticket, onClose, staff, onUpdate }: {
  ticket: TicketData;
  onClose: () => void;
  staff: StaffData[];
  onUpdate: (data: { status?: string; priority?: string; assignedTo?: string | null }) => void;
}) {
  const [activeTab, setActiveTab] = React.useState<'messages' | 'details'>('messages');
  const [replyMessage, setReplyMessage] = React.useState('');

  const handleReply = async () => {
    if (!replyMessage.trim()) return;
    try {
      const res = await fetch(`/api/v1/admin/tickets/${ticket.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: replyMessage, isStaff: true }),
      });
      if (!res.ok) throw new Error('Failed to send reply');
      toast.success('Reply sent');
      setReplyMessage('');
      onUpdate({ status: 'WAITING_CUSTOMER' });
    } catch (error) {
      toast.error('Failed to send reply');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      OPEN: 'bg-blue-500/10 text-blue-400',
      IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400',
      WAITING_CUSTOMER: 'bg-purple-500/10 text-purple-400',
      WAITING_STAFF: 'bg-orange-500/10 text-orange-400',
      RESOLVED: 'bg-green-500/10 text-green-400',
      CLOSED: 'bg-gray-500/10 text-gray-400',
    };
    return (
      <Badge variant="outline" className={statusStyles[status] || 'bg-white/10 text-notix-textMuted'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      LOW: 'bg-blue-500/10 text-blue-400',
      NORMAL: 'bg-green-500/10 text-green-400',
      HIGH: 'bg-yellow-500/10 text-yellow-400',
      URGENT: 'bg-orange-500/10 text-orange-400',
      CRITICAL: 'bg-red-500/10 text-red-400',
    };
    return (
      <Badge variant="outline" className={priorityStyles[priority] || 'bg-white/10 text-notix-textMuted'}>
        {priority}
      </Badge>
    );
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg">{ticket.subject}</DialogTitle>
              <DialogDescription>Ticket #{ticket.id.slice(-8)} • {formatRelativeTime(ticket.createdAt)}</DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(ticket.status)}
              {getPriorityBadge(ticket.priority)}
              <Badge variant="outline">{ticket.category}</Badge>
            </div>
          </div>
        </DialogHeader>
        <div className="flex h-[calc(100%-120px)] overflow-hidden">
          <div className="border-r border-white/10 w-80 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h4 className="font-medium text-notix-text">Details</h4>
              <div className="mt-3 space-y-3 text-sm">
                <div>
                  <p className="text-notix-textMuted">Customer</p>
                  <p className="font-medium">{ticket.user.name || 'Unnamed'}</p>
                  <p className="text-notix-textMuted">{ticket.user.email}</p>
                </div>
                <div>
                  <p className="text-notix-textMuted">Assigned To</p>
                  <p className="font-medium">{ticket.assignedToUser?.name || ticket.assignedToUser?.email || 'Unassigned'}</p>
                </div>
                <div>
                  <p className="text-notix-textMuted">Category</p>
                  <p className="font-medium">{ticket.category}</p>
                </div>
                <div>
                  <p className="text-notix-textMuted">Created</p>
                  <p className="font-medium">{formatRelativeTime(ticket.createdAt)}</p>
                </div>
                <div>
                  <p className="text-notix-textMuted">Updated</p>
                  <p className="font-medium">{formatRelativeTime(ticket.updatedAt)}</p>
                </div>
              </div>
            </div>
            <div className="p-4 border-b border-white/10">
              <h4 className="font-medium text-notix-text">Actions</h4>
              <div className="mt-3 space-y-2">
                <Select onValueChange={(value) => onUpdate({ status: value })} defaultValue={ticket.status}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change Status" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => onUpdate({ priority: value })} defaultValue={ticket.priority}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Change Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {TICKET_PRIORITIES.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => onUpdate({ assignedTo: value || null })} defaultValue={ticket.assignedTo || ''}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Assign To" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassign</SelectItem>
                    {staff.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name || s.email}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-white/10">
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === 'messages' ? 'text-notix-accent border-b-2 border-notix-accent' : 'text-notix-textMuted hover:text-notix-text'
                )}
                onClick={() => setActiveTab('messages')}
              >
                <MessageSquare className="h-4 w-4 mr-2 inline" />
                Messages ({ticket._count.messages})
              </button>
              <button
                className={cn(
                  'px-4 py-2 text-sm font-medium transition-colors',
                  activeTab === 'details' ? 'text-notix-accent border-b-2 border-notix-accent' : 'text-notix-textMuted hover:text-notix-text'
                )}
                onClick={() => setActiveTab('details')}
              >
                Details
              </button>
            </div>
            {activeTab === 'messages' && (
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {ticket.messages.slice().reverse().map((msg, idx) => (
                  <div key={idx} className={cn(
                    'flex gap-3',
                    msg.isStaff ? 'flex-row-reverse' : 'flex-row'
                  )}>
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0',
                      msg.isStaff ? 'bg-notix-accent/10 text-notix-accent' : 'bg-white/10 text-notix-textMuted'
                    )}>
                      {msg.isStaff ? <User className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                    </div>
                    <div className={cn(
                      'max-w-[70%] rounded-lg p-3',
                      msg.isStaff ? 'bg-notix-accent/10 text-notix-text' : 'bg-white/5 text-notix-text'
                    )}>
                      <p className="text-sm">{msg.message}</p>
                      <p className="text-xs text-notix-textMuted mt-1">{formatRelativeTime(msg.createdAt)}</p>
                    </div>
                  </div>
                ))}
                <div className="border-t border-white/10 pt-4">
                  <div className="flex gap-2">
                    <textarea
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type your reply..."
                      className="flex-1 h-20 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20 resize-none"
                    />
                    <Button onClick={handleReply} className="h-20">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
            {activeTab === 'details' && (
              <div className="flex-1 overflow-y-auto p-4">
                <p className="text-notix-textMuted">Ticket details view - expand as needed</p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminTicketsClient({ initialData, searchParams }: AdminTicketsClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<TicketsResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [statusFilter, setStatusFilter] = React.useState(searchParams.status || '');
  const [priorityFilter, setPriorityFilter] = React.useState(searchParams.priority || '');
  const [categoryFilter, setCategoryFilter] = React.useState(searchParams.category || '');
  const [assignedFilter, setAssignedFilter] = React.useState(searchParams.assignedTo || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'createdAt');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'desc');
  const [loading, setLoading] = React.useState(false);
  const [detailTicket, setDetailTicket] = React.useState<TicketData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (categoryFilter) params.set('category', categoryFilter);
      if (assignedFilter) params.set('assignedTo', assignedFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const result = await res.json();
      setData(result);
      router.push(`/admin/tickets?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: string) => {
    if (sort === column) {
      setOrder(order === 'asc' ? 'desc' : 'asc');
    } else {
      setSort(column);
      setOrder('asc');
    }
  };

  const handleUpdate = (updates: { status?: string; priority?: string; assignedTo?: string | null }) => {
    if (!detailTicket) return;
    fetch(`/api/v1/admin/tickets/${detailTicket.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).then(() => fetchTickets()).catch(() => toast.error('Failed to update'));
  };

  const handleDelete = async (ticketId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/tickets/${ticketId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete ticket');
      toast.success('Ticket deleted');
      fetchTickets();
    } catch (error) {
      toast.error('Failed to delete ticket');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParamsHook.toString());
      params.set('page', newPage.toString());
      const res = await fetch(`/api/v1/admin/tickets?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      const result = await res.json();
      setData(result);
      router.push(`/admin/tickets?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sort !== column) return <ChevronDown className="h-4 w-4 text-notix-textMuted opacity-50" />;
    return order === 'asc' ? <ChevronUp className="h-4 w-4 text-notix-accent" /> : <ChevronDown className="h-4 w-4 text-notix-accent" />;
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      OPEN: 'bg-blue-500/10 text-blue-400',
      IN_PROGRESS: 'bg-yellow-500/10 text-yellow-400',
      WAITING_CUSTOMER: 'bg-purple-500/10 text-purple-400',
      WAITING_STAFF: 'bg-orange-500/10 text-orange-400',
      RESOLVED: 'bg-green-500/10 text-green-400',
      CLOSED: 'bg-gray-500/10 text-gray-400',
    };
    return <Badge variant="outline" className={statusStyles[status] || 'bg-white/10 text-notix-textMuted'}>{status.replace('_', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      LOW: 'bg-blue-500/10 text-blue-400',
      NORMAL: 'bg-green-500/10 text-green-400',
      HIGH: 'bg-yellow-500/10 text-yellow-400',
      URGENT: 'bg-orange-500/10 text-orange-400',
      CRITICAL: 'bg-red-500/10 text-red-400',
    };
    return <Badge variant="outline" className={priorityStyles[priority] || 'bg-white/10 text-notix-textMuted'}>{priority}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Support Tickets</h1>
          <p className="text-notix-textMuted">Manage customer support tickets</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Tickets</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchTickets()}
                className="pl-10 w-64"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                {TICKET_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s.replace('_', ' ')}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Priority</SelectItem>
                {TICKET_PRIORITIES.map((p) => (
                  <SelectItem key={p} value={p}>{p}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {TICKET_CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchTickets} disabled={loading}>
              <Filter className="h-4 w-4 mr-2" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  {['Subject', 'Customer', 'Status', 'Priority', 'Category', 'Assigned', 'Messages', 'Created', 'Actions'].map((header, i) => (
                    <TableHead key={header} className="cursor-pointer hover:bg-white/5" onClick={() => {
                      const sortMap: Record<string, string> = {
                        Subject: 'subject',
                        Customer: 'user',
                        Status: 'status',
                        Priority: 'priority',
                        Category: 'category',
                        Assigned: 'assignedTo',
                        Messages: 'messages',
                        Created: 'createdAt',
                      };
                      if (sortMap[header]) handleSort(sortMap[header]);
                    }}>
                      <div className="flex items-center gap-1">
                        {header}
                        {sortMap[header] && <SortIcon column={sortMap[header]} />}
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-notix-textMuted">
                      No tickets found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.tickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell>
                        <p className="font-medium text-notix-text max-w-md truncate">{ticket.subject}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-notix-text">{ticket.user.name || 'Unnamed'}</p>
                        <p className="text-sm text-notix-textMuted">{ticket.user.email}</p>
                      </TableCell>
                      <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                      <TableCell>{getPriorityBadge(ticket.priority)}</TableCell>
                      <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                      <TableCell className="text-notix-textMuted">
                        {ticket.assignedToUser?.name || ticket.assignedToUser?.email || 'Unassigned'}
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{ticket._count.messages}</TableCell>
                      <TableCell className="text-notix-textMuted">{formatRelativeTime(ticket.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setDetailTicket(ticket)}>
                              <MessageSquare className="h-4 w-4 mr-2" />
                              View & Reply
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <DropdownMenuItem className="text-red-400 focus:text-red-400">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Ticket</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this ticket? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(ticket.id)}>Delete</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center justify-between p-4 border-t border-white/10">
              <p className="text-sm text-notix-textMuted">
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} tickets
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handlePageChange(data.page - 1)} disabled={data.page === 1 || loading}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePageChange(data.page + 1)} disabled={data.page === data.totalPages || loading}>
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {detailTicket && (
        <TicketDetailDialog
          ticket={detailTicket}
          onClose={() => setDetailTicket(null)}
          staff={data.staff}
          onUpdate={handleUpdate}
        />
      )}
    </div>
  );
}