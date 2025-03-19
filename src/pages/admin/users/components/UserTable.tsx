
import React from "react";
import { format } from "date-fns";
import { User } from "@/hooks/useUsers";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface UserTableProps {
  users: User[];
}

const UserTable = ({ users }: UserTableProps) => {
  return (
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
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.email || "—"}</TableCell>
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
  );
};

export default UserTable;
