
import React, { useState } from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Users, Search, RefreshCw, AlertCircle, UserPlus } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

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
    toast.info("Refreshing user data...");
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
            <div className="flex items-center mt-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by email or name..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={handleSearch}
                />
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                className="ml-2"
                onClick={handleRefresh}
              >
                <RefreshCw className="h-4 w-4" />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="bg-destructive/10 text-destructive p-4 rounded-md flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                <div>
                  <p className="font-medium">Error loading users</p>
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            ) : paginatedUsers.length === 0 ? (
              <div className="text-center py-8 space-y-4">
                <div className="flex justify-center">
                  <UserPlus className="h-12 w-12 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-lg">
                  {searchTerm ? "No users match your search" : "No users found in the database"}
                </p>
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh
                </Button>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Display Name</TableHead>
                      <TableHead>XP</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Last Sign In</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.email}</TableCell>
                        <TableCell>{user.display_name || "—"}</TableCell>
                        <TableCell>{user.total_xp || 0}</TableCell>
                        <TableCell>
                          {user.created_at 
                            ? format(new Date(user.created_at), "MMM d, yyyy") 
                            : "—"}
                        </TableCell>
                        <TableCell>
                          {user.last_sign_in_at 
                            ? format(new Date(user.last_sign_in_at), "MMM d, yyyy") 
                            : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {totalPages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      {currentPage > 1 && (
                        <PaginationItem>
                          <PaginationPrevious 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage - 1);
                            }} 
                          />
                        </PaginationItem>
                      )}
                      
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <PaginationItem key={page}>
                          <PaginationLink 
                            href="#"
                            isActive={page === currentPage}
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(page);
                            }}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))}
                      
                      {currentPage < totalPages && (
                        <PaginationItem>
                          <PaginationNext 
                            href="#" 
                            onClick={(e) => {
                              e.preventDefault();
                              handlePageChange(currentPage + 1);
                            }} 
                          />
                        </PaginationItem>
                      )}
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>
        
        <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
          <div className="flex gap-2 items-center">
            <Users className="h-5 w-5" />
            <p className="font-medium">Pro Tip</p>
          </div>
          <p className="mt-1 text-sm">
            You can check detailed user listening statistics by clicking the "User Statistics" button above.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
