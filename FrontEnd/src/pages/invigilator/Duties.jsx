import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import DutiesList from './DutiesList';
import LeaveRequests from './LeaveRequests';

const Duties = () => {
  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="duties" className="w-full">
            <TabsList>
              <TabsTrigger value="duties">My Duties</TabsTrigger>
              <TabsTrigger value="leaves">Leave Requests</TabsTrigger>
            </TabsList>
            <TabsContent value="duties">
              <DutiesList />
            </TabsContent>
            <TabsContent value="leaves">
              <LeaveRequests />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Duties;
