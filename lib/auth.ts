import { supabase } from "./supabase";

export const login = async (
  email: string,
  password: string
) => {
  const { data, error } =
    await supabase.auth.signInWithPassword({
      email,
      password,
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const register = async (
  username: string,
  email: string,
  password: string
) => {
  const { data, error } =
    await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
        },
      },
    });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const logout = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};

export const getAccessToken = async () => {
  const { data, error } =
    await supabase.auth.getSession();

  if (error) return null;

  return data.session?.access_token ?? null;
};

export const getUser = async () => {
  const { data, error } =
    await supabase.auth.getUser();

  if (error) return null;

  return data.user;
};

export const isAuthenticated = async () => {
  const user = await getUser();

  return !!user;
};