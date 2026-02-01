import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import {
  Search,
  Trash2,
  User,
  RefreshCw,
  CheckCircle2,
  Loader2,
  Users,
  SearchX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const ManageUsers = () => {
  const { getAllUsers, rejectUser, approveUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    fetchUsers();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setUsers([]);
      setFilteredUsers([]);
      setSearchText('');
      setActionLoading(null);
    };
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchText(value);
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(value) || 
      user.email.toLowerCase().includes(value) ||
      (user.employeeId && user.employeeId.toLowerCase().includes(value))
    );
    setFilteredUsers(filtered);
  };

  const handleDelete = async (userId) => {
    try {
      setActionLoading(userId);
      await rejectUser(userId);
      toast.success('User removed successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to remove user');
    } finally {
      setActionLoading(null);
    }
  };

  const handleApprove = async (userId) => {
    try {
      setActionLoading(userId);
      await approveUser(userId);
      toast.success('User approved successfully');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to approve user');
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadge = (role) => {
    const color = role === 'superintendent' 
      ? 'bg-blue-100 text-blue-800 border-blue-300' 
      : 'bg-green-100 text-green-800 border-green-300';
    return (
      <Badge variant="outline" className={color}>
        {role.toUpperCase()}
      </Badge>
    );
  };

  const getStatusBadge = (approved) => {
    if (approved) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Active
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Pending
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
        <p className="text-gray-600 mt-1">View and manage all registered users in the system</p>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Users</CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by name or email"
                value={searchText}
                onChange={handleSearch}
                className="pl-10 w-[250px]"
              />
            </div>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchUsers}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={7} />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={searchText ? SearchX : Users}
              title={searchText ? 'No Users Found' : 'No Users'}
              description={searchText ? 'No users found matching your search criteria. Try adjusting your filters.' : 'No users have been registered yet.'}
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        <Badge variant="outline">{user.employeeId || 'N/A'}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>{getStatusBadge(user.isApproved)}</TableCell>
                      <TableCell>
                        {format(new Date(user.createdAt), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {!user.isApproved && (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleApprove(user._id)}
                                    disabled={actionLoading === user._id}
                                  >
                                    {actionLoading === user._id ? (
                                      <Loader2 className="h-4 w-4 animate-spin text-green-600" />
                                    ) : (
                                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Approve User</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          )}
                          <AlertDialog>
                            <TooltipProvider>
                              <Tooltip>
                                <AlertDialogTrigger asChild>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      disabled={actionLoading === user._id}
                                    >
                                      {actionLoading === user._id ? (
                                        <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                                      ) : (
                                        <Trash2 className="h-4 w-4 text-red-600" />
                                      )}
                                    </Button>
                                  </TooltipTrigger>
                                </AlertDialogTrigger>
                                <TooltipContent>Delete User</TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete User</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure? This action cannot be undone. This will permanently remove the user from the system.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(user._id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageUsers;
