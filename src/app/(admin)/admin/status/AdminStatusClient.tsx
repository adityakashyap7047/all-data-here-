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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Loader2,
  MoreVertical,
  Server,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const serviceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  status: z.enum(['operational', 'degraded_performance', 'partial_outage', 'major_outage', 'maintenance']).default('operational'),
  sortOrder: z.coerce.number().int().default(0),
});

type ServiceFormData = z.infer<typeof serviceSchema>;

const incidentSchema = z.object({
  serviceId: z.string().min(1, 'Service is required'),
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']).default('investigating'),
  severity: z.enum(['minor', 'major', 'critical']).default('minor'),
});

type IncidentFormData = z.infer<typeof incidentSchema>;

const incidentUpdateSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  status: z.enum(['investigating', 'identified', 'monitoring', 'resolved']),
});

type IncidentUpdateFormData = z.infer<typeof incidentUpdateSchema>;

interface ServiceData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { incidents: number };
  incidents: IncidentData[];
}

interface IncidentData {
  id: string;
  serviceId: string;
  title: string;
  description: string;
  status: string;
  severity: string;
  startedAt: Date;
  resolvedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  service: { id: string; name: string; slug: string } | null;
  updates: IncidentUpdateData[];
}

interface IncidentUpdateData {
  id: string;
  incidentId: string;
  message: string;
  status: string;
  createdAt: Date;
}

interface StatusData {
  services: ServiceData[];
  incidents: IncidentData[];
}

interface AdminStatusClientProps {
  initialData: StatusData;
  activeTab: string;
}

function ServiceForm({ service, onSubmit, onClose, loading }: {
  service: ServiceData | null;
  onSubmit: (data: ServiceFormData) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const isEditing = !!service;
  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      status: 'operational',
      sortOrder: 0,
      ...service,
    },
  });

  const handleSubmit = (data: ServiceFormData) => {
    onSubmit(data);
  };

  const statusOptions = [
    { value: 'operational', label: 'Operational', color: 'green' },
    { value: 'degraded_performance', label: 'Degraded Performance', color: 'yellow' },
    { value: 'partial_outage', label: 'Partial Outage', color: 'orange' },
    { value: 'major_outage', label: 'Major Outage', color: 'red' },
    { value: 'maintenance', label: 'Maintenance', color: 'blue' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Service' : 'Create Service'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify ${service?.name}` : 'Add a new status page service'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Name</label>
            <Input {...form.register('name')} placeholder="API" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Slug</label>
            <Input {...form.register('slug')} placeholder="api" />
            {form.formState.errors.slug && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.slug.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Description</label>
            <textarea
              {...form.register('description')}
              className="w-full h-24 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={3}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Status</label>
            <Select {...form.register('status')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full bg-${opt.color}-500`} />
                      {opt.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Sort Order</label>
            <Input type="number" {...form.register('sortOrder')} min={0} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentForm({ incident, onSubmit, onClose, loading, services }: {
  incident: IncidentData | null;
  onSubmit: (data: IncidentFormData) => void;
  onClose: () => void;
  loading: boolean;
  services: ServiceData[];
}) {
  const isEditing = !!incident;
  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      serviceId: '',
      title: '',
      description: '',
      status: 'investigating',
      severity: 'minor',
      ...incident,
    },
  });

  const handleSubmit = (data: IncidentFormData) => {
    onSubmit(data);
  };

  const statusOptions = [
    { value: 'investigating', label: 'Investigating' },
    { value: 'identified', label: 'Identified' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'resolved', label: 'Resolved' },
  ];

  const severityOptions = [
    { value: 'minor', label: 'Minor' },
    { value: 'major', label: 'Major' },
    { value: 'critical', label: 'Critical' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Incident' : 'Create Incident'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify ${incident?.title}` : 'Create a new status incident'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Affected Service</label>
            <Select {...form.register('serviceId')}>
              <SelectTrigger>
                <SelectValue placeholder="Select service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((svc) => (
                  <SelectItem key={svc.id} value={svc.id}>{svc.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.serviceId && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.serviceId.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Title</label>
            <Input {...form.register('title')} placeholder="API latency increased" />
            {form.formState.errors.title && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.title.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Description</label>
            <textarea
              {...form.register('description')}
              className="w-full h-32 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={4}
            />
            {form.formState.errors.description && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.description.message}</p>
            )}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Status</label>
              <Select {...form.register('status')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Severity</label>
              <Select {...form.register('severity')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  {severityOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              {isEditing ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function IncidentUpdateForm({ incident, onSubmit, onClose, loading }: {
  incident: IncidentData;
  onSubmit: (data: IncidentUpdateFormData) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const form = useForm<IncidentUpdateFormData>({
    resolver: zodResolver(incidentUpdateSchema),
    defaultValues: {
      message: '',
      status: incident.status,
    },
  });

  const handleSubmit = (data: IncidentUpdateFormData) => {
    onSubmit(data);
  };

  const statusOptions = [
    { value: 'investigating', label: 'Investigating' },
    { value: 'identified', label: 'Identified' },
    { value: 'monitoring', label: 'Monitoring' },
    { value: 'resolved', label: 'Resolved' },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Update to "{incident.title}"</DialogTitle>
          <DialogDescription>Post a status update for this incident</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Update Message</label>
            <textarea
              {...form.register('message')}
              className="w-full h-32 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={4}
              placeholder="We have identified the issue and are working on a fix..."
            />
            {form.formState.errors.message && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.message.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">New Status</label>
            <Select {...form.register('status')}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Post Update
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function getStatusBadge(status: string) {
  const statusStyles: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary' | 'default'; icon: React.ReactNode }> = {
    operational: { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    degraded_performance: { variant: 'warning', icon: <Clock className="h-3 w-3 mr-1" /> },
    partial_outage: { variant: 'destructive', icon: <XCircle className="h-3 w-3 mr-1" /> },
    major_outage: { variant: 'destructive', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
    maintenance: { variant: 'secondary', icon: <Server className="h-3 w-3 mr-1" /> },
    investigating: { variant: 'secondary', icon: <AlertTriangle className="h-3 w-3 mr-1" /> },
    identified: { variant: 'warning', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
    monitoring: { variant: 'secondary', icon: <Clock className="h-3 w-3 mr-1" /> },
    resolved: { variant: 'success', icon: <CheckCircle className="h-3 w-3 mr-1" /> },
  };
  const { variant, icon } = statusStyles[status] || { variant: 'secondary', icon: null };
  return (
    <Badge variant={variant} className="gap-1">
      {icon}
      {status.replace('_', ' ')}
    </Badge>
  );
}

function getSeverityBadge(severity: string) {
  const severityStyles: Record<string, string> = {
    minor: 'bg-blue-500/10 text-blue-400',
    major: 'bg-orange-500/10 text-orange-400',
    critical: 'bg-red-500/10 text-red-400',
  };
  return (
    <Badge variant="outline" className={severityStyles[severity] || 'bg-white/10 text-notix-textMuted'}>
      {severity}
    </Badge>
  );
}

export default function AdminStatusClient({ initialData, activeTab }: AdminStatusClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [data, setData] = React.useState<StatusData>(initialData);
  const [loading, setLoading] = React.useState(false);
  const [serviceDialogOpen, setServiceDialogOpen] = React.useState(false);
  const [editingService, setEditingService] = React.useState<ServiceData | null>(null);
  const [serviceSubmitting, setServiceSubmitting] = React.useState(false);
  const [incidentDialogOpen, setIncidentDialogOpen] = React.useState(false);
  const [editingIncident, setEditingIncident] = React.useState<IncidentData | null>(null);
  const [incidentSubmitting, setIncidentSubmitting] = React.useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = React.useState(false);
  const [updatingIncident, setUpdatingIncident] = React.useState<IncidentData | null>(null);
  const [updateSubmitting, setUpdateSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<{ type: 'service' | 'incident'; id: string } | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/status');
      if (!res.ok) throw new Error('Failed to fetch status data');
      const result = await res.json();
      setData(result);
    } catch (error) {
      toast.error('Failed to fetch status data');
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSubmit = async (formData: ServiceFormData) => {
    setServiceSubmitting(true);
    try {
      const url = editingService ? `/api/v1/admin/status/services/${editingService.id}` : '/api/v1/admin/status/services';
      const method = editingService ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save service');
      }
      toast.success(editingService ? 'Service updated' : 'Service created');
      setServiceDialogOpen(false);
      setEditingService(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save service');
    } finally {
      setServiceSubmitting(false);
    }
  };

  const handleIncidentSubmit = async (formData: IncidentFormData) => {
    setIncidentSubmitting(true);
    try {
      const url = editingIncident ? `/api/v1/admin/status/incidents/${editingIncident.id}` : '/api/v1/admin/status/incidents';
      const method = editingIncident ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save incident');
      }
      toast.success(editingIncident ? 'Incident updated' : 'Incident created');
      setIncidentDialogOpen(false);
      setEditingIncident(null);
      fetchData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save incident');
    } finally {
      setIncidentSubmitting(false);
    }
  };

  const handleUpdateSubmit = async (formData: IncidentUpdateFormData) => {
    setUpdateSubmitting(true);
    try {
      if (!updatingIncident) return;
      const res = await fetch(`/api/v1/admin/status/incidents/${updatingIncident.id}/updates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to add update');
      toast.success('Update posted');
      setUpdateDialogOpen(false);
      setUpdatingIncident(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to post update');
    } finally {
      setUpdateSubmitting(false);
    }
  };

  const handleDelete = async (type: 'service' | 'incident', id: string) => {
    setLoading(true);
    try {
      const endpoint = type === 'service' ? `/api/v1/admin/status/services/${id}` : `/api/v1/admin/status/incidents/${id}`;
      const res = await fetch(endpoint, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success(`${type} deleted`);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete');
    } finally {
      setLoading(false);
      setDeleteConfirm(null);
    }
  };

  const handleResolveIncident = async (incidentId: string) => {
    try {
      const res = await fetch(`/api/v1/admin/status/incidents/${incidentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved', resolvedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error('Failed to resolve incident');
      toast.success('Incident resolved');
      fetchData();
    } catch (error) {
      toast.error('Failed to resolve incident');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-notix-text">Status Page</h1>
          <p className="text-notix-textMuted">Manage services, incidents, and maintenance</p>
        </div>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={(value) => router.push(`/admin/status?tab=${value}`)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="services">
            <Server className="h-4 w-4 mr-2" />
            Services
          </TabsTrigger>
          <TabsTrigger value="incidents">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Incidents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Services</h2>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingService(null); setServiceDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Service
                </Button>
              </DialogTrigger>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Active Incidents</TableHead>
                        <TableHead>Order</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.services.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-12 text-notix-textMuted">
                            No services configured
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.services.map((service) => (
                          <TableRow key={service.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Server className="h-5 w-5 text-notix-accent" />
                                <div>
                                  <p className="font-medium text-notix-text">{service.name}</p>
                                  <p className="text-sm text-notix-textMuted">{service.slug}</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(service.status)}</TableCell>
                            <TableCell>
                              {service.incidents.length > 0 && (
                                <div className="space-y-1 max-h-24 overflow-y-auto">
                                  {service.incidents.map((inc) => (
                                    <div key={inc.id} className="text-xs text-notix-textMuted flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                      {inc.title}
                                    </div>
                                  ))}
                                </div>
                              )}
                              {service.incidents.length === 0 && <span className="text-notix-textMuted">None</span>}
                            </TableCell>
                            <TableCell className="text-notix-textMuted">{service.sortOrder}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => { setEditingService(service); setServiceDialogOpen(true); }}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
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
                                        <AlertDialogTitle>Delete Service</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete "{service.name}"? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => setDeleteConfirm({ type: 'service', id: service.id })}>Delete</AlertDialogAction>
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
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="incidents">
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Incidents</h2>
              <DialogTrigger asChild>
                <Button onClick={() => { setEditingIncident(null); setIncidentDialogOpen(true); }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Incident
                </Button>
              </DialogTrigger>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Incident</TableHead>
                        <TableHead>Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Started</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.incidents.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12 text-notix-textMuted">
                            No incidents
                          </TableCell>
                        </TableRow>
                      ) : (
                        data.incidents.map((incident) => (
                          <TableRow key={incident.id}>
                            <TableCell>
                              <div>
                                <p className="font-medium text-notix-text max-w-md truncate">{incident.title}</p>
                                <p className="text-sm text-notix-textMuted line-clamp-1">{incident.description}</p>
                              </div>
                            </TableCell>
                            <TableCell className="text-notix-textMuted">{incident.service?.name || 'Unknown'}</TableCell>
                            <TableCell>{getStatusBadge(incident.status)}</TableCell>
                            <TableCell>{getSeverityBadge(incident.severity)}</TableCell>
                            <TableCell className="text-notix-textMuted">{formatRelativeTime(incident.startedAt)}</TableCell>
                            <TableCell>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
<DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => { setEditingIncident(incident); setIncidentDialogOpen(true); }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => { setUpdatingIncident(incident); setUpdateDialogOpen(true); }}>
                                      <MessageSquare className="h-4 w-4 mr-2" />
                                      Add Update
                                    </DropdownMenuItem>
                                    {incident.status !== 'resolved' && (
                                      <>
                                        <DropdownMenuItem onClick={() => handleResolveIncident(incident.id)} className="text-green-400 focus:text-green-400">
                                          <CheckCircle className="h-4 w-4 mr-2" />
                                          Mark Resolved
                                        </DropdownMenuItem>
                                      </>
                                    )}
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
                                        <AlertDialogTitle>Delete Incident</AlertDialogTitle>
                                        <AlertDialogDescription>
                                          Are you sure you want to delete this incident? This action cannot be undone.
                                        </AlertDialogDescription>
                                      </AlertDialogHeader>
                                      <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => setDeleteConfirm({ type: 'incident', id: incident.id })}>Delete</AlertDialogAction>
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
              </CardContent>
            </Card>

              {data.incidents.length > 0 && (
                <div className="mt-4 space-y-4">
                  {data.incidents.slice(0, 3).map((incident) => (
                    <Card key={incident.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              {getStatusBadge(incident.status)}
                              {getSeverityBadge(incident.severity)}
                            </div>
                            <div>
                              <p className="font-medium text-notix-text">{incident.title}</p>
                              <p className="text-sm text-notix-textMuted">{incident.service?.name}</p>
                            </div>
                          </div>
                          <span className="text-sm text-notix-textMuted">{formatRelativeTime(incident.startedAt)}</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {incident.updates.map((update) => (
                            <div key={update.id} className="flex items-start gap-3 p-3 bg-white/5 rounded-lg">
                              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-notix-accent/10 flex items-center justify-center text-notix-accent text-xs font-medium">
                                {update.status.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1">
                                <p className="text-notix-text">{update.message}</p>
                                <p className="text-xs text-notix-textMuted">{formatRelativeTime(update.createdAt)}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
          </div>
        </TabsContent>
      </Tabs>

      <ServiceForm
        service={editingService}
        onSubmit={handleServiceSubmit}
        onClose={() => { setServiceDialogOpen(false); setEditingService(null); }}
        loading={serviceSubmitting}
      />

      <IncidentForm
        incident={editingIncident}
        onSubmit={handleIncidentSubmit}
        onClose={() => { setIncidentDialogOpen(false); setEditingIncident(null); }}
        loading={incidentSubmitting}
        services={data.services}
      />

      <IncidentUpdateForm
        incident={updatingIncident!}
        onSubmit={handleUpdateSubmit}
        onClose={() => { setUpdateDialogOpen(false); setUpdatingIncident(null); }}
        loading={updateSubmitting}
      />
    </div>
  );
}