import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { ClipboardList, Calendar, CalendarDays, BarChart3, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/ui/empty-state";
import { AdminMetricsSkeleton } from "@/components/ui/card-skeleton";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { getPendingUsers, approveUser, rejectUser } = useAuth();
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    
    const fetchUsers = async () => {
      try {
        // Reset state when component mounts
        if (isMounted) {
          setLoading(true);
          setPending([]);
        }
        
        const data = await getPendingUsers();
        
        // Only update state if component is still mounted
        if (isMounted) {
          setPending(data || []);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to fetch pending users:', err);
        if (err.response?.status === 401) {
          console.error('Unauthorized - token may be expired or missing');
        }
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    fetchUsers();
    
    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
      setPending([]);
      setLoading(true);
    };
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div>
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <AdminMetricsSkeleton />
        <Card>
          <CardHeader>
            <CardTitle>Pending User Accounts</CardTitle>
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={6} />
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleApprove = async (id) => {
    try {
      await approveUser(id);
      setPending((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error(err.message);
    }
  };

  const handleReject = async (id) => {
    if (window.confirm("Are you sure you want to reject this user? This cannot be undone.")) {
      try {
        await rejectUser(id);
        setPending((prev) => prev.filter((u) => u._id !== id));
      } catch (err) {
        console.error(err.message);
      }
    }
  };

  // Metrics Calculation
  const totalPending = pending.length;
  const pendingToday = pending.filter(user => {
    const today = new Date();
    const userDate = new Date(user.createdAt || Date.now());
    return userDate.toDateString() === today.toDateString();
  }).length;
  
  const pendingThisWeek = pending.filter(user => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const userDate = new Date(user.createdAt || Date.now());
    return userDate >= oneWeekAgo;
  }).length;

  const metrics = [
    {
      title: "Total Pending",
      value: totalPending,
      icon: ClipboardList,
    },
    {
      title: "Pending Today",
      value: pendingToday,
      icon: Calendar,
    },
    {
      title: "This Week",
      value: pendingThisWeek,
      icon: CalendarDays,
    },
    {
      title: "Approval Rate",
      value: `${(totalPending > 0 ? ((totalPending - pending.length) / totalPending * 100).toFixed(1) : 0)}%`,
      icon: BarChart3,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900">Admin Dashboard</h2>
        <p className="text-gray-600 mt-1">Overview of pending user accounts and system metrics</p>
      </div>
      
      {/* Metrics Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground uppercase">
                  {metric.title}
                </CardTitle>
                <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
                  <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    
      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Pending User Accounts</CardTitle>
        </CardHeader>
        <CardContent>
        {pending.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Registration Date</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {pending.map((user) => (
                  <TableRow key={user._id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="uppercase">
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                        Pending
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                        onClick={() => handleApprove(user._id)}
                      >
                        Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                        onClick={() => handleReject(user._id)}
                      >
                        Reject
                        </Button>
                    </div>
                    </TableCell>
                  </TableRow>
              ))}
              </TableBody>
            </Table>
        ) : (
          <EmptyState
            icon={Users}
            title="No Pending Accounts"
            description="All user accounts have been reviewed. New registration requests will appear here."
          />
        )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
