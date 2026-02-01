import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  DollarSign, 
  CheckCircle2, 
  Clock,
  Building2,
  Smartphone,
  RefreshCw,
  Wallet,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
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
import { PaymentStatsSkeleton } from '@/components/ui/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

const Payment = () => {
  const { 
    getMyDuties, 
    getPaymentSummary, 
    requestWithdrawal, 
    getMyWithdrawals 
  } = useAuth();
  
  const [duties, setDuties] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [paymentSummary, setPaymentSummary] = useState({});
  const [loading, setLoading] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [earningsFilter, setEarningsFilter] = useState('All');

  const form = useForm({
    defaultValues: {
      amount: '',
      paymentMethod: 'bank_transfer',
      accountDetails: {
        bankName: '',
        accountNumber: '',
        accountTitle: '',
        phoneNumber: '',
      },
    },
  });

  useEffect(() => {
    fetchData();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setDuties([]);
      setWithdrawals([]);
      setPaymentSummary({});
      setEarningsFilter('All');
      setWithdrawModalVisible(false);
    };
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [dutiesData, summaryData, withdrawalsData] = await Promise.all([
        getMyDuties(),
        getPaymentSummary(),
        getMyWithdrawals()
      ]);
      
      const dutiesArray = Array.isArray(dutiesData) ? dutiesData : (dutiesData.duties || []);
      const withdrawalsArray = Array.isArray(withdrawalsData) ? withdrawalsData : (withdrawalsData.withdrawals || []);
      
      setDuties(dutiesArray);
      setPaymentSummary(summaryData);
      setWithdrawals(withdrawalsArray);
    } catch (err) {
      console.error('Failed to fetch payment data:', err);
      toast.error('Failed to load payment data');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async (values) => {
    try {
      // Auto-detect network for mobile money payments
      const withdrawalData = { ...values };
      if (values.paymentMethod === 'easypaisa' || values.paymentMethod === 'jazzcash') {
        withdrawalData.accountDetails = {
          ...values.accountDetails,
          network: values.paymentMethod === 'easypaisa' ? 'Telenor' : 'Jazz'
        };
      }
      
      await requestWithdrawal(withdrawalData);
      setWithdrawModalVisible(false);
      form.reset();
      fetchData(); 
    } catch (err) {
      console.error('Withdrawal request failed:', err);
      // Error message is already shown by the requestWithdrawal function
    }
  };

  const getFilteredDuties = () => {
    if (earningsFilter === 'Paid') return duties.filter(d => d.paymentApproved);
    if (earningsFilter === 'Pending') return duties.filter(d => !d.paymentApproved && ['present', 'late', 'excused'].includes(d.attendanceStatus));
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
      <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
        <Clock className="h-3 w-3 mr-1" />
        Processing
      </Badge>
    );
  };

  const getWithdrawalStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', text: 'PENDING' },
      approved: { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-300', text: 'APPROVED' },
      rejected: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', text: 'REJECTED' },
      processed: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', text: 'PROCESSED' },
    };
    const config = statusConfig[status] || { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-300', text: status.toUpperCase() };
    return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>;
  };

  const getPaymentMethodIcon = (method) => {
    if (method === 'bank_transfer') return <Building2 className="h-4 w-4" />;
    if (method === 'easypaisa' || method === 'jazzcash') return <Smartphone className="h-4 w-4" />;
    return <DollarSign className="h-4 w-4" />;
  };

  const { summary = {} } = paymentSummary;
  const paidPercentage = summary.totalEarnings > 0 ? (summary.paidAmount / summary.totalEarnings) * 100 : 0;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        {/* Header Section Skeleton */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Skeleton className="h-9 w-48 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Statistics Cards Skeleton */}
        <PaymentStatsSkeleton />

        {/* Tabs Skeleton */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-10 w-64" />
              <Skeleton className="h-10 w-32" />
            </div>
            <TableSkeleton rows={5} columns={4} />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Payments</h2>
          <p className="text-gray-600 mt-1">Manage your earnings and withdrawals</p>
        </div>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline"
                  size="lg"
                  onClick={fetchData} 
                  disabled={loading}
                  className="h-10 w-10 p-0"
                >
                  <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh Data</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button 
            onClick={() => setWithdrawModalVisible(true)}
            disabled={!summary.canWithdraw}
            size="lg"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Withdraw Funds
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">₨{summary.availableBalance?.toFixed(2) || '0.00'}</div>
            <Progress value={100} className="h-1 mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">₨{summary.totalEarnings?.toFixed(2) || '0.00'}</div>
            <Progress value={paidPercentage} className="h-1 mt-2" />
            <div className="text-xs text-gray-500 mt-2">
              {Math.round(paidPercentage)}% Paid Out
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">₨{summary.pendingApprovalAmount?.toFixed(2) || '0.00'}</div>
            <Progress value={100} className="h-1 mt-2 bg-yellow-200" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="earnings" className="w-full">
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="earnings">Earnings History</TabsTrigger>
                <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              </TabsList>
              <Select value={earningsFilter} onValueChange={setEarningsFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <TabsContent value="earnings" className="space-y-4">
              {getFilteredDuties().length === 0 ? (
                <EmptyState
                  icon={Receipt}
                  title="No Earnings Found"
                  description="No earnings found matching your filters. Try adjusting your date range or status filter."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam Details</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredDuties().map((duty) => (
                        <TableRow key={duty._id}>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{duty.examName}</div>
                              <div className="text-sm text-gray-500">{duty.center}</div>
                            </div>
                          </TableCell>
                          <TableCell>{format(new Date(duty.date), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>{getPaymentStatusBadge(duty)}</TableCell>
                          <TableCell className="text-right font-semibold">₨{duty.paymentAmount || 0}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
            <TabsContent value="withdrawals" className="space-y-4">
              {withdrawals.length === 0 ? (
                <EmptyState
                  icon={Wallet}
                  title="No Withdrawal Requests"
                  description="You haven't submitted any withdrawal requests yet. Use the form above to request a withdrawal."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Requested Date</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {withdrawals.map((withdrawal) => (
                        <TableRow key={withdrawal._id}>
                          <TableCell>{format(new Date(withdrawal.createdAt), 'MMM dd, yyyy')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {getPaymentMethodIcon(withdrawal.paymentMethod)}
                              <span className="capitalize">{withdrawal.paymentMethod.replace('_', ' ')}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getWithdrawalStatusBadge(withdrawal.status)}</TableCell>
                          <TableCell className="text-right font-semibold text-red-600">- ₨{withdrawal.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Withdrawal Modal */}
      <Dialog open={withdrawModalVisible} onOpenChange={setWithdrawModalVisible}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Request Withdrawal
            </DialogTitle>
          </DialogHeader>
          <Alert className="mb-4">
            <DollarSign className="h-4 w-4" />
            <AlertTitle>Available Balance: ₨{summary.availableBalance?.toFixed(2) || '0.00'}</AlertTitle>
          </Alert>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleWithdraw)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                rules={{
                  required: 'Amount is required',
                  validate: (value) => {
                    if (!value || value <= 0) {
                      return 'Amount must be greater than 0';
                    }
                    if (value > (summary.availableBalance || 0)) {
                      return `Amount exceeds available balance of ₨${(summary.availableBalance || 0).toFixed(2)}`;
                    }
                    if (value < 100) {
                      return 'Minimum withdrawal amount is ₨100';
                    }
                    return true;
                  }
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₨</span>
                        <Input
                          type="number"
                          placeholder={`Enter amount (Max: ₨${(summary.availableBalance || 0).toFixed(2)})`}
                          className="pl-8"
                          min="100"
                          step="1"
                          {...field}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            field.onChange(isNaN(val) ? '' : val);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Available balance: ₨{summary.availableBalance?.toFixed(2) || '0.00'} • Minimum: ₨100
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                rules={{ required: 'Please select a payment method' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method <span className="text-red-500">*</span></FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(value);
                      // Clear account details when payment method changes
                      form.setValue('accountDetails', {
                        bankName: '',
                        accountNumber: '',
                        accountTitle: '',
                        phoneNumber: '',
                      });
                    }} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="bank_transfer">
                          <span className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            Bank Transfer
                          </span>
                        </SelectItem>
                        <SelectItem value="easypaisa">
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            EasyPaisa
                          </span>
                        </SelectItem>
                        <SelectItem value="jazzcash">
                          <span className="flex items-center gap-2">
                            <Smartphone className="h-4 w-4" />
                            JazzCash
                          </span>
                        </SelectItem>
                        <SelectItem value="cash">
                          <span className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Cash Pickup
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-xs text-gray-500 mt-1">
                      Choose how you want to receive your payment
                    </p>
                  </FormItem>
                )}
              />

              {/* Dynamic Fields based on Payment Method */}
              {form.watch('paymentMethod') === 'bank_transfer' && (
                <>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Bank Transfer Details Required</AlertTitle>
                    <AlertDescription className="text-xs">
                      Please provide your bank account information for the transfer.
                    </AlertDescription>
                  </Alert>
                  <FormField
                    control={form.control}
                    name="accountDetails.bankName"
                    rules={{ 
                      required: 'Bank name is required',
                      validate: (value) => {
                        if (!value || value.trim().length < 2) {
                          return 'Please enter a valid bank name';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bank Name <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. HBL, UBL, MCB, Bank Alfalah" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.trim())}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the full name of your bank
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountDetails.accountNumber"
                    rules={{ 
                      required: 'Account number is required',
                      validate: (value) => {
                        if (!value || value.trim().length < 5) {
                          return 'Account number must be at least 5 characters';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Number / IBAN <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. PK12HABB0001234567890123 or 1234567890123" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.trim())}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your account number or IBAN (International Bank Account Number)
                        </p>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="accountDetails.accountTitle"
                    rules={{ 
                      required: 'Account title is required',
                      validate: (value) => {
                        if (!value || value.trim().length < 3) {
                          return 'Account title must be at least 3 characters';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Account Title (Account Holder Name) <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="e.g. John Doe" 
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.trim())}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter the name as it appears on your bank account
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              )}

              {(form.watch('paymentMethod') === 'easypaisa' || form.watch('paymentMethod') === 'jazzcash') && (
                <>
                  <Alert className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle className="text-sm">Mobile Money Details Required</AlertTitle>
                    <AlertDescription className="text-xs">
                      {form.watch('paymentMethod') === 'easypaisa' 
                        ? 'Enter your EasyPaisa mobile number (Telenor network)'
                        : 'Enter your JazzCash mobile number (Jazz network)'}
                    </AlertDescription>
                  </Alert>
                  <FormField
                    control={form.control}
                    name="accountDetails.phoneNumber"
                    rules={{ 
                      required: 'Mobile number is required',
                      validate: (value) => {
                        if (!value) {
                          return 'Mobile number is required';
                        }
                        // Pakistani mobile number format: 03XX-XXXXXXX (11 digits starting with 03)
                        const phoneRegex = /^03\d{9}$/;
                        const cleaned = value.replace(/[\s-]/g, '');
                        if (!phoneRegex.test(cleaned)) {
                          return 'Please enter a valid Pakistani mobile number (e.g., 03001234567)';
                        }
                        return true;
                      }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Mobile Number <span className="text-red-500">*</span></FormLabel>
                        <FormControl>
                          <Input 
                            type="tel"
                            inputMode="numeric"
                            placeholder="03001234567" 
                            maxLength={11}
                            {...field}
                            value={field.value || ''}
                            onKeyDown={(e) => {
                              // Allow: digits, backspace, delete, arrow keys, tab, enter
                              const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Enter', 'Home', 'End'];
                              if (allowedKeys.includes(e.key)) {
                                return; // Allow these keys
                              }
                              // Allow digits
                              if (/[0-9]/.test(e.key)) {
                                return; // Allow digits
                              }
                              // Block everything else
                              e.preventDefault();
                            }}
                            onChange={(e) => {
                              // Get the input value
                              const inputValue = e.target.value;
                              
                              // Remove all non-digit characters
                              const cleaned = inputValue.replace(/\D/g, '');
                              
                              // If empty, allow it
                              if (cleaned === '') {
                                field.onChange('');
                                return;
                              }
                              
                              // If starts with 0 but not 03 yet, allow typing
                              if (cleaned.length === 1 && cleaned === '0') {
                                field.onChange('0');
                                return;
                              }
                              
                              // If starts with 03, allow up to 11 digits
                              if (cleaned.startsWith('03')) {
                                if (cleaned.length <= 11) {
                                  field.onChange(cleaned);
                                } else {
                                  // If exceeds 11 digits, keep only first 11
                                  field.onChange(cleaned.substring(0, 11));
                                }
                                return;
                              }
                              
                              // If doesn't start with 03, try to fix it
                              if (cleaned.startsWith('0') && cleaned.length === 2 && cleaned[1] !== '3') {
                                // User typed 0X where X is not 3, don't allow
                                field.onChange('0');
                                return;
                              }
                              
                              // If starts with 3, prepend 0
                              if (cleaned.startsWith('3')) {
                                field.onChange('0' + cleaned.substring(0, 10));
                                return;
                              }
                              
                              // Otherwise, if it's a valid start, allow it
                              if (cleaned.length <= 11) {
                                field.onChange(cleaned);
                              }
                            }}
                            onPaste={(e) => {
                              e.preventDefault();
                              const pastedText = e.clipboardData.getData('text');
                              const cleaned = pastedText.replace(/\D/g, '');
                              
                              if (cleaned.length === 0) {
                                field.onChange('');
                              } else if (cleaned.startsWith('03') && cleaned.length <= 11) {
                                field.onChange(cleaned.substring(0, 11));
                              } else if (cleaned.startsWith('3') && cleaned.length <= 10) {
                                field.onChange('0' + cleaned.substring(0, 10));
                              } else if (cleaned.startsWith('0') && cleaned.length <= 11) {
                                field.onChange(cleaned.substring(0, 11));
                              }
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <p className="text-xs text-gray-500 mt-1">
                          Enter your {form.watch('paymentMethod') === 'easypaisa' ? 'EasyPaisa' : 'JazzCash'} mobile number (11 digits, starting with 03)
                        </p>
                      </FormItem>
                    )}
                  />
                </>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setWithdrawModalVisible(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
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

export default Payment;
