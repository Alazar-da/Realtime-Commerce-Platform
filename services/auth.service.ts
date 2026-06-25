import { createClient } from "@/lib/supabase/server";

export const registerUser = async ({
  email,
  password,
  username,
  phone,
}: {
  email: string;
  password: string;
  username: string;
  phone?: string;
}) => {
  const supabase = await createClient();

  // Step 1: Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;

  // Step 2: Insert into profile table
  await supabase.from("profiles").insert({
    id: data.user?.id,
    username,
    email,
    phone,
  });

  return data;
};

export const loginUser = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  return data;
};