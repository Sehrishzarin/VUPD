import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  CheckCircle2,
  XCircle,
  DollarSign,
  PlayCircle,
  Clock,
  RefreshCw,
  Wallet
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const PaymentApproval = () => {
  const { 
    getAllWithdrawals, 
    processWithdrawal,
    getAllDuties,
    verifyAttendance,
    approvePayments
  } = useAuth();
  const [withdrawals, setWithdrawals] = useState([]);
  const [allWithdrawals, setAllWithdrawals] = useState([]); // For statistics
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dutiesLoading, setDutiesLoading] = useState(false);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [dutyFilter, setDutyFilter] = useState('unpaid');
  const [selectedDuties, setSelectedDuties] = useState([]);
  const [approvingPayments, setApprovingPayments] = useState(false);

  const form = useForm({
    defaultValues: {
      action: '',
      transactionId: '',
      adminNotes: '',
    },
  });

  useEffect(() => {
    fetchWithdrawals();
    fetchAllWithdrawalsForStats();
    fetchDuties();
  }, [filterStatus]);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const data = await getAllWithdrawals({ status: filterStatus });
      setWithdrawals(data.withdrawals || data);
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
      toast.error('Failed to load withdrawal requests');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllWithdrawalsForStats = async () => {
    try {
      // Fetch all withdrawals for accurate statistics
      const data = await getAllWithdrawals({ status: 'all' });
      setAllWithdrawals(data.withdrawals || data);
    } catch (err) {
      console.error('Failed to fetch all withdrawals for stats:', err);
      // Don't show error toast, just use filtered withdrawals for stats
      setAllWithdrawals(withdrawals);
    }
  };

  const fetchDuties = async () => {
    try {
      setDutiesLoading(true);
      const dutiesData = await getAllDuties();
      const dutiesArray = dutiesData.duties || dutiesData;
      setDuties(dutiesArray);
    } catch (err) {
      console.error('Failed to fetch duties:', err);
      toast.error('Failed to load duties');
    } finally {
      setDutiesLoading(false);
    }
  };

  const handleVerify = async (dutyId) => {
    try {
      setDutiesLoading(true);
      await verifyAttendance(dutyId, "verify", "Verified by Admin");
      toast.success("Attendance Verified!");
      fetchDuties();
    } catch (err) {
      toast.error("Verification failed");
    } finally {
      setDutiesLoading(false);
    }
  };

  const handleApprovePayment = async (dutyId) => {
    try {
      setApprovingPayments(true);
      await approvePayments([dutyId], false);
      toast.success("Payment approved successfully!");
      fetchDuties();
      setSelectedDuties(selectedDuties.filter(id => id !== dutyId));
    } catch (err) {
      console.error('Approve payment error:', err);
      toast.error('Failed to approve payment');
    } finally {
      setApprovingPayments(false);
    }
  };

  const handleBulkApprovePayments = async () => {
    if (selectedDuties.length === 0) {
      toast.warning("Please select at least one duty to approve");
      return;
    }

    try {
      setApprovingPayments(true);
      await approvePayments(selectedDuties, false);
      toast.success(`Payments approved for ${selectedDuties.length} duty/duties!`);
      fetchDuties();
      setSelectedDuties([]);
    } catch (err) {
      console.error('Bulk approve payments error:', err);
      toast.error('Failed to approve payments');
    } finally {
      setApprovingPayments(false);
    }
  };

  const getFilteredDuties = () => {
    if (dutyFilter === 'paid') {
      return duties.filter(d => d.paymentApproved);
    }
    if (dutyFilter === 'unpaid') {
      return duties.filter(d => 
        !d.paymentApproved && 
        ['present', 'late', 'excused'].includes(d.attendanceStatus)
      );
    }
    return duties;
  };

  const getPaymentStatusBadge = (duty) => {
    const isEligible = ['present', 'late', 'excused'].includes(duty.attendanceStatus);

    if (!isEligible) {
      const reason = duty.attendanceStatus === 'absent' ? 'Absent' : 'Pending Attendance';
      return <Badge variant="outline" className="bg-gray-100 text-gray-800 border-gray-300">{reason}</Badge>;
    }

    if (duty.paymentApproved) {
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Paid
        </Badge>
      );
    }

    return (
      <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
        <Clock className="h-3 w-3 mr-1" />
        Unpaid
      </Badge>
    );
  };

  const getAttendanceStatusBadge = (status) => {
    const statusConfig = {
      present: { className: 'bg-green-100 text-green-800 border-green-300', text: 'Present' },
      late: { className: 'bg-yellow-100 text-yellow-800 border-yellow-300', text: 'Late' },
      excused: { className: 'bg-blue-100 text-blue-800 border-blue-300', text: 'Excused' },
      absent: { className: 'bg-red-100 text-red-800 border-red-300', text: 'Absent' },
    };
    const config = statusConfig[status] || { className: 'bg-gray-100 text-gray-800 border-gray-300', text: status };
    return <Badge variant="outline" className={config.className}>{config.text}</Badge>;
  };

  const handleProcessWithdrawal = (withdrawal, action) => {
    setSelectedWithdrawal(withdrawal);
    if (action === 'mark_processed') {
      form.setValue('action', 'mark_processed');
      form.setValue('transactionId', `TXN${Date.now()}`);
    } else {
      form.setValue('action', action);
    }
    setProcessModalVisible(true);
  };

  const executeAction = async (withdrawal, action) => {
    try {
      await processWithdrawal(withdrawal._id, action, {});
      toast.success(`Withdrawal ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
      fetchWithdrawals();
      fetchAllWithdrawalsForStats();
    } catch (err) {
      console.error('Failed to process withdrawal:', err);
      toast.error('Failed to process withdrawal');
    }
  };

  const submitProcess = async (values) => {
    try {
      await processWithdrawal(selectedWithdrawal._id, values.action, {
        adminNotes: values.adminNotes,
        transactionId: values.transactionId
      });
      
      setProcessModalVisible(false);
      form.reset();
      toast.success('Withdrawal processed successfully');
      fetchWithdrawals();
      fetchAllWithdrawalsForStats();
    } catch (err) {
      console.error('Failed to process withdrawal:', err);
      toast.error('Failed to process withdrawal');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="h-3 w-3" />, text: 'Pending' },
      approved: { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Approved' },
      rejected: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" />, text: 'Rejected' },
      processed: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Paid' },
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

  const getActionButtons = (withdrawal) => {
    if (withdrawal.status === 'pending') {
      return (
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="default" size="sm">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Approve
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Approve Withdrawal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to approve this withdrawal request?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => executeAction(withdrawal, 'approve')}>
                  Approve
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-1" />
                Reject
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Withdrawal</AlertDialogTitle>
                <AlertDialogDescription>
                  Are you sure you want to reject this withdrawal request?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => executeAction(withdrawal, 'reject')}>
                  Reject
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      );
    }
    
    if (withdrawal.status === 'approved') {
      return (
        <Button 
          variant="default" 
          size="sm"
          onClick={() => handleProcessWithdrawal(withdrawal, 'mark_processed')}
        >
          <PlayCircle className="h-4 w-4 mr-1" />
          Mark as Paid
        </Button>
      );
    }
    
    return <Badge variant="outline" className="bg-gray-100 text-gray-800">Processed</Badge>;
  };

  // Use allWithdrawals for stats, fallback to withdrawals if not loaded yet
  const withdrawalsForStats = allWithdrawals.length > 0 ? allWithdrawals : withdrawals;
  
  const stats = {
    pending: withdrawalsForStats.filter(w => w.status === 'pending').length,
    approved: withdrawalsForStats.filter(w => w.status === 'approved').length,
    processed: withdrawalsForStats.filter(w => w.status === 'processed').length,
    rejected: withdrawalsForStats.filter(w => w.status === 'rejected').length,
    totalAmount: withdrawalsForStats.reduce((sum, w) => sum + (w.amount || 0), 0),
    pendingAmount: withdrawalsForStats.filter(w => w.status === 'pending').reduce((sum, w) => sum + (w.amount || 0), 0),
    approvedAmount: withdrawalsForStats.filter(w => w.status === 'approved').reduce((sum, w) => sum + (w.amount || 0), 0),
    processedAmount: withdrawalsForStats.filter(w => w.status === 'processed').reduce((sum, w) => sum + (w.amount || 0), 0),
    rejectedAmount: withdrawalsForStats.filter(w => w.status === 'rejected').reduce((sum, w) => sum + (w.amount || 0), 0),
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Payment Approval</h2>
        <p className="text-gray-600 mt-1">Review and approve payment withdrawal requests and duty payments</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="duty-payments" className="w-full">
        <TabsList>
          <TabsTrigger value="duty-payments">Duty Payments</TabsTrigger>
          <TabsTrigger value="withdrawals">Withdrawal Requests</TabsTrigger>
        </TabsList>

        {/* Duty Payments Tab */}
        <TabsContent value="duty-payments" className="space-y-6">
          {/* Statistics for Duty Payments */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Unpaid Duties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {duties.filter(d => !d.paymentApproved && ['present', 'late', 'excused'].includes(d.attendanceStatus)).length}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  ₨{duties
                    .filter(d => !d.paymentApproved && ['present', 'late', 'excused'].includes(d.attendanceStatus))
                    .reduce((sum, d) => sum + (d.paymentAmount || 0), 0)
                    .toFixed(2)} pending
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Paid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  ₨{duties
                    .filter(d => d.paymentApproved)
                    .reduce((sum, d) => sum + (d.paymentAmount || 0), 0)
                    .toFixed(2)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {duties.filter(d => d.paymentApproved).length} duties paid
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Duties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{duties.length}</div>
                <p className="text-xs text-gray-500 mt-1">
                  ₨{duties.reduce((sum, d) => sum + (d.paymentAmount || 0), 0).toFixed(2)} total
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Duty Payments Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Duty Payments</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={dutyFilter} onValueChange={setDutyFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="unpaid">Unpaid</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
                {selectedDuties.length > 0 && (
                  <Button 
                    onClick={handleBulkApprovePayments}
                    disabled={approvingPayments}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign className="h-4 w-4 mr-1" />
                    Approve Selected ({selectedDuties.length})
                  </Button>
                )}
                <Button onClick={fetchDuties} disabled={dutiesLoading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${dutiesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {dutiesLoading ? (
                <TableSkeleton rows={5} columns={8} />
              ) : getFilteredDuties().length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No Duties Found"
                  description="No duties found matching your filters."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">
                          <Checkbox
                            checked={selectedDuties.length === getFilteredDuties().filter(d => 
                              !d.paymentApproved && ['present', 'late', 'excused'].includes(d.attendanceStatus)
                            ).length && selectedDuties.length > 0}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                const eligibleDuties = getFilteredDuties()
                                  .filter(d => !d.paymentApproved && ['present', 'late', 'excused'].includes(d.attendanceStatus))
                                  .map(d => d._id);
                                setSelectedDuties(eligibleDuties);
                              } else {
                                setSelectedDuties([]);
                              }
                            }}
                          />
                        </TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Exam Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Attendance</TableHead>
                        <TableHead>Payment</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredDuties().map((duty) => {
                        const isEligible = !duty.paymentApproved && ['present', 'late', 'excused'].includes(duty.attendanceStatus);
                        const isSelected = selectedDuties.includes(duty._id);
                        
                        return (
                          <TableRow key={duty._id}>
                            <TableCell>
                              {isEligible && (
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setSelectedDuties([...selectedDuties, duty._id]);
                                    } else {
                                      setSelectedDuties(selectedDuties.filter(id => id !== duty._id));
                                    }
                                  }}
                                />
                              )}
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{duty.assignedTo?.name || 'N/A'}</div>
                                <div className="text-sm text-gray-500">
                                  {duty.assignedTo?.employeeId || ''} • {duty.assignedToRole?.toUpperCase() || ''}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{duty.examName}</div>
                                <div className="text-sm text-gray-500">{duty.center}</div>
                              </div>
                            </TableCell>
                            <TableCell>{format(new Date(duty.date), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{getAttendanceStatusBadge(duty.attendanceStatus)}</TableCell>
                            <TableCell>{getPaymentStatusBadge(duty)}</TableCell>
                            <TableCell className="text-right font-semibold">
                              ₨{duty.paymentAmount || 0}
                            </TableCell>
                            <TableCell>
                              {duty.attendanceStatus === 'present' && !duty.attendanceVerified ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleVerify(duty._id)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  Verify
                                </Button>
                              ) : duty.attendanceVerified && !duty.paymentApproved && ['present', 'late', 'excused'].includes(duty.attendanceStatus) ? (
                                <Button
                                  size="sm"
                                  onClick={() => handleApprovePayment(duty._id)}
                                  disabled={approvingPayments}
                                  className="bg-blue-600 hover:bg-blue-700"
                                >
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  Approve Payment
                                </Button>
                              ) : duty.paymentApproved ? (
                                <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Paid
                                </Badge>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Withdrawal Requests Tab */}
        <TabsContent value="withdrawals" className="space-y-6">
          {/* Statistics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Pending Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                <p className="text-xs text-gray-500 mt-1">₨{stats.pendingAmount.toFixed(2)} pending</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Approved Amount</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">₨{stats.approvedAmount.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.approved} request{stats.approved !== 1 ? 's' : ''}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Processed (Paid)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">₨{stats.processedAmount.toFixed(2)}</div>
                <p className="text-xs text-gray-500 mt-1">{stats.processed} request{stats.processed !== 1 ? 's' : ''} paid</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{withdrawals.length}</div>
                <p className="text-xs text-gray-500 mt-1">₨{stats.totalAmount.toFixed(2)} total</p>
              </CardContent>
            </Card>
          </div>

          {/* Withdrawal Requests Table */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Withdrawal Requests</CardTitle>
              <div className="flex items-center gap-2">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Filter status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="processed">Processed</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={fetchWithdrawals} disabled={loading} variant="outline" size="sm">
                  <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <TableSkeleton rows={5} columns={7} />
              ) : withdrawals.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No Withdrawal Requests"
                  description="No payment withdrawal requests found. All requests have been processed."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Payment Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead>Account Details</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => {
                        const accountDetails = withdrawal.accountDetails;
                        let accountInfo = 'Cash Collection';
                        if (withdrawal.paymentMethod === 'bank_transfer') {
                          accountInfo = `${accountDetails?.bankName} - ${accountDetails?.accountNumber}`;
                        } else if (withdrawal.paymentMethod === 'easypaisa' || withdrawal.paymentMethod === 'jazzcash') {
                          accountInfo = `${accountDetails?.phoneNumber} (${accountDetails?.network})`;
                        }

                        return (
                          <TableRow key={withdrawal._id}>
                            <TableCell>
                              <div>
                                <div className="font-semibold">{withdrawal.userId?.name}</div>
                                <div className="text-sm text-gray-500">
                                  {withdrawal.userId?.employeeId} • {withdrawal.userId?.role}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="font-bold text-blue-600 text-lg">₨{withdrawal.amount}</span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {withdrawal.paymentMethod.split('_').map(word => 
                                  word.charAt(0).toUpperCase() + word.slice(1)
                                ).join(' ')}
                              </Badge>
                            </TableCell>
                            <TableCell>{getStatusBadge(withdrawal.status)}</TableCell>
                            <TableCell>
                              {format(new Date(withdrawal.createdAt), 'MMM dd, yyyy HH:mm')}
                            </TableCell>
                            <TableCell className="text-sm">{accountInfo}</TableCell>
                            <TableCell>{getActionButtons(withdrawal)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Process Modal */}
      <Dialog open={processModalVisible} onOpenChange={setProcessModalVisible}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              Process Withdrawal - ₨{selectedWithdrawal?.amount}
            </DialogTitle>
            <DialogDescription>
              {selectedWithdrawal && (
                <div className="space-y-1 mt-2">
                  <p><strong>User:</strong> {selectedWithdrawal.userId?.name}</p>
                  <p><strong>Payment Method:</strong> {selectedWithdrawal.paymentMethod}</p>
                  <p><strong>Requested:</strong> {format(new Date(selectedWithdrawal.createdAt), 'MMM dd, yyyy HH:mm')}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(submitProcess)} className="space-y-4">
              <FormField
                control={form.control}
                name="action"
                rules={{ required: 'Please select action' }}
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
                        <SelectItem value="approve">Approve Request</SelectItem>
                        <SelectItem value="reject">Reject Request</SelectItem>
                        <SelectItem value="mark_processed">Mark as Paid</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch('action') === 'mark_processed' && (
                <FormField
                  control={form.control}
                  name="transactionId"
                  rules={{ required: 'Please enter transaction ID' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Transaction ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter transaction/reference number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="adminNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Admin Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={3}
                        placeholder="Add any notes or comments..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setProcessModalVisible(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit</Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentApproval;
