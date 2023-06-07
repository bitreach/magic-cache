import "dotenv/config";
import { createClient } from "@supabase/supabase-js";

// Create a single supabase client for interacting with your database
export const supabaseClient = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_KEY as string
);

export const getUserFromJWT = async (token: string) => {
  if (!token) return null;
  const res = await supabaseClient.auth.getUser(token.replace("Bearer ", ""));
  return res.data.user;
};
