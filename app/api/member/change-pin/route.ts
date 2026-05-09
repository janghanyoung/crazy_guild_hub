
console.log("SERVICE ROLE EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);


import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";



export async function POST(request: Request) {
  const body = await request.json();

  const mainCharacter = String(body.mainCharacter ?? "").trim();
  const currentPin = String(body.currentPin ?? "").trim();
  const newPin = String(body.newPin ?? "").trim();

  if (!mainCharacter || !currentPin || !newPin) {
    return NextResponse.json(
      { message: "대표 캐릭터명, 현재 PIN, 새 PIN이 필요합니다." },
      { status: 400 }
    );
  }

  if (newPin.length < 4) {
    return NextResponse.json(
      { message: "새 PIN은 최소 4자리여야 합니다." },
      { status: 400 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
  return NextResponse.json(
    { message: "정확한 비밀번호를 입력해주세요." },
    { status: 401 }
  );
}

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: member, error: findError } = await adminSupabase
    .from("guild_members")
    .select("id, main_character, pin_code")
    .eq("main_character", mainCharacter)
    .maybeSingle();

  if (findError || !member) {
    return NextResponse.json(
      { message: "대표 캐릭터명을 찾을 수 없습니다." },
      { status: 404 }
    );
  }

  if (String(member.pin_code ?? "") !== currentPin) {
    return NextResponse.json(
      { message: "현재 PIN이 올바르지 않습니다." },
      { status: 401 }
    );
  }

  const { error: updateError } = await adminSupabase
    .from("guild_members")
    .update({ pin_code: newPin })
    .eq("id", member.id);

  if (updateError) {
    return NextResponse.json(
      { message: updateError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    mainCharacter: member.main_character,
  });
}
