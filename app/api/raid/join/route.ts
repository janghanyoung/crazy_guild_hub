import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type Sibling = {
  CharacterName: string;
  ItemAvgLevel: string;
};

function parseItemLevel(value: string) {
  return Number(String(value).replaceAll(",", ""));
}

export async function POST(request: Request) {
  const { raidId, mainCharacter, pinCode, selectedCharacter, role, memo } =
    await request.json();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const loaKey = process.env.LOA_API_KEY;

  if (!supabaseUrl || !serviceRoleKey || !loaKey) {
    return NextResponse.json(
      { message: "서버 환경변수가 없습니다." },
      { status: 500 }
    );
  }

  const adminSupabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: member } = await adminSupabase
    .from("guild_members")
    .select("id, main_character, pin_code")
    .eq("main_character", String(mainCharacter).trim())
    .maybeSingle();

  if (!member || String(member.pin_code) !== String(pinCode).trim()) {
    return NextResponse.json(
      { message: "정확한 비밀번호를 입력해주세요." },
      { status: 401 }
    );
  }

  const { data: raid } = await adminSupabase
    .from("raids")
    .select("id, min_item_level")
    .eq("id", raidId)
    .maybeSingle();

  if (!raid) {
    return NextResponse.json({ message: "레이드를 찾을 수 없습니다." }, { status: 404 });
  }

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(
      member.main_character
    )}/siblings`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${loaKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "원정대 캐릭터 조회 실패" },
      { status: response.status }
    );
  }

  const siblings = (await response.json()) as Sibling[];
  const character = siblings.find(
    (item) => item.CharacterName === selectedCharacter
  );

  if (!character) {
    return NextResponse.json(
      { message: "해당 원정대 캐릭터를 찾을 수 없습니다." },
      { status: 400 }
    );
  }

  const minItemLevel = Number(raid.min_item_level ?? 0);
  const itemLevel = parseItemLevel(character.ItemAvgLevel);

  if (itemLevel < minItemLevel) {
    return NextResponse.json(
      { message: `입장 레벨이 부족합니다. 필요 레벨: ${minItemLevel}` },
      { status: 400 }
    );
  }

  const { error } = await adminSupabase.from("raid_participants").insert({
    raid_id: raidId,
    guild_member_id: member.id,
    character_name: selectedCharacter,
    role,
    memo,
  });

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        { message: "이미 신청한 레이드입니다." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}