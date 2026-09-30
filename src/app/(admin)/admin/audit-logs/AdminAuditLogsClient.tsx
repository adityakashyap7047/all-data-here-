'use client';

import * as React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { formatRelativeTime, formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Loader2,
  MoreVertical,
  Eye,
  Download,
  Calendar,
} from 'lucide-react';

interface AuditLogData {
  id: string;
  userId: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  oldData: any;
  newData: any;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
  user: { id: string; email: string; name: string | null } | null;
}

interface AuditLogsResponse {
  logs: AuditLogData[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdminAuditLogsClientProps {
  initialData: AuditLogsResponse;
  searchParams: {
    page?: string;
    search?: string;
    action?: string;
    entity?: string;
    userId?: string;
    dateFrom?: string;
    dateTo?: string;
    sort?: string;
    order?: string;
  };
}

function AuditLogDetailDialog({ log, onClose }: {
  log: AuditLogData;
  onClose: () => void;
}) {
  const formatJson = (data: any) => {
    if (!data) return '—';
    try {
      return JSON.stringify(data, null, 2);
    } catch {
      return String(data);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-notix-surface border border-white/10 rounded-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-semibold text-notix-text">Audit Log Details</h2>
          <button onClick={onClose} className="text-notix-textMuted hover:text-notix-text p-2">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Action</label>
              <p className="font-medium text-notix-text">{log.action}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Entity</label>
              <p className="font-medium text-notix-text">{log.entity}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Entity ID</label>
              <p className="font-medium text-notix-text">{log.entityId || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">User</label>
              <p className="font-medium text-notix-text">
                {log.user ? `${log.user.name || log.user.email}` : 'System'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">IP Address</label>
              <p className="font-medium text-notix-text">{log.ipAddress || '—'}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Date</label>
              <p className="font-medium text-notix-text">{formatDate(log.createdAt)}</p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Old Data</label>
            <pre className="mt-2 p-3 bg-notix-bg rounded-lg text-xs text-notix-textMuted overflow-x-auto max-h-64">
              {formatJson(log.oldData)}
            </pre>
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">New Data</label>
            <pre className="mt-2 p-3 bg-notix-bg rounded-lg text-xs text-notix-textMuted overflow-x-auto max-h-64">
              {formatJson(log.newData)}
            </pre>
          </div>
          {log.userAgent && (
            <div>
              <label className="text-sm font-medium text-notix-textMuted">User Agent</label>
              <p className="mt-2 p-3 bg-notix-bg rounded-lg text-xs text-notix-textMuted overflow-x-auto">{log.userAgent}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminAuditLogsClient({ initialData, searchParams }: AdminAuditLogsClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<AuditLogsResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [actionFilter, setActionFilter] = React.useState(searchParams.action || '');
  const [entityFilter, setEntityFilter] = React.useState(searchParams.entity || '');
  const [dateFrom, setDateFrom] = React.useState(searchParams.dateFrom || '');
  const [dateTo, setDateTo] = React.useState(searchParams.dateTo || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'createdAt');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'desc');
  const [loading, setLoading] = React.useState(false);
  const [detailLog, setDetailLog] = React.useState<AuditLogData | null>(null);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (actionFilter) params.set('action', actionFilter);
      if (entityFilter) params.set('entity', entityFilter);
      if (dateFrom) params.set('dateFrom', dateFrom);
      if (dateTo) params.set('dateTo', dateTo);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const result = await res.json();
      setData(result);
      router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch audit logs');
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

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParamsHook.toString());
      params.set('page', newPage.toString());
      const res = await fetch(`/api/v1/admin/audit-logs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch audit logs');
      const result = await res.json();
      setData(result);
      router.push(`/admin/audit-logs?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch audit logs');
    } finally {
      setLoading(false);
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sort !== column) return <ChevronDown className="h-4 w-4 text-notix-textMuted opacity-50" />;
    return order === 'asc' ? <ChevronUp className="h-4 w-4 text-notix-accent" /> : <ChevronDown className="h-4 w-4 text-notix-accent" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Audit Logs</h1>
          <p className="text-notix-textMuted">View administrative action history</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Logs</CardTitle>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                className="pl-10 w-64"
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
              placeholder="From"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-40"
              placeholder="To"
            />
            <Button variant="outline" onClick={fetchLogs} disabled={loading}>
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
                  {(() => {
                    const sortMap: Record<string, string> = {
                      Date: 'createdAt',
                      User: 'userId',
                      Action: 'action',
                      Entity: 'entity',
                      'Entity ID': 'entityId',
                      IP: 'ipAddress',
                    };
                    return ['Date', 'User', 'Action', 'Entity', 'Entity ID', 'IP', 'Details'].map((header, i) => (
                      <TableHead key={header} className="cursor-pointer hover:bg-white/5" onClick={() => {
                        if (sortMap[header]) handleSort(sortMap[header]);
                      }}>
                        <div className="flex items-center gap-1">
                          {header}
                          {sortMap[header] && <SortIcon column={sortMap[header]} />}
                        </div>
                      </TableHead>
                    ));
                  })()}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-notix-textMuted">
                      No audit logs found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-notix-textMuted whitespace-nowrap">{formatRelativeTime(log.createdAt)}</TableCell>
                      <TableCell>
                        {log.user ? (
                          <div>
                            <p className="font-medium text-notix-text">{log.user.name || 'Unnamed'}</p>
                            <p className="text-sm text-notix-textMuted">{log.user.email}</p>
                          </div>
                        ) : (
                          <span className="text-notix-textMuted">System</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-notix-accent/10 text-notix-accent">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{log.entity}</TableCell>
                      <TableCell className="text-notix-textMuted font-mono text-xs">{log.entityId || '—'}</TableCell>
                      <TableCell className="text-notix-textMuted font-mono text-xs">{log.ipAddress || '—'}</TableCell>
                      <TableCell>
                        <button
                          onClick={() => setDetailLog(log)}
                          className="text-notix-accent hover:underline text-sm"
                        >
                          <Eye className="h-4 w-4 inline mr-1" />
                          View
                        </button>
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
                Showing {((data.page - 1) * 50) + 1} to {Math.min(data.page * 50, data.total)} of {data.total} logs
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

      {detailLog && (
        <AuditLogDetailDialog log={detailLog} onClose={() => setDetailLog(null)} />
      )}
    </div>
  );
}