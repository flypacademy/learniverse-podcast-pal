
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, Calendar, User } from "lucide-react";
import { format } from "date-fns";
import { useListeningStats } from "@/hooks/useListeningStats";

const UserStats = () => {
  const [email, setEmail] = useState("jonny@flyp.academy");
  const [searchEmail, setSearchEmail] = useState("jonny@flyp.academy");
  const { stats, loading, error } = useListeningStats(searchEmail);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchEmail(email);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">User Statistics</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex gap-2 max-w-md">
          <Input 
            placeholder="User email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1"
          />
          <Button type="submit">Search</Button>
        </form>
        
        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading user statistics...</p>
          </div>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-700">{error}</p>
            </CardContent>
          </Card>
        ) : stats ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">User</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <User className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold">{stats.email}</p>
                  <p className="text-xs text-gray-500">ID: {stats.userId}</p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Total Listening Time</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalMinutes.toLocaleString()} minutes</p>
                  <p className="text-xs text-gray-500">
                    {Math.floor(stats.totalMinutes / 60)} hours, {stats.totalMinutes % 60} minutes
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">Last Listened</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-lg font-bold">
                    {stats.lastListened 
                      ? format(new Date(stats.lastListened), 'PPP') 
                      : 'Never'}
                  </p>
                  {stats.lastListened && (
                    <p className="text-xs text-gray-500">
                      {format(new Date(stats.lastListened), 'p')}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <p>No data available</p>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserStats;
