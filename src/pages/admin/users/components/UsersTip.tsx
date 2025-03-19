
import React from "react";
import { Users } from "lucide-react";

const UsersTip = () => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-amber-700">
      <div className="flex gap-2 items-center">
        <Users className="h-5 w-5" />
        <p className="font-medium">Pro Tip</p>
      </div>
      <p className="mt-1 text-sm">
        You can check detailed user listening statistics by clicking the "User Statistics" button above.
      </p>
    </div>
  );
};

export default UsersTip;
