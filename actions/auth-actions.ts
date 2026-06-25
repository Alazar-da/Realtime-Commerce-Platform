// actions/auth-actions.ts

"use server";

import { createClient } from "@/lib/supabase/server";

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .single();

  return {
    success: true,
    user: profile,
  };
}

// actions/auth-actions.ts

export async function registerUser({
  email,
  password,
  username,
}: {
  email: string;
  password: string;
  username: string;
}) {
  const supabase = await createClient();

  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
    });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  await supabase.from("profiles").insert({
    id: data.user?.id,
    email,
    username,
    role: "customer",
  });

  return {
    success: true,
  };
}