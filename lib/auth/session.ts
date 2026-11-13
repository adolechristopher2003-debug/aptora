import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

/** Returns the verified Supabase user for this request, if one is signed in. */
export const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error) return null;
  return data.user;
});
