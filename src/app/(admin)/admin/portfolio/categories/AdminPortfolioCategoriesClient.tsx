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
  Palette,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: z.string().min(1, 'Slug is required').max(50).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  icon: z.string().optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color').optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  _count: { items: number };
}

interface CategoriesResponse {
  categories: CategoryData[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdminPortfolioCategoriesClientProps {
  initialData: CategoriesResponse;
  searchParams: {
    page?: string;
    search?: string;
    isActive?: string;
    sort?: string;
    order?: string;
  };
}

function CategoryForm({ category, onSubmit, onClose, loading }: {
  category: CategoryData | null;
  onSubmit: (data: CategoryFormData) => void;
  onClose: () => void;
  loading: boolean;
}) {
  const isEditing = !!category;
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
      icon: '',
      color: '#06b6d4',
      sortOrder: 0,
      isActive: true,
      ...category,
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Create Category'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify ${category?.name}` : 'Add a new portfolio category'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Name</label>
            <Input {...form.register('name')} placeholder="Web Hosting" />
            {form.formState.errors.name && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Slug</label>
            <Input {...form.register('slug')} placeholder="web-hosting" />
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
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Icon (Lucide name)</label>
              <Input {...form.register('icon')} placeholder="server" />
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Color</label>
              <Input type="color" {...form.register('color')} className="h-10 w-20 cursor-pointer" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Sort Order</label>
            <Input type="number" {...form.register('sortOrder')} min={0} />
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

export default function AdminPortfolioCategoriesClient({ initialData, searchParams }: AdminPortfolioCategoriesClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<CategoriesResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [isActiveFilter, setIsActiveFilter] = React.useState(searchParams.isActive || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'sortOrder');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'asc');
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<CategoryData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/portfolio/categories?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const result = await res.json();
      setData(result);
      router.push(`/admin/portfolio/categories?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch categories');
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
    setEditingCategory(null);
    setDialogOpen(true);
  };

  const openEditDialog = (category: CategoryData) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: CategoryFormData) => {
    setSubmitting(true);
    try {
      const url = editingCategory ? `/api/v1/admin/portfolio/categories/${editingCategory.id}` : '/api/v1/admin/portfolio/categories';
      const method = editingCategory ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save category');
      }
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      setDialogOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save category');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (categoryId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/portfolio/categories/${categoryId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete category');
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
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
      const res = await fetch(`/api/v1/admin/portfolio/categories?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const result = await res.json();
      setData(result);
      router.push(`/admin/portfolio/categories?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch categories');
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
          <h1 className="text-3xl font-bold text-notix-text">Portfolio Categories</h1>
          <p className="text-notix-textMuted">Manage portfolio categories</p>
        </div>
        <DialogTrigger asChild>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Category
          </Button>
        </DialogTrigger>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Categories</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchCategories()}
                className="pl-10 w-64"
              />
            </div>
            <Select value={isActiveFilter} onValueChange={setIsActiveFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchCategories} disabled={loading}>
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
                  {['Category', 'Items', 'Status', 'Order', 'Actions'].map((header, i) => (
                    <TableHead key={header} className="cursor-pointer hover:bg-white/5" onClick={() => {
                      const sortMap: Record<string, string> = {
                        Category: 'name',
                        Items: 'items',
                        Status: 'isActive',
                        Order: 'sortOrder',
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
                {data.categories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-notix-textMuted">
                      No categories found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color || '#06b6d4' }}>
                            {category.icon ? (
                              <span className="text-notix-bg font-medium text-sm">{category.icon.charAt(0).toUpperCase()}</span>
                            ) : (
                              <Palette className="h-4 w-4 text-notix-bg" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-notix-text">{category.name}</p>
                            <p className="text-sm text-notix-textMuted">{category.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{category._count.items}</TableCell>
                      <TableCell>
                        <Badge variant={category.isActive ? 'success' : 'secondary'}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{category.sortOrder}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(category)}>
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
                                  <AlertDialogTitle>Delete Category</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{category.name}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(category.id)}>Delete</AlertDialogAction>
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
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} categories
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

      <CategoryForm
        category={editingCategory}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditingCategory(null); }}
        loading={submitting}
      />
    </div>
  );
}