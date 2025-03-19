
import React from "react";
import AdminLayout from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { BarChart, Users } from "lucide-react";

const AdminUsers = () => {
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
        <p>User management functionality will be implemented here.</p>
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
