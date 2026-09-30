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
  HelpCircle,
} from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const faqSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required'),
  category: z.string().min(1, 'Category is required').max(100),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
});

type FAQFormData = z.infer<typeof faqSchema>;

interface FAQData {
  id: string;
  question: string;
  answer: string;
  category: string;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface FAQResponse {
  faqs: FAQData[];
  total: number;
  page: number;
  totalPages: number;
  categories: string[];
}

interface AdminFAQClientProps {
  initialData: FAQResponse;
  searchParams: {
    page?: string;
    search?: string;
    category?: string;
    isActive?: string;
    sort?: string;
    order?: string;
  };
}

function FAQForm({ faq, onSubmit, onClose, loading, categories }: {
  faq: FAQData | null;
  onSubmit: (data: FAQFormData) => void;
  onClose: () => void;
  loading: boolean;
  categories: string[];
}) {
  const isEditing = !!faq;
  const form = useForm<FAQFormData>({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      question: '',
      answer: '',
      category: '',
      sortOrder: 0,
      isActive: true,
      ...faq,
    },
  });

  const handleSubmit = (data: FAQFormData) => {
    onSubmit(data);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit FAQ' : 'Create FAQ'}</DialogTitle>
          <DialogDescription>
            {isEditing ? `Modify "${faq?.question.substring(0, 50)}..."` : 'Add a new frequently asked question'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">Category</label>
            <Select {...form.register('category')}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.category && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.category.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-notix-textMuted">Question</label>
            <Input {...form.register('question')} placeholder="How do I reset my password?" />
            {form.formState.errors.question && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.question.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-notix-textMuted">Answer</label>
            <textarea
              {...form.register('answer')}
              className="w-full h-48 rounded-lg border border-white/10 bg-notix-surface px-3 py-2 text-sm text-notix-text placeholder:text-notix-textMuted/50 focus:border-notix-accent focus:outline-none focus:ring-2 focus:ring-notix-accent/20"
              rows={8}
            />
            {form.formState.errors.answer && (
              <p className="text-sm text-red-400 mt-1">{form.formState.errors.answer.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

export default function AdminFAQClient({ initialData, searchParams }: AdminFAQClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<FAQResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [categoryFilter, setCategoryFilter] = React.useState(searchParams.category || '');
  const [isActiveFilter, setIsActiveFilter] = React.useState(searchParams.isActive || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'sortOrder');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'asc');
  const [loading, setLoading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [editingFAQ, setEditingFAQ] = React.useState<FAQData | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState<string | null>(null);

  const fetchFAQs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (categoryFilter) params.set('category', categoryFilter);
      if (isActiveFilter) params.set('isActive', isActiveFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/faq?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch FAQs');
      const result = await res.json();
      setData(result);
      router.push(`/admin/faqs?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch FAQs');
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
    setEditingFAQ(null);
    setDialogOpen(true);
  };

  const openEditDialog = (faq: FAQData) => {
    setEditingFAQ(faq);
    setDialogOpen(true);
  };

  const handleSubmit = async (formData: FAQFormData) => {
    setSubmitting(true);
    try {
      const url = editingFAQ ? `/api/v1/admin/faq/${editingFAQ.id}` : '/api/v1/admin/faq';
      const method = editingFAQ ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error?.message || 'Failed to save FAQ');
      }
      toast.success(editingFAQ ? 'FAQ updated' : 'FAQ created');
      setDialogOpen(false);
      setEditingFAQ(null);
      fetchFAQs();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save FAQ');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (faqId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/faq/${faqId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete FAQ');
      toast.success('FAQ deleted');
      fetchFAQs();
    } catch (error) {
      toast.error('Failed to delete FAQ');
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
      const res = await fetch(`/api/v1/admin/faq?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch FAQs');
      const result = await res.json();
      setData(result);
      router.push(`/admin/faqs?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch FAQs');
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
          <h1 className="text-3xl font-bold text-notix-text">FAQs</h1>
          <p className="text-notix-textMuted">Manage frequently asked questions</p>
        </div>
        <DialogTrigger asChild>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Create FAQ
          </Button>
        </DialogTrigger>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All FAQs</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search FAQs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchFAQs()}
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
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
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
            <Button variant="outline" onClick={fetchFAQs} disabled={loading}>
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
                      Question: 'question',
                      Category: 'category',
                      Status: 'isActive',
                      Order: 'sortOrder',
                    };
                    return ['Question', 'Category', 'Status', 'Order', 'Actions'].map((header, i) => (
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
                {data.faqs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-12 text-notix-textMuted">
                      No FAQs found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-notix-text max-w-md truncate">{faq.question}</p>
                          <p className="text-sm text-notix-textMuted line-clamp-2">{faq.answer}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">
                        <Badge variant="outline">{faq.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={faq.isActive ? 'success' : 'secondary'}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{faq.sortOrder}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(faq)}>
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
                                  <AlertDialogTitle>Delete FAQ</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete this FAQ? This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(faq.id)}>Delete</AlertDialogAction>
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
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} FAQs
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

      <FAQForm
        faq={editingFAQ}
        onSubmit={handleSubmit}
        onClose={() => { setDialogOpen(false); setEditingFAQ(null); }}
        loading={submitting}
        categories={data.categories}
      />
    </div>
  );
}