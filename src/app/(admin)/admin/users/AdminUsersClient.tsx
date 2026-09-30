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
import { formatRelativeTime, getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  UserCheck,
  UserX,
  Mail,
  Lock,
  MoreVertical,
  Loader2,
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { requireRole } from '@/lib/auth/utils/permissions';

const ROLES = ['SUPER_ADMIN', 'ADMIN', 'SUPPORT', 'BILLING', 'CUSTOMER', 'API'] as const;
type Role = typeof ROLES[number];

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  twoFactorEnabled: boolean;
  emailVerified: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    vpsInstances: number;
    orders: number;
    tickets: number;
  };
}

interface UsersResponse {
  users: UserData[];
  total: number;
  page: number;
  totalPages: number;
}

interface AdminUsersClientProps {
  initialData: UsersResponse;
  searchParams: {
    page?: string;
    search?: string;
    role?: string;
    sort?: string;
    order?: string;
  };
}

function RoleBadge({ role }: { role: string }) {
  const roleStyles: Record<string, string> = {
    SUPER_ADMIN: 'bg-red-500/10 text-red-400',
    ADMIN: 'bg-purple-500/10 text-purple-400',
    SUPPORT: 'bg-blue-500/10 text-blue-400',
    BILLING: 'bg-yellow-500/10 text-yellow-400',
    CUSTOMER: 'bg-green-500/10 text-green-400',
    API: 'bg-gray-500/10 text-gray-400',
  };
  return (
    <Badge variant="outline" className={roleStyles[role] || 'bg-white/10 text-notix-textMuted'}>
      {role}
    </Badge>
  );
}

function StatusBadge({ verified, twoFactor }: { verified: boolean; twoFactor: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Badge variant="outline" className={cn(
        verified ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400'
      )}>
        {verified ? <UserCheck className="h-3 w-3 mr-1" /> : <Lock className="h-3 w-3 mr-1" />}
        {verified ? 'Verified' : 'Pending'}
      </Badge>
      {twoFactor && (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-400">
          <Shield className="h-3 w-3 mr-1" />
          2FA
        </Badge>
      )}
    </div>
  );
}

function UserActions({ user, onRefresh }: { user: UserData; onRefresh: () => void }) {
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [selectedRole, setSelectedRole] = React.useState<Role>(user.role as Role);
  const [loading, setLoading] = React.useState(false);

  const handleRoleChange = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success(`Role updated to ${selectedRole}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
      setRoleDialogOpen(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${user.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      toast.success('User deleted');
      onRefresh();
    } catch (error) {
      toast.error('Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="text-notix-textMuted hover:text-notix-text">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[180px]">
        <DropdownMenuItem asChild>
          <a href={`mailto:${user.email}`} className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Email
          </a>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => { setSelectedRole(user.role as Role); setRoleDialogOpen(true); }} className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          Change Role
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <DropdownMenuItem className="text-red-400 focus:text-red-400 flex items-center gap-2">
              <UserX className="h-4 w-4" />
              Delete User
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete User</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {user.name || user.email}? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function RoleChangeDialog({ open, onOpenChange, user, selectedRole, setSelectedRole, onConfirm, loading }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserData;
  selectedRole: Role;
  setSelectedRole: (role: Role) => void;
  onConfirm: () => void;
  loading: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change Role for {user.name || user.email}</DialogTitle>
          <DialogDescription>
            Current role: <strong>{user.role}</strong>. Select a new role from the dropdown.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-notix-textMuted">New Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Update Role
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminUsersClient({ initialData, searchParams }: AdminUsersClientProps) {
  const router = useRouter();
  const searchParamsHook = useSearchParams();
  const [data, setData] = React.useState<UsersResponse>(initialData);
  const [search, setSearch] = React.useState(searchParams.search || '');
  const [roleFilter, setRoleFilter] = React.useState(searchParams.role || '');
  const [sort, setSort] = React.useState(searchParams.sort || 'createdAt');
  const [order, setOrder] = React.useState<'asc' | 'desc'>((searchParams.order as 'asc' | 'desc') || 'desc');
  const [loading, setLoading] = React.useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<UserData | null>(null);
  const [selectedRole, setSelectedRole] = React.useState<Role>('CUSTOMER');
  const [roleChangeLoading, setRoleChangeLoading] = React.useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', '1');
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      params.set('sort', sort);
      params.set('order', order);

      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const result = await res.json();
      setData(result);
      router.push(`/admin/users?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch users');
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

  const handleRoleChange = async () => {
    if (!selectedUser) return;
    setRoleChangeLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      if (!res.ok) throw new Error('Failed to update role');
      toast.success(`Role updated to ${selectedRole}`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update role');
    } finally {
      setRoleChangeLoading(false);
      setRoleDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handlePageChange = async (newPage: number) => {
    setLoading(true);
    try {
      const params = new URLSearchParams(searchParamsHook.toString());
      params.set('page', newPage.toString());
      const res = await fetch(`/api/v1/admin/users?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      const result = await res.json();
      setData(result);
      router.push(`/admin/users?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error('Failed to fetch users');
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
          <h1 className="text-3xl font-bold text-notix-text">Users</h1>
          <p className="text-notix-textMuted">Manage user accounts and roles</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="text-lg">All Users</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-notix-textMuted" />
              <Input
                placeholder="Search users..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
                className="pl-10 w-64"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Roles" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Roles</SelectItem>
                {ROLES.map((role) => (
                  <SelectItem key={role} value={role}>{role}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers} disabled={loading}>
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
                      User: 'name',
                      Role: 'role',
                      Status: 'emailVerified',
                      Servers: 'vpsInstances',
                      Orders: 'orders',
                      Tickets: 'tickets',
                      Joined: 'createdAt',
                    };
                    return ['User', 'Role', 'Status', 'Servers', 'Orders', 'Tickets', 'Joined', 'Actions'].map((header, i) => (
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
                {data.users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-notix-textMuted">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  data.users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-notix-accent/10 flex items-center justify-center text-notix-accent font-medium text-sm">
                            {getInitials(user.name || user.email)}
                          </div>
                          <div>
                            <p className="text-notix-text">{user.name || 'Unnamed'}</p>
                            <p className="text-sm text-notix-textMuted">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.role} />
                      </TableCell>
                      <TableCell>
                        <StatusBadge verified={!!user.emailVerified} twoFactor={user.twoFactorEnabled} />
                      </TableCell>
                      <TableCell className="text-notix-textMuted">{user._count.vpsInstances}</TableCell>
                      <TableCell className="text-notix-textMuted">{user._count.orders}</TableCell>
                      <TableCell className="text-notix-textMuted">{user._count.tickets}</TableCell>
                      <TableCell className="text-notix-textMuted">{formatRelativeTime(user.createdAt)}</TableCell>
                      <TableCell>
                        <UserActions user={user} onRefresh={fetchUsers} />
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
                Showing {((data.page - 1) * 20) + 1} to {Math.min(data.page * 20, data.total)} of {data.total} users
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page - 1)}
                  disabled={data.page === 1 || loading}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(data.page + 1)}
                  disabled={data.page === data.totalPages || loading}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <RoleChangeDialog
        open={roleDialogOpen}
        onOpenChange={setRoleDialogOpen}
        user={selectedUser!}
        selectedRole={selectedRole}
        setSelectedRole={setSelectedRole}
        onConfirm={handleRoleChange}
        loading={roleChangeLoading}
      />
    </div>
  );
}