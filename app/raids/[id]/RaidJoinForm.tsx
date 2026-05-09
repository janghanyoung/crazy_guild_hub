"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type EligibleCharacter = {
  ServerName: string;
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ParsedItemLevel: number;
};

export default function RaidJoinForm({ raidId }: { raidId: string }) {
  const router = useRouter();

  const [characterName, setCharacterName] = useState("");
  const [pinCode, setPinCode] = useState("");
  const [verified, setVerified] = useState(false);
  const [minItemLevel, setMinItemLevel] = useState(0);
  const [eligibleCharacters, setEligibleCharacters] = useState<EligibleCharacter[]>([]);
  const [allCharacters, setAllCharacters] = useState<EligibleCharacter[]>([]);
  const [selectedCharacter, setSelectedCharacter] = useState("");
  const [role, setRole] = useState("딜러");
  const [memo, setMemo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem("guild_main_character");
    if (savedName) setCharacterName(savedName);
  }, []);

  async function handleVerify() {
    setLoading(true);

    const response = await fetch("/api/raid/eligible-characters", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mainCharacter: characterName,
        pinCode,
        raidId,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(result.message ?? "본인 확인 실패");
      return;
    }

    setVerified(true);
    setMinItemLevel(result.minItemLevel);
    setEligibleCharacters(result.eligibleCharacters ?? []);
    setAllCharacters(result.allCharacters ?? []);
    setSelectedCharacter(result.eligibleCharacters?.[0]?.CharacterName ?? "");
    localStorage.setItem("guild_main_character", result.mainCharacter);
  }

  async function handleJoin() {
    if (!selectedCharacter) {
      alert("신청 가능한 캐릭터가 없습니다.");
      return;
    }

    setLoading(true);

    const response = await fetch("/api/raid/join", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        raidId,
        mainCharacter: characterName,
        pinCode,
        selectedCharacter,
        role,
        memo,
      }),
    });

    const result = await response.json();
    setLoading(false);

    if (!response.ok) {
      alert(result.message ?? "신청 실패");
      return;
    }

    alert("레이드 신청 완료");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-xl font-black">레이드 신청</h2>

      {!verified && (
        <div className="mt-5 space-y-4">
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="대표 캐릭터명"
            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />

          <input
            type="password"
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value)}
            placeholder="PIN 번호"
            className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />

          <button
            onClick={handleVerify}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "확인 중..." : "본인 확인"}
          </button>
        </div>
      )}

      {verified && (
        <div className="mt-5 space-y-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">입장 제한</p>
            <p className="mt-1 font-black text-violet-300">
              Lv. {minItemLevel} 이상
            </p>
          </div>

          {eligibleCharacters.length > 0 ? (
            <>
              <select
                value={selectedCharacter}
                onChange={(e) => setSelectedCharacter(e.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
              >
                {eligibleCharacters.map((character) => (
                  <option
                    key={character.CharacterName}
                    value={character.CharacterName}
                  >
                    {character.CharacterName} / {character.CharacterClassName} / {character.ItemAvgLevel}
                  </option>
                ))}
              </select>

              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
              >
                <option>딜러</option>
                <option>서포터</option>
                <option>버스</option>
                <option>학원생</option>
              </select>

              <textarea
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                rows={4}
                placeholder="메모"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950 p-4 text-white"
              />

              <button
                onClick={handleJoin}
                disabled={loading}
                className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
              >
                {loading ? "신청 중..." : "레이드 신청"}
              </button>
            </>
          ) : (
            <div className="rounded-xl border border-red-900/60 bg-red-950/30 p-4">
              <p className="font-bold text-red-300">
                신청 가능한 캐릭터가 없습니다.
              </p>
              <p className="mt-2 text-sm text-red-200/80">
                원정대 최고 캐릭터가 입장 제한 Lv. {minItemLevel}에 도달하지 못했습니다.
              </p>

              <div className="mt-4 space-y-2 text-sm text-zinc-400">
                {allCharacters.slice(0, 5).map((character) => (
                  <p key={character.CharacterName}>
                    {character.CharacterName} · {character.ItemAvgLevel}
                  </p>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => {
              setVerified(false);
              setEligibleCharacters([]);
              setAllCharacters([]);
              setSelectedCharacter("");
            }}
            className="text-sm text-zinc-500 hover:text-white"
          >
            다른 대표캐로 확인하기
          </button>
        </div>
      )}
    </div>
  );
}