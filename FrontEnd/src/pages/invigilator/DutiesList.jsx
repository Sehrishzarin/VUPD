import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  CheckCircle2, 
  Clock, 
  XCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  ClipboardList
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
import { DashboardStatsSkeleton } from '@/components/ui/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

const DutiesList = () => {
  const { getMyDuties, markAttendance, requestLeave } = useAuth();
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attendanceLoading, setAttendanceLoading] = useState(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [stats, setStats] = useState({});
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [selectedDuty, setSelectedDuty] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [confirmDuty, setConfirmDuty] = useState(null);

  const form = useForm({
    defaultValues: {
      reason: '',
    },
  });

  useEffect(() => {
    fetchDuties();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setDuties([]);
      setStats({});
      setFilterStatus('all');
      setLeaveModalVisible(false);
      setSelectedDuty(null);
      setConfirmDuty(null);
      setError('');
    };
  }, [filterStatus]);

  const fetchDuties = async () => {
    try {
      setLoading(true);
      setError('');
      const params = filterStatus !== 'all' ? { status: filterStatus } : {};
      const data = await getMyDuties(params);
      
      const dutiesArray = Array.isArray(data) ? data : (data.duties || []);
      
      setDuties(dutiesArray);
      calculateStats(dutiesArray);
    } catch (err) {
      console.error('Failed to fetch duties:', err);
      setError('Failed to fetch duties. Please try again.');
      toast.error('Failed to fetch duties');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (dutiesList) => {
    const total = dutiesList.length;
    const completed = dutiesList.filter(d => 
      d.attendanceStatus === 'present' || d.attendanceStatus === 'late'
    ).length;
    const pending = dutiesList.filter(d => 
      d.attendanceStatus === 'pending'
    ).length;
    const upcoming = dutiesList.filter(d => 
      new Date(d.date) > new Date()
    ).length;

    setStats({
      total,
      completed,
      pending,
      upcoming,
      completionRate: total > 0 ? ((completed / total) * 100).toFixed(1) : 0
    });
  };

  const handleRequestLeave = (duty) => {
    setSelectedDuty(duty);
    setLeaveModalVisible(true);
    setError('');
  };

  const submitLeaveRequest = async (values) => {
    try {
      setLeaveLoading(true);
      
      const result = await requestLeave(selectedDuty._id, values.reason);
      console.log('Leave request submitted successfully:', result);
      
      toast.success('Leave request submitted successfully!');
      setLeaveModalVisible(false);
      form.reset();
      fetchDuties();
    } catch (err) {
      console.error('Leave request error:', err);
      const errorMsg = err.message || err.response?.data?.msg || 'Failed to submit leave request';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLeaveLoading(false);
    }
  };

  const canRequestLeave = (duty) => {
    if (duty.attendanceStatus !== 'pending') return false;
    
    const dutyDate = new Date(duty.date);
    const today = new Date();
    
    return dutyDate > today;
  };

  const canMarkAttendance = (duty) => {
    if (duty.attendance) {
      return false;
    }
    
    if (duty.attendanceStatus !== 'pending') {
      return false;
    }
    
    const dutyDate = new Date(duty.date);
    const today = new Date();
    
    const dutyDay = new Date(dutyDate.getFullYear(), dutyDate.getMonth(), dutyDate.getDate());
    const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    return dutyDay.getTime() === todayDay.getTime();
  };

  const handleMarkAttendance = async (dutyId) => {
    try {
      setAttendanceLoading(dutyId);
      setError('');
      
      const result = await markAttendance(dutyId);
      console.log('Attendance marked successfully:', result);
      
      toast.success(`Attendance marked successfully! Status: ${result.status}`);
      setConfirmDuty(null);
      fetchDuties();
    } catch (err) {
      console.error('Attendance marking error:', err);
      const errorMsg = err.response?.data?.msg || err.message || 'Failed to mark attendance';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setAttendanceLoading(null);
    }
  };

  const getStatusBadge = (duty) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="h-3 w-3" />, text: 'Upcoming' },
      present: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Present' },
      late: { variant: 'outline', className: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: <AlertCircle className="h-3 w-3" />, text: 'Late' },
      absent: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" />, text: 'Absent' },
      excused: { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Excused' },
    };
    
    const config = statusConfig[duty.attendanceStatus] || statusConfig.pending;
    
    const dutyDate = new Date(duty.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (duty.attendanceStatus === 'pending' && dutyDate < today) {
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
          <XCircle className="h-3 w-3 mr-1" />
          Missed
        </Badge>
      );
    }
    
    return (
      <Badge variant={config.variant} className={config.className}>
        <span className="flex items-center gap-1">
          {config.icon}
          {config.text}
        </span>
      </Badge>
    );
  };

  const getActionButtons = (duty) => {
    const actions = [];
    
    if (canMarkAttendance(duty)) {
      actions.push(
        <AlertDialog key="attendance">
          <AlertDialogTrigger asChild>
            <Button 
              variant="default"
              size="sm"
              onClick={() => setConfirmDuty(duty)}
            >
              {attendanceLoading === duty._id ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : null}
              Mark Attendance
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Mark Attendance Confirmation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to mark attendance for this duty?
              </AlertDialogDescription>
            </AlertDialogHeader>
            {confirmDuty && (
              <div className="space-y-2 py-4">
                <div><strong>Exam:</strong> {confirmDuty.examName}</div>
                <div><strong>Date:</strong> {format(new Date(confirmDuty.date), 'EEE, MMM dd, yyyy')}</div>
                <div><strong>Time:</strong> {confirmDuty.timeSlot}</div>
                <div><strong>Center:</strong> {confirmDuty.center}</div>
              </div>
            )}
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => confirmDuty && handleMarkAttendance(confirmDuty._id)}>
                Yes, Mark Attendance
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      );
    }
    
    if (canRequestLeave(duty)) {
      actions.push(
        <Button 
          key="leave" 
          variant="outline"
          size="sm"
          onClick={() => handleRequestLeave(duty)}
        >
          Request Leave
        </Button>
      );
    }
    
    if (actions.length === 0) {
      if (duty.attendance) {
        actions.push(<span key="status" className="text-sm text-gray-500">Attendance Marked</span>);
      } else if (duty.attendanceStatus === 'absent') {
        actions.push(<span key="status" className="text-sm text-gray-500">Marked Absent</span>);
      } else if (duty.attendanceStatus === 'excused') {
        actions.push(<span key="status" className="text-sm text-gray-500">Excused</span>);
      }
    }
    
    return actions.length > 0 ? <div className="flex gap-2">{actions}</div> : <span className="text-gray-400">-</span>;
  };

  const filteredDuties = filterStatus === 'all' 
    ? duties 
    : duties.filter(duty => {
        if (filterStatus === 'pending') return duty.attendanceStatus === 'pending';
        if (filterStatus === 'present') return duty.attendanceStatus === 'present' || duty.attendanceStatus === 'late';
        if (filterStatus === 'absent') return duty.attendanceStatus === 'absent';
        return true;
      });

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">My Duties</h2>
        <p className="text-gray-600 mt-1">View and manage your assigned examination duties</p>
      </div>
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Duties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.total || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <div className="text-3xl font-bold text-green-600">{stats.completed || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Upcoming</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-600" />
              <div className="text-3xl font-bold text-yellow-600">{stats.upcoming || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{stats.completionRate || 0}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>My Duties</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="pending">Upcoming</SelectItem>
                <SelectItem value="present">Completed</SelectItem>
                <SelectItem value="absent">Missed</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchDuties}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredDuties.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No Duties Assigned"
              description="You don't have any duties assigned yet. Check back later or contact your administrator."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam Name</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Payment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDuties.map((duty) => (
                    <TableRow key={duty._id}>
                      <TableCell className="font-medium">{duty.examName}</TableCell>
                      <TableCell>{format(new Date(duty.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell>{duty.timeSlot}</TableCell>
                      <TableCell>{duty.center}</TableCell>
                      <TableCell>{duty.paymentAmount ? `₨${duty.paymentAmount}` : '-'}</TableCell>
                      <TableCell>{getStatusBadge(duty)}</TableCell>
                      <TableCell>{getActionButtons(duty)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leave Request Modal */}
      <Dialog open={leaveModalVisible} onOpenChange={setLeaveModalVisible}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Request Leave</DialogTitle>
            <DialogDescription>
              Submit a leave request for the selected duty
            </DialogDescription>
          </DialogHeader>
          {selectedDuty && (
            <Card className="mb-4">
              <CardContent className="pt-4">
                <div className="space-y-2">
                  <div><strong>Exam:</strong> {selectedDuty.examName}</div>
                  <div><strong>Date:</strong> {format(new Date(selectedDuty.date), 'EEE, MMM dd, yyyy')}</div>
                  <div><strong>Time:</strong> {selectedDuty.timeSlot}</div>
                  <div><strong>Center:</strong> {selectedDuty.center}</div>
                </div>
              </CardContent>
            </Card>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitLeaveRequest)} className="space-y-4">
              <FormField
                control={form.control}
                name="reason"
                rules={{ required: 'Please provide a reason for your leave request' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reason for Leave</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={4}
                        placeholder="Please explain why you need leave for this duty. Be specific about your reason..."
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
                    setLeaveModalVisible(false);
                    form.reset();
                    setError('');
                  }}
                  disabled={leaveLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={leaveLoading}>
                  {leaveLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Request'
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

export default DutiesList;
