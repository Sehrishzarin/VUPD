import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { Link } from "react-router-dom";
import { 
  CheckCircle2, 
  Clock, 
  User,
  Calendar,
  AlertCircle,
  Loader2,
  ClipboardList
} from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/table-skeleton';
import { DashboardStatsSkeleton } from '@/components/ui/card-skeleton';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const [duties, setDuties] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { getMyDuties, user, getDutyStats } = useAuth();

  useEffect(() => {
    let isMounted = true;
    
    const fetchDashboardData = async () => {
      try {
        // Reset state when component mounts
        if (isMounted) {
          setLoading(true);
          setError(null);
          setDuties([]);
          setStats({});
        }
        
        // Fetch duties
        const dutiesData = await getMyDuties();
        const dutiesArray = dutiesData.duties || dutiesData || [];
        
        // Filter for upcoming pending duties
        const upcomingDuties = Array.isArray(dutiesArray) 
          ? dutiesArray
              .filter(d => {
                if (!d || !d.date) return false;
                const dutyDate = new Date(d.date);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                return dutyDate >= today && d.attendanceStatus === 'pending';
              })
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .slice(0, 3)
          : [];

        // Fetch stats
        const statsData = await getDutyStats();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setDuties(upcomingDuties);
          setStats(statsData || {});
          setLoading(false);
        }

      } catch (err) {
        console.error('Dashboard data fetch error:', err);
        if (isMounted) {
          setError(err.message || "Failed to load dashboard data");
          setLoading(false);
        }
      }
    };
    
    fetchDashboardData();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      setDuties([]);
      setStats({});
      setError(null);
      setLoading(true);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-9 w-48 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <DashboardStatsSkeleton />
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>Upcoming Duties</CardTitle>
            <Skeleton className="h-10 w-32" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={3} columns={5} />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name || "Invigilator"}! Here's your overview</p>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Duties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" />
              <div className="text-3xl font-bold text-gray-900">{stats.totalDuties || 0}</div>
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
              <div className="text-3xl font-bold text-green-600">{stats.completedDuties || 0}</div>
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
              <div className="text-3xl font-bold text-yellow-600">{stats.upcomingDuties || 0}</div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <div className="text-3xl font-bold text-blue-600">{stats.completionRate || 0}%</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Duties Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Upcoming Duties</CardTitle>
          <Link to="/invigilator/duties">
            <Button>View All Duties</Button>
          </Link>
        </CardHeader>
        <CardContent>
          {duties.length === 0 ? (
            <EmptyState
              icon={ClipboardList}
              title="No Upcoming Duties"
              description="You don't have any upcoming duties scheduled. Check back later or contact your administrator."
            />
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Time Slot</TableHead>
                    <TableHead>Center</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {duties.map((duty) => (
                    <TableRow key={duty._id}>
                      <TableCell>{format(new Date(duty.date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell className="font-medium">{duty.examName}</TableCell>
                      <TableCell>{duty.timeSlot}</TableCell>
                      <TableCell>{duty.center}</TableCell>
                      <TableCell>
                        <Link to="/invigilator/duties">
                          <Button variant="link" size="sm">View Details</Button>
                        </Link>
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

export default Dashboard;
