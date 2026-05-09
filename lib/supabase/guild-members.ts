import { supabase } from "./client";

export type GuildMember = {
  id: string;
  main_character: string;
  server_name: string | null;
  guild_name: string | null;
  created_at: string;
};

export async function getGuildMembers(): Promise<GuildMember[]> {
  const { data, error } = await supabase
    .from("guild_members")
    .select("id, main_character, server_name, guild_name, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getGuildMembers error:", error.message);
    return [];
  }

  return data ?? [];
}