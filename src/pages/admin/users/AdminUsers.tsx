
import React from "react";
import AdminLayout from "@/components/AdminLayout";

const AdminUsers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        </div>
        <p>User management will be implemented here.</p>
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
