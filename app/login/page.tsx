"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import PageContainer from "@/components/ui/PageContainer";

export default function LoginPage() {
  const router = useRouter();

  const [mainCharacter, setMainCharacter] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!mainCharacter.trim() || !pin.trim()) {
      alert("대표 캐릭터와 PIN을 입력해주세요.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/member/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mainCharacter,
          pin,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message ?? "로그인 실패");
        return;
      }

      localStorage.setItem(
        "guild-auth",
        JSON.stringify({
          mainCharacter: result.member.main_character,
          pin,
        })
      );

      router.push("/");
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-md rounded-3xl border border-zinc-800 bg-zinc-900/70 p-8">
        <h1 className="text-3xl font-black text-white">
          길드 로그인
        </h1>

        <p className="mt-3 text-sm leading-6 text-zinc-400">
          대표 캐릭터명과 PIN으로 로그인합니다.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label className="text-sm font-bold text-zinc-300">
              대표 캐릭터
            </label>

            <input
              value={mainCharacter}
              onChange={(e) => setMainCharacter(e.target.value)}
              placeholder="대표 캐릭터명"
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
            />
          </div>

          <div>
            <label className="text-sm font-bold text-zinc-300">
              PIN
            </label>

            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN"
              className="mt-2 h-12 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-4 text-white outline-none focus:border-violet-500"
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="h-12 w-full rounded-xl bg-violet-600 font-bold text-white transition hover:bg-violet-500 disabled:opacity-50"
          >
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}