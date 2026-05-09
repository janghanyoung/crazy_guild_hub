import { supabase } from "./client";

export type RaidDifficulty = {
  id: string;
  raid_master_id: string;
  difficulty: string;
  min_item_level: number;
  max_players: number;
  gate_count: number | null;
  sort_order: number;
};

export type RaidMaster = {
  id: string;
  name: string;
  slug: string;
  raid_type: string;
  image_url: string | null;
  description: string | null;
  created_at: string;
  difficulties?: RaidDifficulty[];
};

export async function getRaidMasters() {
  const { data, error } = await supabase
    .from("raid_master")
    .select(`
      *,
      difficulties:raid_difficulties(*)
    `)
    .order("created_at", { ascending: true });

  if (error) {
    console.error(error.message);
    return [];
  }

  return data as RaidMaster[];
}

export async function getRaidMasterBySlug(slug: string) {
  const { data, error } = await supabase
    .from("raid_master")
    .select(`
      *,
      difficulties:raid_difficulties(*)
    `)
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data as RaidMaster;
}