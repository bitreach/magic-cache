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

export const isValidAPIKey = async function (receivedAPIKey:string) {
  try{
    const { data, error } = await supabaseClient
    .from('api_keys')
    .select(`api_key, api_key_developer (developer_id)`)
    .eq('api_key', receivedAPIKey)
        if (error){
            console.log(error)
            return false
        }
        else{
            if (data.length === 0) {
              return false
            }
            const isAuthenticated = data[0].api_key === receivedAPIKey
            if (!isAuthenticated) {
              return false
            }
            const developerID = data[0].api_key_developer[0].developer_id
            return developerID
        }
    }catch(err){
        return false
    }
}