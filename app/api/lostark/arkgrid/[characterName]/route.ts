import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ characterName: string }> }
) {
  const { characterName } = await params;
  const apiKey = process.env.LOA_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ message: "LOA_API_KEY가 없습니다." }, { status: 500 });
  }

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/armories/characters/${encodeURIComponent(
      characterName
    )}/arkgrid`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      next: { revalidate: 1800 },
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      { message: "arkgrid API 호출 실패", status: response.status },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
