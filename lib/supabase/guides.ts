import { supabase } from "./client";

export type Guide = {
  id: string;
  title: string;
  category: "raid" | "collectible" | "achievement" | "general";
  target_type: string | null;
  target_name: string | null;
  content: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
};

export async function getGuides() {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGuides error:", error.message);
    return [];
  }

  return data as Guide[];
}

export async function getGuide(id: string) {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("getGuide error:", error.message);
    return null;
  }

  return data as Guide;
}

export async function getGuidesByCategory(category: Guide["category"]) {
  const { data, error } = await supabase
    .from("guides")
    .select("*")
    .eq("category", category)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getGuidesByCategory error:", error.message);
    return [];
  }

  return data as Guide[];
}