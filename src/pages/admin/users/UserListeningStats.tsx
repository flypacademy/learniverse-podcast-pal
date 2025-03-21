
import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import AdminLayout from "@/components/AdminLayout";
import { ListeningStats } from "@/types/xp";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

const UserListeningStats = () => {
  const [userStats, setUserStats] = useState<(ListeningStats & { id: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const fetchAllUserListeningStats = async () => {
    try {
      setLoading(true);
      
      // Get all users first
      const { data: users, error: usersError } = await supabase
        .from('user_profiles')
        .select('id, display_name');
      
      if (usersError) {
        throw usersError;
      }
      
      // Get all listening data
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress')
        .select('*');
      
      if (progressError) {
        throw progressError;
      }
      
      console.log("Found user profiles:", users?.length || 0);
      console.log("Found progress entries:", progressData?.length || 0);
      
      // Try to get email data for all users
      const userIds = users?.map(u => u.id) || [];
      let emailsMap: Record<string, string> = {};
      
      try {
        const { data: emailsData, error: emailsError } = await supabase
          .rpc('get_user_emails_for_ids', {
            user_ids: userIds
          });
        
        if (!emailsError && emailsData) {
          emailsMap = emailsData.reduce((acc: Record<string, string>, item: any) => {
            if (item && item.id && item.email) {
              acc[item.id] = item.email;
            }
            return acc;
          }, {});
        }
        
        console.log("Retrieved emails for users:", Object.keys(emailsMap).length);
      } catch (emailErr) {
        console.error("Error getting emails:", emailErr);
      }
      
      // Process and aggregate the data by user
      const userStatsMap: Record<string, ListeningStats & { id: string }> = {};
      
      if (users && progressData) {
        // Initialize stats for all users
        users.forEach(user => {
          userStatsMap[user.id] = {
            id: user.id,
            userId: user.id,
            totalMinutes: 0,
            lastListened: null,
            email: emailsMap[user.id] || user.display_name || user.id
          };
        });
        
        // Process all progress data
        progressData.forEach(entry => {
          const userId = entry.user_id;
          
          if (!userStatsMap[userId]) {
            // Create entry if not exists (should not happen as we initialized all users)
            userStatsMap[userId] = {
              id: userId,
              userId: userId,
              totalMinutes: 0,
              lastListened: null,
              email: emailsMap[userId] || userId
            };
          }
          
          // Add to total time if last_position is valid
          if (entry.last_position && typeof entry.last_position === 'number' && !isNaN(entry.last_position)) {
            // Use floating point arithmetic for more accurate time tracking
            // Convert seconds to minutes with precision
            userStatsMap[userId].totalMinutes += (entry.last_position / 60);
          }
          
          // Update last listened date if more recent
          if (entry.updated_at) {
            if (!userStatsMap[userId].lastListened || new Date(entry.updated_at) > new Date(userStatsMap[userId].lastListened as string)) {
              userStatsMap[userId].lastListened = entry.updated_at;
            }
          }
        });
      }
      
      // Convert map to array and sort by total minutes (descending)
      const statsArray = Object.values(userStatsMap).sort((a, b) => 
        b.totalMinutes - a.totalMinutes
      );
      
      setUserStats(statsArray);
      setLastRefresh(new Date());
      setLoading(false);
      
      // Show success toast
      toast({
        title: "Stats refreshed",
        description: `Found ${progressData?.length || 0} listening entries across ${users?.length || 0} users.`
      });
    } catch (err: any) {
      console.error("Error fetching all user stats:", err);
      setError(err.message || "Failed to fetch user statistics");
      setLoading(false);
      
      // Show error toast
      toast({
        title: "Error refreshing stats",
        description: err.message || "Failed to fetch user statistics",
        variant: "destructive"
      });
    }
  };
  
  // Fetch initially
  useEffect(() => {
    fetchAllUserListeningStats();
    
    // Set up automatic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchAllUserListeningStats();
    }, 30000);
    
    return () => clearInterval(refreshInterval);
  }, []);

  // Format time function
  const formatTime = (minutes: number) => {
    // Calculate hours and remaining minutes
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    
    return `${hours}h ${remainingMinutes}m`;
  };
  
  const handleRefresh = () => {
    toast({
      title: "Refreshing stats",
      description: "Fetching the latest listening statistics for all users..."
    });
    fetchAllUserListeningStats();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">User Listening Statistics</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">
              Last updated: {format(lastRefresh, 'PPp')}
            </p>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh Stats
            </Button>
          </div>
        </div>
        
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
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Users Listening Times</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User Email/ID</TableHead>
                    <TableHead>Listening Time</TableHead>
                    <TableHead>Last Listened</TableHead>
                    <TableHead>Raw Minutes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {userStats.map(stat => (
                    <TableRow key={stat.id}>
                      <TableCell className="font-medium">{stat.email || stat.userId}</TableCell>
                      <TableCell>{formatTime(stat.totalMinutes)}</TableCell>
                      <TableCell>
                        {stat.lastListened 
                          ? format(new Date(stat.lastListened), 'PPP p')
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>{stat.totalMinutes.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  );
};

export default UserListeningStats;
