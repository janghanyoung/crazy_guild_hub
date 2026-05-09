import { NextResponse } from "next/server";

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

  const response = await fetch(
    `https://developer-lostark.game.onstove.com/characters/${encodeURIComponent(
      characterName
    )}/siblings`,
    {
      headers: {
        accept: "application/json",
        authorization: `bearer ${apiKey}`,
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    return NextResponse.json(
      {
        message: "siblings API 호출 실패",
        status: response.status,
      },
      { status: response.status }
    );
  }

  return NextResponse.json(await response.json());
}
