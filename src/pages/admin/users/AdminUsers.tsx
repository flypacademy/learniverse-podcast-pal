
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Import new components
import UserSearch from "./components/UserSearch";
import UserTable from "./components/UserTable";
import UserPagination from "./components/UserPagination";
import EmptyState from "./components/EmptyState";
import LoadingState from "./components/LoadingState";
import ErrorState from "./components/ErrorState";
import UsersTip from "./components/UsersTip";

const AdminUsers = () => {
  const { users, loading, error } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.display_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  
  // Calculate pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on search
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRefresh = () => {
    window.location.reload();
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <div className="flex gap-2">
            <Link to="/admin/users/stats">
              <Button variant="outline" className="flex items-center gap-2">
                <BarChart className="h-4 w-4" />
                User Statistics
              </Button>
            </Link>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Registered Users</CardTitle>
            <UserSearch 
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onRefresh={handleRefresh}
            />
          </CardHeader>
          <CardContent>
            {loading ? (
              <LoadingState />
            ) : error ? (
              <ErrorState 
                error={error} 
                onRetry={handleRefresh}
              />
            ) : paginatedUsers.length === 0 ? (
              <EmptyState 
                searchTerm={searchTerm}
                onRefresh={handleRefresh}
              />
            ) : (
              <>
                <UserTable users={paginatedUsers} />
                <UserPagination 
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </>
            )}
          </CardContent>
        </Card>
        
        <UsersTip />
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
