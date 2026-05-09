"use client";

import { useState } from "react";
import PageContainer from "../../../components/ui/PageContainer";
import SectionTitle from "../../../components/ui/SectionTitle";
import { supabase } from "../../../lib/supabase/client";

export default function PinPage() {
  const [characterName, setCharacterName] = useState("");
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleChangePin() {
    if (!characterName.trim()) {
      alert("대표 캐릭터명을 입력하세요.");
      return;
    }

    if (!currentPin.trim()) {
      alert("현재 PIN을 입력하세요.");
      return;
    }

    if (!newPin.trim()) {
      alert("새 PIN을 입력하세요.");
      return;
    }

    if (newPin.length < 4) {
      alert("PIN은 최소 4자리로 설정하세요.");
      return;
    }

    setSaving(true);

    const { data: member, error: findError } = await supabase
      .from("guild_members")
      .select("id, main_character, pin_code")
      .eq("main_character", characterName)
      .eq("pin_code", currentPin)
      .single();

    if (findError || !member) {
      setSaving(false);
      alert("대표 캐릭터명 또는 현재 PIN이 틀렸습니다.");
      return;
    }

    const { error } = await supabase
      .from("guild_members")
      .update({ pin_code: newPin })
      .eq("id", member.id);

    setSaving(false);

    if (error) {
      alert(error.message);
      return;
    }

    localStorage.setItem("guild_main_character", member.main_character);

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
        <div>
          <label className="text-sm font-bold text-zinc-300">
            대표 캐릭터명
          </label>
          <input
            value={characterName}
            onChange={(e) => setCharacterName(e.target.value)}
            placeholder="예: 파이썬을쓰는자"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">현재 PIN</label>
          <input
            type="password"
            value={currentPin}
            onChange={(e) => setCurrentPin(e.target.value)}
            placeholder="현재 PIN"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

        <div>
          <label className="text-sm font-bold text-zinc-300">새 PIN</label>
          <input
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="새 PIN"
            className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white"
          />
        </div>

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