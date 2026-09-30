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
import { formatCurrency } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  Server,
  MoreVertical,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const LOCATIONS = [
  'us-east', 'us-west', 'eu-central', 'eu-west', 'ap-south', 'ap-east',
  'us-central', 'eu-north', 'ap-northeast', 'sa-east',
];

const planSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(1000).optional(),
  cpu: z.coerce.number().int().positive('CPU must be a positive integer'),
  ram: z.coerce.number().int().positive('RAM must be a positive integer (in GB)'),
  storage: z.coerce.number().int().positive('Storage must be a positive integer (in GB)'),
  bandwidth: z.coerce.number().int().positive('Bandwidth must be a positive integer (in TB)'),
  ipv4Count: z.coerce.number().int().min(0).default(1),
  ipv6Count: z.coerce.number().int().min(0).default(1),
  priceMonthly: z.coerce.number().positive('Monthly price must be positive'),
  priceYearly: z.coerce.number().positive('Yearly price must be positive').nullable().optional(),
  features: z.array(z.string()).default([]),
  location: z.string().min(1, 'Location is required'),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

type PlanFormData = z.infer<typeof planSchema>;

interface PlanData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cpu: number;
  ram: number;
  storage: number;
  bandwidth: number;
  ipv4Count: number;
  ipv6Count: number;
  priceMonthly: number;
  priceYearly: number | null;
  features: string[];
  location: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  _count: { instances: number };
}

interface PlansResponse {
  plans: PlanData[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdminPlansClientProps {
  initialData: PlansResponse;
  searchParams: {
    page?: string;
    search?: string;
    isActive?: string;
    sort?: string;
    order?: string;
  };
}

function PlanForm({ plan, onSubmit, onClose, loading }: {
  plan: PlanData | null;
  onSubmit: (data: z.infer<typeof planSchema>) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const isEditing = !!plan;
  const form = useForm<PlanFormData>({
    resolver: zodResolver(planSchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      cpu: 1,
      ram: 2,
      storage: 40,
      bandwidth: 2,
      ipv4Count: 1,
      ipv6Count: 1,
      priceMonthly: 5.99,
      priceYearly: undefined,
      features: [],
      location: 'us-east',
      isActive: true,
      sortOrder: 0,
      ...(plan ? {
        name: plan.name,
        slug: plan.slug,
        description: plan.description ?? '',
        cpu: plan.cpu,
        ram: plan.ram,
        storage: plan.storage,
        bandwidth: plan.bandwidth,
        ipv4Count: plan.ipv4Count,
        ipv6Count: plan.ipv6Count,
        priceMonthly: Number(plan.priceMonthly),
        priceYearly: plan.priceYearly ? Number(plan.priceYearly) : undefined,
        features: plan.features,
        location: plan.location,
        isActive: plan.isActive,
        sortOrder: plan.sortOrder,
      } : {}),
    },
  });

  const handleSubmit = (data: PlanFormData) => {
    onSubmit(data);
  };

  const [newFeature, setNewFeature] = React.useState('');
  const features = form.watch('features');

  const addFeature = () => {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      form.setValue('features', [...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    form.setValue('features', features.filter(f => f !== feature));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Plan' : 'Create Plan'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify ${plan?.name}` : 'Create a new VPS plan'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Name</label>
              <Input {...form.register('name')} placeholder="Starter" />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Slug</label>
              <Input {...form.register('slug')} placeholder="starter" />
              {form.formState.errors.slug && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">CPU (vCPU)</label>
              <Input type="number" {...form.register('cpu')} min={1} />
              {form.formState.errors.cpu && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.cpu.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">RAM (GB)</label>
              <Input type="number" {...form.register('ram')} min={1} />
              {form.formState.errors.ram && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.ram.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Storage (GB)</label>
              <Input type="number" {...form.register('storage')} min={1} />
              {form.formState.errors.storage && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.storage.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Bandwidth (TB)</label>
              <Input type="number" {...form.register('bandwidth')} min={1} />
              {form.formState.errors.bandwidth && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.bandwidth.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">IPv4 Count</label>
              <Input type="number" {...form.register('ipv4Count')} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">IPv6 Count</label>
              <Input type="number" {...form.register('ipv6Count')} min={0} />
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Monthly Price ($)</label>
              <Input type="number" step="0.01" {...form.register('priceMonthly')} min={0.01} />
              {form.formState.errors.priceMonthly && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.priceMonthly.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Yearly Price ($)</label>
              <Input type="number" step="0.01" {...form.register('priceYearly')} min={0.01} />
              {form.formState.errors.priceYearly && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.priceYearly.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Location</label>
              <Select {...form.register('location')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {LOCATIONS.map((loc) => (
                    <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Sort Order</label>
              <Input type="number" {...form.register('sortOrder')} min={0} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-notix-textMuted">Description</label>
            <textarea
              {...form.register('description')}
              className="w-full h-24 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={4}
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-notix-textMuted">Features</label>
              <div className="flex gap-2">
                <Input
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Add feature..."
                  className="w-48"
                />
                <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {features.map((feature) => (
                <Badge key={feature} variant="secondary" className="gap-1">
                  {feature}
                  <Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => removeFeature(feature)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...form.register('isActive')}
              className="h-4 w-4 rounded border-white/20 bg-notix-surface text-notix-accent focus:ring-notix-accent"
            />
            <label className="text-sm font-medium text-notix-text">Active</label>
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

export default function AdminPlansClient({ initialData, searchParams }: AdminPlansClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<PlansResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [isActiveFilter, setIsActiveFilter] = React.useState(searchParams.isActive || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'sortOrder');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'asc');
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingPlan, setEditingPlan] = React.useState<PlanData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/plans?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch plans');
      const result = await res.json();
      setData(result);
      router.push(`/admin/plans?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch plans');
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

  const openCreateDialog = () => {
    setEditingPlan(null);
    setDialogOpen(true);
  };

  const openEditDialog = (plan: PlanData) => {
    setEditingPlan(plan);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: PlanFormData) => {
    setSubmitting(true);
    try {
      const url = editingPlan ? `/api/v1/admin/plans/${editingPlan.id}` : '/api/v1/admin/plans';
      const method = editingPlan ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save plan');
      }
      toast.success(editingPlan ? 'Plan updated' : 'Plan created');
      setDialogOpen(false);
      setEditingPlan(null);
      fetchPlans();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save plan');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (plan: PlanData) => {
    try {
      const res = await fetch(`/api/v1/admin/plans/${plan.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !plan.isActive }),
      });
      if (!res.ok) throw new Error('Failed to update plan');
      toast.success(`Plan ${!plan.isActive ? 'activated' : 'deactivated'}`);
      fetchPlans();
    } catch (error) {
      toast.error('Failed to update plan');
    }
  };

  const handleDelete = async (planId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/plans/${planId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete plan');
      toast.success('Plan deleted');
      fetchPlans();
    } catch (error) {
      toast.error('Failed to delete plan');
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
      const res = await fetch(`/api/v1/admin/plans?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch plans');
      const result = await res.json();
      setData(result);
      router.push(`/admin/plans?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch plans');
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
          <h1 className="text-3xl font-bold text-notix-text">VPS Plans</h1>
          <p className="text-notix-textMuted">Manage VPS hosting plans</p>
        </div>
        <DialogTrigger asChild>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </DialogTrigger>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Plans</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search plans..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchPlans()}
                className="pl-10 w-64"
              />
            </div>
            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchPlans} disabled={loading}>
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
                      Plan: 'name',
                      Resources: 'cpu',
                      Pricing: 'priceMonthly',
                      Location: 'location',
                      Instances: 'instances',
                      Status: 'isActive',
                      Sort: 'sortOrder',
                    };
                    return ['Plan', 'Resources', 'Pricing', 'Location', 'Instances', 'Status', 'Sort', 'Actions'].map((header, i) => (
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
                {data.plans.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-notix-textMuted">
                      No plans found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.plans.map((plan) => (
                    <TableRow key={plan.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Server className="h-5 w-5 text-notix-accent" />
                          <div>
                            <p className="font-medium text-notix-text">{plan.name}</p>
                            <p className="text-sm text-notix-textMuted">{plan.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-notix-textMuted space-y-1">
                          <div>CPU: {plan.cpu} vCPU</div>
                          <div>RAM: {plan.ram} GB</div>
                          <div>Storage: {plan.storage} GB NVMe</div>
                          <div>Bandwidth: {plan.bandwidth} TB</div>
                          <div>IPs: {plan.ipv4Count} IPv4, {plan.ipv6Count} IPv6</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <p className="font-medium text-notix-text">{formatCurrency(plan.priceMonthly)}/mo</p>
                          {plan.priceYearly && (
                            <p className="text-sm text-notix-textMuted">{formatCurrency(plan.priceYearly)}/yr</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{plan.location}</TableCell>
                      <TableCell className="text-notix-textMuted">{plan._count.instances}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleActive(plan)}
                          disabled={loading}
                        >
                          {plan.isActive ? (
                            <>
                              <ToggleRight className="h-3 w-3 mr-1" />
                              Active
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="h-3 w-3 mr-1" />
                              Inactive
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{plan.sortOrder}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(plan)}>
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
                                  <AlertDialogTitle>Delete Plan</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{plan.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(plan.id)}>Delete</AlertDialogAction>
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
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} plans
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

      <PlanForm
        plan={editingPlan}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditingPlan(null); }}
        loading={submitting}
      />
    </div>
  );
}