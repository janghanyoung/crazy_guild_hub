import { supabase } from "./client";

export type RaidMaster = {
  id: string;
  name: string;
  slug: string;
  category: string | null;
  min_item_level: number | null;
  max_players: number | null;
  image_url: string | null;
  description: string | null;
  created_at: string;
};

export async function getRaidMasters() {
  const { data, error } = await supabase
    .from("raid_master")
    .select("*")
    .order("min_item_level", { ascending: true });

  if (error) {
    console.error(error.message);
    return [];
  }

  return data as RaidMaster[];
}

export async function getRaidMasterBySlug(slug: string) {
  const { data, error } = await supabase
    .from("raid_master")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error) {
    console.error(error.message);
    return null;
  }

  return data as RaidMaster;
}
