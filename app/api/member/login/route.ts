import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  const body = await request.json();

  const mainCharacter = String(body.mainCharacter ?? "").trim();
  const pin = String(body.pin ?? "").trim();

  if (!mainCharacter || !pin) {
    return NextResponse.json(
      { message: "대표 캐릭터와 PIN을 입력해주세요." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      { message: "서버 설정 오류" },
      { status: 500 }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    serviceRoleKey
  );

  const { data: member, error } = await supabase
    .from("guild_members")
    .select("*")
    .eq("main_character", mainCharacter)
    .maybeSingle();

  if (error || !member) {
    return NextResponse.json(
      { message: "대표 캐릭터를 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (String(member.pin_code ?? "") !== pin) {
    return NextResponse.json(
      { message: "PIN이 올바르지 않습니다." },
      { status: 401 }
    );
  }

  return NextResponse.json({
    ok: true,
    member,
  });
}