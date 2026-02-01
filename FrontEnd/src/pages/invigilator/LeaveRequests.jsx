import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertCircle, CalendarX } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';

// shadcn components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';

const LeaveRequests = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { getMyLeaveRequests } = useAuth();

  useEffect(() => {
    fetchLeaveRequests();
    
    // Cleanup function to reset state when component unmounts
    return () => {
      setLeaves([]);
      setError('');
    };
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const data = await getMyLeaveRequests();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch leave requests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { variant: 'outline', className: 'bg-orange-100 text-orange-800 border-orange-300', text: 'Pending' },
      approved: { variant: 'outline', className: 'bg-green-100 text-green-800 border-green-300', text: 'Approved' },
      rejected: { variant: 'outline', className: 'bg-red-100 text-red-800 border-red-300', text: 'Rejected' },
    };
    const config = statusConfig[status] || { variant: 'outline', className: 'bg-gray-100 text-gray-800 border-gray-300', text: status };
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.text}
      </Badge>
    );
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Leave Requests</h2>
        <p className="text-gray-600 mt-1">View and manage your leave requests for examination duties</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>My Leave Requests</CardTitle>
          <Button 
            variant="outline"
            size="sm"
            onClick={fetchLeaveRequests}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <TableSkeleton rows={5} columns={5} />
          ) : leaves.length === 0 ? (
            <EmptyState
              icon={CalendarX}
              title="No Leave Requests"
              description="You haven't submitted any leave requests yet. Use the form above to request leave for a duty."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Admin Comment</TableHead>
                    <TableHead>Requested At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaves.map((leave) => (
                    <TableRow key={leave._id}>
                      <TableCell>{leave.dutyId?.examName || 'N/A'}</TableCell>
                      <TableCell>
                        {leave.dutyId?.date ? format(new Date(leave.dutyId.date), 'MMM dd, yyyy') : 'N/A'}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={leave.reason}>
                        {leave.reason}
                      </TableCell>
                      <TableCell>{getStatusBadge(leave.status)}</TableCell>
                      <TableCell className="max-w-[150px] truncate">
                        {leave.adminComment || '-'}
                      </TableCell>
                      <TableCell>
                        {format(new Date(leave.requestedAt), 'MMM dd, yyyy HH:mm')}
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

export default LeaveRequests;
