
import { User } from "@/types/user";
import { v4 as uuidv4 } from 'uuid';

/**
 * Creates a sample user as fallback
 */
export function createSampleUser(): User {
  return {
    id: uuidv4(),
    email: "sample@example.com (mock)",
    created_at: new Date().toISOString(),
    last_sign_in_at: null,
    display_name: "Sample User (mock)",
    total_xp: 150
  };
}
