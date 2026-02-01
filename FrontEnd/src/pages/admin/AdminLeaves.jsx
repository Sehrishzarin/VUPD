import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Eye,
  CalendarX
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const AdminLeaves = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(null);
  const [stats, setStats] = useState({});
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');

  const { getAllLeaveRequests, reviewLeaveRequest } = useAuth();

  const form = useForm({
    defaultValues: {
      action: 'approve',
      adminComment: '',
    },
  });

  useEffect(() => {
    fetchLeaveRequests();
  }, [filterStatus]);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await getAllLeaveRequests(params);
      
      // Handle both array and object response formats
      const leavesArray = Array.isArray(data) ? data : (data.leaves || data || []);
      setLeaves(leavesArray);
      calculateStats(leavesArray);
      
    } catch (err) {
      console.error('Failed to fetch leave requests:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to fetch leave requests';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (leavesList) => {
    const total = leavesList.length;
    const pending = leavesList.filter(l => l.status === 'pending').length;
    const approved = leavesList.filter(l => l.status === 'approved').length;
    const rejected = leavesList.filter(l => l.status === 'rejected').length;

    setStats({
      total,
      pending,
      approved,
      rejected,
      pendingRate: total > 0 ? ((pending / total) * 100).toFixed(1) : 0
    });
  };

  const handleReviewLeave = (leave, action = null) => {
    setSelectedLeave(leave);
    setReviewModalVisible(true);
    form.setValue('action', action || 'approve');
    form.setValue('adminComment', '');
    setError('');
  };

  const submitReview = async (values) => {
    if (!selectedLeave) return;

    try {
      setReviewLoading(selectedLeave._id);
      setError('');

      const result = await reviewLeaveRequest(
        selectedLeave._id,
        values.action,
        values.adminComment
      );

      console.log('Leave review result:', result);
      toast.success(`Leave request ${values.action}d successfully!`);
      
      setReviewModalVisible(false);
      form.reset();
      fetchLeaveRequests();
      
    } catch (err) {
      console.error('Leave review error:', err);
      const errorMsg = err.response?.data?.msg || 'Failed to review leave request';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setReviewLoading(null);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="h-3 w-3" />, text: 'Pending' },
      approved: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Approved' },
      rejected: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" />, text: 'Rejected' },
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.text}
        </span>
      </Badge>
    );
  };

  const getActionButtons = (leave) => {
    if (leave.status !== 'pending') {
      return (
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">Reviewed</Badge>
          <Button 
            size="sm" 
            variant="outline"
            onClick={() => handleReviewLeave(leave)}
          >
            <Eye className="h-4 w-4 mr-1" />
            View Details
          </Button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleReviewLeave(leave, 'approve')}
            >
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Approve
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Approve Leave Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to approve this leave request?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleReviewLeave(leave, 'approve');
                setReviewModalVisible(true);
              }}>
                Yes, Approve
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => handleReviewLeave(leave, 'reject')}
            >
              <XCircle className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to reject this leave request?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => {
                handleReviewLeave(leave, 'reject');
                setReviewModalVisible(true);
              }}>
                Yes, Reject
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button 
          size="sm" 
          variant="outline"
          onClick={() => handleReviewLeave(leave)}
        >
          <Eye className="h-4 w-4 mr-1" />
          Review
        </Button>
      </div>
    );
  };

  const filteredLeaves = filterStatus === 'all' 
    ? leaves 
    : leaves.filter(leave => leave.status === filterStatus);

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Leave Requests</h2>
        <p className="text-gray-600 mt-1">Review and manage leave requests from invigilators</p>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Leave Request Management</h2>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{stats.total || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pending || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.approved || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{stats.rejected || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Requests Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Leave Requests</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchLeaveRequests}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={6} />
          ) : filteredLeaves.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No Leave Requests"
              description="No leave requests found matching your filters. Try adjusting your search criteria."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Exam Details</TableHead>
                    <TableHead>Leave Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Requested At</TableHead>
                    <TableHead>Admin Comment</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{leave.userId?.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {leave.userId?.employeeId || 'No ID'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {leave.userId?.role || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{leave.dutyId?.examName || 'N/A'}</div>
                          <div className="text-sm text-gray-500">
                            {leave.dutyId?.date ? format(new Date(leave.dutyId.date), 'MMM dd, yyyy') : 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">
                            {leave.dutyId?.timeSlot || 'N/A'} • {leave.dutyId?.center || 'N/A'}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={leave.reason}>
                          {leave.reason || 'No reason provided'}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell>
                        {format(new Date(leave.requestedAt), 'MMM dd, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {leave.adminComment || '-'}
                      </TableCell>
                      <TableCell>{getActionButtons(leave)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Modal */}
      <Dialog open={reviewModalVisible} onOpenChange={setReviewModalVisible}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Review Leave Request</DialogTitle>
            <DialogDescription>
              Review and approve or reject the leave request
            </DialogDescription>
          </DialogHeader>
          {selectedLeave && (
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-lg">Leave Request Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Employee</Label>
                    <div>{selectedLeave.userId?.name || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      {selectedLeave.userId?.employeeId || 'No ID'} • {selectedLeave.userId?.role || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Exam</Label>
                    <div>{selectedLeave.dutyId?.examName || 'N/A'}</div>
                    <div className="text-sm text-gray-500">
                      {selectedLeave.dutyId?.date ? format(new Date(selectedLeave.dutyId.date), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold">Time Slot</Label>
                    <div>{selectedLeave.dutyId?.timeSlot || 'N/A'}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-semibold">Center</Label>
                    <div>{selectedLeave.dutyId?.center || 'N/A'}</div>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-semibold">Reason</Label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-md">
                    {selectedLeave.reason || 'No reason provided'}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitReview)} className="space-y-4">
              <FormField
                control={form.control}
                name="action"
                rules={{ required: 'Please select an action' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Action</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="approve">
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            Approve Leave
                          </span>
                        </SelectItem>
                        <SelectItem value="reject">
                          <span className="flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-red-600" />
                            Reject Leave
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="adminComment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Comments (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Add any comments or notes for the employee..."
                        maxLength={500}
                        {...field}
                      />
                    </FormControl>
                    <div className="text-xs text-gray-500">
                      {field.value?.length || 0} / 500 characters
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setReviewModalVisible(false);
                    form.reset();
                    setError('');
                  }}
                  disabled={reviewLoading === selectedLeave?._id}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={reviewLoading === selectedLeave?._id}
                >
                  {reviewLoading === selectedLeave?._id ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      Submit Review
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminLeaves;
