import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import dayjs from 'dayjs';
import { toast } from 'react-toastify';
import { RefreshCw, AlertCircle, ClipboardList } from 'lucide-react';
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DatePicker } from '@/components/ui/date-picker';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const AssignDuties = () => {
  const [availableUsers, setAvailableUsers] = useState([]);
  const [duties, setDuties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingUsers, setFetchingUsers] = useState(false);
  const [apiError, setApiError] = useState('');

  const { 
    getAvailableUsers, 
    getAllDuties, 
    assignDuty
  } = useAuth();

  const form = useForm({
    defaultValues: {
      examName: '',
      date: undefined,
      timeSlot: '',
      assignedToRole: 'invigilator',
      paymentType: 'full',
      assignedTo: '',
      center: '',
      description: '',
    },
  });

  const timeSlots = [
    { value: 'Morning (09:00-12:00)', label: 'Morning (09:00-12:00)' },
    { value: 'Afternoon (13:00-16:00)', label: 'Afternoon (13:00-16:00)' },
    { value: 'Evening (17:00-20:00)', label: 'Evening (17:00-20:00)' },
    { value: 'Full Day (09:00-17:00)', label: 'Full Day (09:00-17:00)' },
  ];

  const paymentTypes = [
    { value: 'full', label: 'Full Payment - ₨2,000' },
    { value: 'half', label: 'Half Payment - ₨1,200' },
    { value: 'afternoon', label: 'Afternoon - ₨1,000' },
    { value: 'other', label: 'Other - ₨800' },
  ];

  const roles = [
    { value: 'superintendent', label: 'Superintendent' },
    { value: 'invigilator', label: 'Invigilator' },
  ];

  useEffect(() => {
    fetchDuties();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setDuties([]);
      setAvailableUsers([]);
      setApiError('');
    };
  }, []);

  const fetchDuties = async () => {
    try {
      setLoading(true);
      const dutiesData = await getAllDuties();
      setDuties(dutiesData.duties || dutiesData);
    } catch (err) {
      console.error('Failed to fetch duties:', err);
      if (err.response?.status === 401) {
        toast.error('Session expired. Please login again.');
      } else {
        toast.error('Failed to fetch duties');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableUsers = async () => {
    try {
      const values = form.getValues();
      const { date, timeSlot, assignedToRole } = values;

      if (!date || !timeSlot || !assignedToRole) {
        toast.warning('Please select date, time slot, and role first');
        return;
      }

      setFetchingUsers(true);
      setApiError('');
      
      const users = await getAvailableUsers({
        date: format(date, 'yyyy-MM-dd'),
        timeSlot,
        role: assignedToRole,
      });

      setAvailableUsers(users);
      toast.success(`Found ${users.length} available users`);
    } catch (err) {
      console.error('Fetch available users error:', err);
      if (err.response?.status === 404) {
        setApiError('Available users endpoint not found. Please check backend routes.');
      } else {
        const errorMsg = err.response?.data?.msg || 'Failed to fetch available users';
        toast.error(errorMsg);
      }
    } finally {
      setFetchingUsers(false);
    }
  };


  const onSubmit = async (values) => {
    try {
      setLoading(true);
      setApiError('');
      
      const dutyData = {
        examName: values.examName,
        date: format(values.date, 'yyyy-MM-dd'),
        timeSlot: values.timeSlot,
        description: values.description,
        center: values.center,
        assignedToRole: values.assignedToRole,
        paymentType: values.paymentType,
      };

      await assignDuty(values.assignedTo, dutyData);
      toast.success("Duty assigned successfully!");
      form.reset();
      setAvailableUsers([]);
      fetchDuties();
    } catch (err) {
      console.error('Assign duty error details:', err);
      if (err.response) {
        const errorMsg = err.response.data?.msg || err.response.data?.message || 'Failed to assign duty';
        setApiError(`Server Error: ${errorMsg}`);
        toast.error(errorMsg);
      } else if (err.request) {
        setApiError('Network error: Could not connect to server. Please check if backend is running.');
        toast.error('Network error: Could not connect to server');
      } else {
        setApiError(err.message || 'An unexpected error occurred');
        toast.error(err.message || 'An unexpected error occurred');
      }
    } finally {
      setLoading(false);
    }
  };

  const getAttendanceStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'secondary', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100', text: 'Pending' },
      present: { variant: 'default', className: 'bg-green-100 text-green-800 hover:bg-green-100', text: 'Present' },
      late: { variant: 'secondary', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100', text: 'Late' },
      absent: { variant: 'destructive', text: 'Absent' },
      excused: { variant: 'default', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100', text: 'Excused' },
    };
    
    const config = statusConfig[status] || { variant: 'default', text: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  const getPaymentStatusBadge = (duty) => {
    if (!duty.attendanceVerified) {
      return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Verification</Badge>;
    }
    if (duty.paymentApproved) {
      return <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
    }
    return <Badge variant="destructive">Unpaid</Badge>;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Assign Duties</h2>
        <p className="text-gray-600 mt-1">Assign examination duties to invigilators and manage assignments</p>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>API Error</AlertTitle>
          <AlertDescription>{apiError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Assign New Duty Form */}
        <Card>
          <CardHeader>
            <CardTitle>Assign New Duty</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                name="examName"
                  rules={{ required: 'Please enter exam name' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter exam name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date"
                  rules={{ required: 'Please select date' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          date={field.value}
                          onSelect={(date) => {
                            field.onChange(date)
                          }}
                          disabled={(date) => {
                            const today = new Date()
                            today.setHours(0, 0, 0, 0)
                            return date < today
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="timeSlot"
                  rules={{ required: 'Please select time slot' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Time Slot</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select time slot" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                  {timeSlots.map(slot => (
                            <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                            </SelectItem>
                  ))}
                        </SelectContent>
                </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="assignedToRole"
                  rules={{ required: 'Please select role' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                  {roles.map(role => (
                            <SelectItem key={role.value} value={role.value}>
                      {role.label}
                            </SelectItem>
                  ))}
                        </SelectContent>
                </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="paymentType"
                  rules={{ required: 'Please select payment type' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                  {paymentTypes.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                      {type.label}
                            </SelectItem>
                  ))}
                        </SelectContent>
                </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="button"
                  onClick={fetchAvailableUsers}
                  disabled={fetchingUsers}
                  className="w-full"
                >
                  {fetchingUsers ? 'Finding Available Users...' : 'Find Available Users'}
                </Button>

                <FormField
                  control={form.control}
                name="assignedTo"
                  rules={{ required: 'Please select a user' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                <Select
                        onValueChange={field.onChange}
                        value={field.value}
                  disabled={availableUsers.length === 0 || fetchingUsers}
                >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                availableUsers.length === 0
                                  ? "Click 'Find Available Users' first"
                                  : "Select available user"
                              }
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                  {availableUsers.map(user => (
                            <SelectItem key={user._id} value={user._id}>
                      {user.name} - {user.email} ({user.role})
                            </SelectItem>
                  ))}
                        </SelectContent>
                </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
      
                <FormField
                  control={form.control}
                name="center"
                  rules={{ required: 'Please enter exam center' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Center</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter exam center location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                  rows={3}
                  placeholder="Additional notes or instructions"
                          {...field}
                />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loading || availableUsers.length === 0}
                  className="w-full"
                  size="lg"
                >
                  {loading ? 'Assigning Duty...' : 'Assign Duty'}
                </Button>
              </form>
            </Form>
          </CardContent>
          </Card>

        {/* Assigned Duties Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Assigned Duties ({duties.length})</CardTitle>
            <Button 
              variant="outline"
              size="sm"
              onClick={fetchDuties} 
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <TableSkeleton rows={5} columns={9} />
            ) : duties.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Exam Name</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time Slot</TableHead>
                      <TableHead>Center</TableHead>
                      <TableHead>Assigned To</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Attendance</TableHead>
                      <TableHead>Payment</TableHead>
                      <TableHead>Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {duties.map((duty) => {
                      return (
                        <TableRow key={duty._id}>
                          <TableCell className="font-medium">{duty.examName}</TableCell>
                          <TableCell>{dayjs(duty.date).format('MMM DD, YYYY')}</TableCell>
                          <TableCell>{duty.timeSlot}</TableCell>
                          <TableCell>{duty.center}</TableCell>
                          <TableCell>{duty.assignedTo?.name || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge variant={duty.assignedToRole === 'superintendent' ? 'default' : 'secondary'}>
                              {duty.assignedToRole?.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{getAttendanceStatusBadge(duty.attendanceStatus)}</TableCell>
                          <TableCell>{getPaymentStatusBadge(duty)}</TableCell>
                          <TableCell>{duty.paymentAmount ? `₨${duty.paymentAmount}` : '-'}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <EmptyState
                icon={ClipboardList}
                title="No Assigned Duties"
                description="No duties have been assigned yet. Use the form above to assign new duties to invigilators."
              />
            )}
          </CardContent>
          </Card>
      </div>
    </div>
  );
};

export default AssignDuties;
