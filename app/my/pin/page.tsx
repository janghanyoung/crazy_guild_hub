"use client";

import { useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";

export default function PinPage() {
  const [characterName, setCharacterName] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePin() {
    setSaving(true);

    const response = await fetch("/api/member/change-pin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mainCharacter: characterName,
        currentPin,
        newPin,
      }),
    });

    const result = await response.json();
    setSaving(false);

    if (!response.ok) {
      alert(result.message ?? "PIN 변경 실패");
      return;
    }

    localStorage.setItem("guild_main_character", result.mainCharacter);

    alert("PIN이 변경되었습니다.");
    setCurrentPin("");
    setNewPin("");
  }

  return (
    <PageContainer>
      <SectionTitle
        title="내 PIN 변경"
        description="대표 캐릭터명과 현재 PIN으로 본인 확인 후 PIN을 변경합니다."
      />

      <div className="max-w-xl space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6">
        <input
          value={characterName}
          onChange={(e) => setCharacterName(e.target.value)}
          placeholder="대표 캐릭터명"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <input
          type="password"
          value={currentPin}
          onChange={(e) => setCurrentPin(e.target.value)}
          placeholder="현재 PIN"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <input
          type="password"
          value={newPin}
          onChange={(e) => setNewPin(e.target.value)}
          placeholder="새 PIN"
          className="h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
        />

        <button
          onClick={handleChangePin}
          disabled={saving}
          className="h-12 rounded-xl bg-violet-600 px-6 font-bold text-white hover:bg-violet-500 disabled:opacity-50"
        >
          {saving ? "변경 중..." : "PIN 변경"}
        </button>
      </div>
    </PageContainer>
  );
}