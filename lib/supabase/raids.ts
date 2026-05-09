import { supabase } from "./client";

export type Raid = {
  id: string;
  title: string;
  raid_name: string;
  difficulty: string | null;
  raid_date: string | null;
  max_players: number;
  description: string | null;
  status: string;
  created_at: string;
};

export type RaidParticipant = {
  id: string;
  raid_id: string;
  character_name: string;
  role: string | null;
  memo: string | null;
  created_at: string;
};

export async function getRaids() {
  const { data, error } = await supabase
    .from("raids")
    .select("*")
    .order("raid_date", { ascending: true });

  if (error) {
    console.error("getRaids error:", error.message);
    return [];
  }

  return data as Raid[];
}

export async function getRaid(id: string) {
  const { data, error } = await supabase
    .from("raids")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getRaid error:", error.message);
    return null;
  }

  return data as Raid;
}

export async function getRaidParticipants(raidId: string) {
  const { data, error } = await supabase
    .from("raid_participants")
    .select("*")
    .eq("raid_id", raidId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("getRaidParticipants error:", error.message);
    return [];
  }

  return data as RaidParticipant[];
}
