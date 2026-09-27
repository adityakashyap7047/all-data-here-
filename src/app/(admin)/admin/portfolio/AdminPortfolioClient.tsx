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
  Image,
  Link2,
  Star,
  Loader2,
  MoreVertical,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const portfolioItemSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1, 'Slug is required').max(100).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  description: z.string().max(500).optional(),
  content: z.string().optional(),
  image: z.string().url().optional().or(z.literal('')),
  url: z.string().url().optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().default(0),
});

type PortfolioItemFormData = z.infer<typeof portfolioItemSchema>;

interface PortfolioItemData {
  id: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string | null;
  content: string | null;
  image: string | null;
  url: string | null;
  tags: string[];
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  category: { id: string; name: string; slug: string } | null;
}

interface CategoryData {
  id: string;
  name: string;
  slug: string;
}

interface PortfolioResponse {
  items: PortfolioItemData[];
  total: number;
  page: number;
  totalPages: number;
  categories: CategoryData[];
}

interface AdminPortfolioClientProps {
  initialData: PortfolioResponse;
  searchParams: {
    page?: string;
    search?: string;
    categoryId?: string;
    isActive?: string;
    isFeatured?: string;
    sort?: string;
    order?: string;
  };
}

function PortfolioItemForm({ item, onSubmit, onClose, loading, categories }: {
  item: PortfolioItemData | null;
  onSubmit: (data: PortfolioItemFormData) => void;
  onClose: () => void;
  loading: boolean;
  categories: CategoryData[];
}) {
  const isEditing = !!item;
  const form = useForm<PortfolioItemFormData>({
    resolver: zodResolver(portfolioItemSchema),
    defaultValues: {
      categoryId: '',
      title: '',
      slug: '',
      description: '',
      content: '',
      image: '',
      url: '',
      tags: [],
      isFeatured: false,
      isActive: true,
      sortOrder: 0,
      ...item,
    },
  });

  const handleSubmit = (data: PortfolioItemFormData) => {
    onSubmit(data);
  };

  const [newTag, setNewTag] = React.useState('');
  const tags = form.watch('tags');

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      form.setValue('tags', [...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tag: string) => {
    form.setValue('tags', tags.filter(t => t !== tag));
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Portfolio Item' : 'Create Portfolio Item'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify ${item?.title}` : 'Add a new portfolio item'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Category</label>
              <Select {...form.register('categoryId')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.categoryId.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Title</label>
              <Input {...form.register('title')} placeholder="Project Title" />
              {form.formState.errors.title && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Slug</label>
              <Input {...form.register('slug')} placeholder="project-title" />
              {form.formState.errors.slug && (
                <p className="text-sm text-red-400 mt-1">{form.formState.errors.slug.message}</p>
              )}
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Sort Order</label>
              <Input type="number" {...form.register('sortOrder')} min={0} />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-notix-textMuted">Short Description</label>
            <textarea
              {...form.register('description')}
              className="w-full h-24 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-medium text-notix-textMuted">Full Content (Markdown)</label>
            <textarea
              {...form.register('content')}
              className="w-full h-48 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20 font-mono"
              rows={6}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Image URL</label>
              <Input {...form.register('image')} placeholder="https://example.com/image.jpg" />
            </div>
            <div>
              <label className="text-sm font-medium text-notix-textMuted">Project URL</label>
              <Input {...form.register('url')} placeholder="https://example.com/project" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-notix-textMuted">Tags</label>
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  placeholder="Add tag..."
                  className="w-48"
                />
                <Button type="button" variant="outline" size="sm" onClick={addTag}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <Button type="button" variant="ghost" size="icon" className="h-5 w-5 p-0" onClick={() => removeTag(tag)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register('isFeatured')}
                className="h-4 w-4 rounded border-white/20 bg-notix-surface text-notix-accent focus:ring-notix-accent"
              />
              <label className="text-sm font-medium text-notix-text">Featured</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...form.register('isActive')}
                className="h-4 w-4 rounded border-white/20 bg-notix-surface text-notix-accent focus:ring-notix-accent"
              />
              <label className="text-sm font-medium text-notix-text">Active</label>
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

export default function AdminPortfolioClient({ initialData, searchParams }: AdminPortfolioClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<PortfolioResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [categoryFilter, setCategoryFilter] = React.useState(searchParams.categoryId || '');
  const [isActiveFilter, setIsActiveFilter] = React.useState(searchParams.isActive || '');
  const [isFeaturedFilter, setIsFeaturedFilter] = React.useState(searchParams.isFeatured || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'sortOrder');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'asc');
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingItem, setEditingItem] = React.useState<PortfolioItemData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (categoryFilter) params.set('categoryId', categoryFilter);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      if (isFeaturedFilter) params.set('isFeatured', isFeaturedFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/portfolio?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const result = await res.json();
      setData(result);
      router.push(`/admin/portfolio?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch portfolio');
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
    setEditingItem(null);
    setDialogOpen(true);
  };

  const openEditDialog = (item: PortfolioItemData) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: PortfolioItemFormData) => {
    setSubmitting(true);
    try {
      const url = editingItem ? `/api/v1/admin/portfolio/${editingItem.id}` : '/api/v1/admin/portfolio';
      const method = editingItem ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save portfolio item');
      }
      toast.success(editingItem ? 'Portfolio item updated' : 'Portfolio item created');
      setDialogOpen(false);
      setEditingItem(null);
      fetchItems();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save portfolio item');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (itemId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/portfolio/${itemId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete portfolio item');
      toast.success('Portfolio item deleted');
      fetchItems();
    } catch (error) {
      toast.error('Failed to delete portfolio item');
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
      const res = await fetch(`/api/v1/admin/portfolio?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch portfolio');
      const result = await res.json();
      setData(result);
      router.push(`/admin/portfolio?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch portfolio');
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
          <h1 className="text-3xl font-bold text-notix-text">Portfolio</h1>
          <p className="text-notix-textMuted">Manage portfolio items and projects</p>
        </div>
        <DialogTrigger asChild>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create Item
          </Button>
        </DialogTrigger>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Items</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search portfolio..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchItems()}
                className="pl-10 w-64"
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                {data.categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Select value={isFeaturedFilter} onValueChange={setIsFeaturedFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Featured</SelectItem>
                <SelectItem value="false">Not Featured</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchItems} disabled={loading}>
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
                  {['Item', 'Category', 'Tags', 'Status', 'Featured', 'Order', 'Published', 'Actions'].map((header, i) => (
                    <TableHead key={header} className="cursor-pointer hover:bg-white/5" onClick={() => {
                      const sortMap: Record<string, string> = {
                        Item: 'title',
                        Category: 'category',
                        Status: 'isActive',
                        Featured: 'isFeatured',
                        Order: 'sortOrder',
                        Published: 'publishedAt',
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
                {data.items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-notix-textMuted">
                      No portfolio items found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="h-10 w-10 rounded-lg object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium text-notix-text">{item.title}</p>
                            <p className="text-sm text-notix-textMuted">{item.slug}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">
                        {item.category?.name || 'Uncategorized'}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {item.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs">+{item.tags.length - 3}</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isActive ? 'success' : 'secondary'}>
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {item.isFeatured && <Star className="h-4 w-4 text-yellow-400" />}
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{item.sortOrder}</TableCell>
                      <TableCell className="text-notix-textMuted">
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : 'Not published'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(item)}>
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
                                  <AlertDialogTitle>Delete Portfolio Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{item.title}"? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
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
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} items
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

      <PortfolioItemForm
        item={editingItem}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditingItem(null); }}
        loading={submitting}
        categories={data.categories}
      />
    </div>
  );
}