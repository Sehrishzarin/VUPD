import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import {
  BarChart3,
  Download,
  Eye,
  Calendar,
  User,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  Building2,
  RefreshCw,
  AlertCircle,
  FileText
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
  DialogDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
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
import { CardSkeleton } from '@/components/ui/card-skeleton';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const AttendanceReports = () => {
  const {
    generateAttendanceReport,
    getAttendanceReports,
    getAttendanceDashboard,
    exportAttendanceReport,
    getAllDuties
  } = useAuth();

  const [reports, setReports] = useState([]);
  const [dashboardData, setDashboardData] = useState({});
  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [reportDetailModalVisible, setReportDetailModalVisible] = useState(false);

  const form = useForm({
    defaultValues: {
      dateRange: undefined,
      examName: '',
      center: '',
      timeSlot: '',
      generateNew: false,
    },
  });

  useEffect(() => {
    fetchDashboardData();
    fetchReports();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAttendanceDashboard();
      setDashboardData(data);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load attendance dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const data = await getAttendanceReports();
      setReports(data.reports || data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      toast.error('Failed to load attendance reports');
    }
  };

  const handleGenerateReport = async (values) => {
    try {
      setReportLoading(true);
      
      const params = {};
      if (values.dateRange?.from && values.dateRange?.to) {
        params.startDate = format(values.dateRange.from, 'yyyy-MM-dd');
        params.endDate = format(values.dateRange.to, 'yyyy-MM-dd');
      }
      if (values.examName) params.examName = values.examName;
      if (values.center) params.center = values.center;
      if (values.timeSlot) params.timeSlot = values.timeSlot;
      if (values.generateNew) params.generateNew = true;

      const result = await generateAttendanceReport(params);
      toast.success('Attendance report generated successfully!');
      
      setGenerateModalVisible(false);
      form.reset();
      fetchReports();
      fetchDashboardData();
    } catch (err) {
      console.error('Failed to generate report:', err);
      toast.error('Failed to generate attendance report');
    } finally {
      setReportLoading(false);
    }
  };

  const handleExportReport = async (reportId) => {
    try {
      const blob = await exportAttendanceReport(reportId);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `attendance-report-${reportId}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Report exported successfully!');
    } catch (err) {
      console.error('Failed to export report:', err);
      toast.error('Failed to export report');
    }
  };

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setReportDetailModalVisible(true);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      present: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Present' },
      late: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', icon: <Clock className="h-3 w-3" />, text: 'Late' },
      absent: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', icon: <XCircle className="h-3 w-3" />, text: 'Absent' },
      excused: { variant: 'outline', className: 'bg-blue-100 text-blue-800 border-blue-300', icon: <CheckCircle2 className="h-3 w-3" />, text: 'Excused' },
      pending: { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-300', icon: <Clock className="h-3 w-3" />, text: 'Pending' },
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

  const getAttendanceRateColor = (rate) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 80) return 'text-yellow-600';
    if (rate >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  const getProgressColor = (rate) => {
    if (rate >= 90) return 'bg-green-600';
    if (rate >= 80) return 'bg-yellow-600';
    if (rate >= 70) return 'bg-orange-600';
    return 'bg-red-600';
  };

  // Dashboard Statistics
  const DashboardStats = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Today's Duties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-blue-600" />
            <div className="text-3xl font-bold text-blue-600">{dashboardData.todaysStats?.total || 0}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Present Today</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <div className="text-3xl font-bold text-green-600">{dashboardData.todaysStats?.present || 0}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Weekly Attendance Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <BarChart3 className={`h-4 w-4 ${getAttendanceRateColor(dashboardData.weeklyStats?.attendanceRate || 0)}`} />
            <div className={`text-3xl font-bold ${getAttendanceRateColor(dashboardData.weeklyStats?.attendanceRate || 0)}`}>
              {dashboardData.weeklyStats?.attendanceRate ? Math.round(dashboardData.weeklyStats.attendanceRate) : 0}%
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">Total Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-purple-600" />
            <div className="text-3xl font-bold text-purple-600">{reports.length}</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Today's Progress
  const TodaysProgress = () => {
    const { todaysStats = {} } = dashboardData;
    const total = todaysStats.total || 0;
    const present = todaysStats.present || 0;
    const late = todaysStats.late || 0;
    const absent = todaysStats.absent || 0;
    const pending = todaysStats.pending || 0;

    if (total === 0) {
      return (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Today's Attendance Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No duties scheduled for today</AlertTitle>
            </Alert>
          </CardContent>
        </Card>
      );
    }

    const completedRate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Today's Attendance Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Progress value={completedRate} className="h-3" />
            <p className="text-sm text-gray-600 mt-2">{completedRate}% Completed</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Present</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{present}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Late</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{late}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Absent</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{absent}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{pending}</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Recent Activity
  const RecentActivity = () => (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Recent Attendance Activities</CardTitle>
        <Button 
          variant="outline"
          size="sm"
          onClick={fetchDashboardData}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <TableSkeleton rows={5} columns={5} />
        ) : !dashboardData.recentAttendance || dashboardData.recentAttendance.length === 0 ? (
          <div className="text-center py-10 text-gray-500">No recent attendance activities</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Employee</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Center</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Marked At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dashboardData.recentAttendance.map((activity, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{activity.userName}</div>
                          <div className="text-xs text-gray-500">{activity.userRole}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{activity.examName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-gray-400" />
                        {activity.center}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(activity.status)}</TableCell>
                    <TableCell>
                      {activity.markedAt ? format(new Date(activity.markedAt), 'MMM dd, HH:mm') : '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Attendance Reports</h2>
        <p className="text-gray-600 mt-1">Generate and manage attendance reports for examination duties</p>
      </div>
      <h2 className="text-3xl font-bold text-gray-900">Attendance Reports & Analytics</h2>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList>
          <TabsTrigger value="dashboard">
            <BarChart3 className="h-4 w-4 mr-2" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="reports">
            <Users className="h-4 w-4 mr-2" />
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <DashboardStats />
          <TodaysProgress />
          <RecentActivity />
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <CardTitle>Attendance Reports</CardTitle>
              <Button 
                onClick={() => setGenerateModalVisible(true)}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Generate New Report
              </Button>
            </CardHeader>
            <CardContent>
              {reports.length === 0 ? (
                <EmptyState
                  icon={FileText}
                  title="No Attendance Reports"
                  description="No attendance reports have been generated yet. Use the form above to create your first report."
                />
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Report Name</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Statistics</TableHead>
                        <TableHead>Attendance Rate</TableHead>
                        <TableHead>Generated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report._id}>
                          <TableCell>
                            <div>
                              <div className="font-semibold">{report.examName}</div>
                              <div className="text-sm text-gray-500">
                                {report.center} • {report.timeSlot}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.date), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <div>
                                <span className="font-semibold">{report.totalAssigned || 0}</span>
                                <span className="text-sm text-gray-500"> assigned</span>
                              </div>
                              <div>
                                <span className="text-green-600 font-semibold">{report.presentCount || 0}</span>
                                <span className="text-sm text-gray-500"> present</span>
                              </div>
                              <div>
                                <span className="text-red-600 font-semibold">{report.absentCount || 0}</span>
                                <span className="text-sm text-gray-500"> absent</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              <Progress 
                                value={Math.round(report.attendanceRate || 0)} 
                                className={`h-2 ${getProgressColor(report.attendanceRate || 0)}`}
                              />
                              <p className="text-sm">{Math.round(report.attendanceRate || 0)}%</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            {format(new Date(report.generatedAt), 'MMM dd, yyyy HH:mm')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleViewReport(report)}
                                    >
                                      <Eye className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View Details</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleExportReport(report._id)}
                                    >
                                      <Download className="h-4 w-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Export CSV</TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
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
        </TabsContent>
      </Tabs>

      {/* Generate Report Modal */}
      <Dialog open={generateModalVisible} onOpenChange={setGenerateModalVisible}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Generate Attendance Report</DialogTitle>
            <DialogDescription>
              Configure the parameters for generating a new attendance report
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleGenerateReport)} className="space-y-4">
              <FormField
                control={form.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date Range</FormLabel>
                    <FormControl>
                      <DateRangePicker
                        dateRange={field.value}
                        onSelect={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="examName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Exam Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Filter by exam name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="center"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Center</FormLabel>
                      <FormControl>
                        <Input placeholder="Filter by center" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="timeSlot"
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
                        <SelectItem value="Morning (09:00-12:00)">Morning (09:00-12:00)</SelectItem>
                        <SelectItem value="Afternoon (13:00-16:00)">Afternoon (13:00-16:00)</SelectItem>
                        <SelectItem value="Evening (17:00-20:00)">Evening (17:00-20:00)</SelectItem>
                        <SelectItem value="Full Day (09:00-17:00)">Full Day (09:00-17:00)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="generateNew"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Generate new report (ignore cached)</FormLabel>
                    </div>
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setGenerateModalVisible(false);
                    form.reset();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={reportLoading}>
                  {reportLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Generate Report
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Report Detail Modal */}
      <Dialog open={reportDetailModalVisible} onOpenChange={setReportDetailModalVisible}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attendance Report Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-4">
              {/* Report Header */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Exam</Label>
                      <div>{selectedReport.examName}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Center</Label>
                      <div>{selectedReport.center}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Time Slot</Label>
                      <div>{selectedReport.timeSlot}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Date</Label>
                      <div>{format(new Date(selectedReport.date), 'MMM dd, yyyy')}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Generated</Label>
                      <div>{format(new Date(selectedReport.generatedAt), 'MMM dd, yyyy HH:mm')}</div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Attendance Rate</Label>
                      <div className={getAttendanceRateColor(selectedReport.attendanceRate)}>
                        {selectedReport.attendanceRate}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <div className="grid grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600">Total Assigned</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{selectedReport.totalAssigned}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600">Present</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{selectedReport.presentCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600">Absent</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-600">{selectedReport.absentCount}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-medium text-gray-600">Late</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{selectedReport.lateCount}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Role Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>Role Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-semibold">Superintendents</Label>
                      <div className="mt-1 space-y-1">
                        <div>Total: {selectedReport.roleBreakdown?.superintendent?.total || 0}</div>
                        <div>Present: {selectedReport.roleBreakdown?.superintendent?.present || 0}</div>
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm font-semibold">Invigilators</Label>
                      <div className="mt-1 space-y-1">
                        <div>Total: {selectedReport.roleBreakdown?.invigilator?.total || 0}</div>
                        <div>Present: {selectedReport.roleBreakdown?.invigilator?.present || 0}</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Records */}
              <Card>
                <CardHeader>
                  <CardTitle>Individual Records</CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedReport.dutyRecords && selectedReport.dutyRecords.length > 0 ? (
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Employee</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Marked At</TableHead>
                            <TableHead>Payment</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {selectedReport.dutyRecords.slice(0, 5).map((record) => (
                            <TableRow key={record.dutyId}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{record.userName}</div>
                                  <div className="text-xs text-gray-500">
                                    {record.employeeId} • {record.userRole}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{getStatusBadge(record.attendanceStatus)}</TableCell>
                              <TableCell>
                                {record.attendanceMarkedAt ? format(new Date(record.attendanceMarkedAt), 'MMM dd, HH:mm') : '-'}
                              </TableCell>
                              <TableCell>
                                {record.paymentAmount ? `₨${record.paymentAmount}` : '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">No records found</div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AttendanceReports;
