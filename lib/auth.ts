/* import { supabase } from "./supabase/client";

export async function getCurrentUser() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user ?? null;
}

export async function logout() {
  await supabase.auth.signOut();
} */