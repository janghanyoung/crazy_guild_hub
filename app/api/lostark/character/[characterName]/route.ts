import { NextResponse } from "next/server";

async function loaFetch(path: string, apiKey: string) {
  const response = await fetch(
    `https://developer-lostark.game.onstove.com${path}`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: {
        revalidate: 1800,
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  return response.json();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterName: string }> }
) {
  const { characterName } = await params;

  const apiKey = process.env.LOA_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { message: "LOA_API_KEY가 없습니다." },
      { status: 500 }
    );
  }

  const encodedName = encodeURIComponent(characterName);

  const [
    profile,
    equipment,
    gems,
    cards,
    engravings,
    arkPassive,
    arkGrid,
    combatSkills,
  ] = await Promise.all([
    loaFetch(`/armories/characters/${encodedName}/profiles`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/equipment`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/gems`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/cards`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/engravings`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/arkpassive`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/arkgrid`, apiKey),
    loaFetch(`/armories/characters/${encodedName}/combat-skills`, apiKey),
  ]);

  return NextResponse.json({
    profile,
    equipment,
    gems,
    cards,
    engravings,
    arkPassive,
    arkGrid,
    combatSkills,
    fetchedAt: new Date().toISOString(),
  });
}
