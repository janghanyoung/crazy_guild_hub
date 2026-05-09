import { supabase } from "./client";

export async function getGuildMembers() {
  const { data, error } = await supabase
    .from("guild_members")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error);
    return [];
  }

  return data;
}