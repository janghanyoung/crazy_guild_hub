import type { ReactNode } from "react";


const notices = [
  { tag: "필독", title: "이번 주 길드 공지 확인", date: "2026.05.12" },
  { tag: "레이드", title: "카제로스 트라이 파티 모집 중", date: "2026.05.11" },
  { tag: "일반", title: "사진첩 업로드 규칙 안내", date: "2026.05.10" },
];

const islands = [
  { time: "11:00", name: "모험섬 1", reward: "카드 / 실링" },
  { time: "19:00", name: "모험섬 2", reward: "골드 / 주화" },
  { time: "23:00", name: "모험섬 3", reward: "항해 주화" },
];

const patches = [
  { type: "밸패", title: "클래스 밸런스 조정 안내", date: "최근 공지" },
  { type: "공지", title: "로스트아크 정기점검 안내", date: "최근 공지" },
  { type: "이벤트", title: "출석 이벤트 및 보상 안내", date: "최근 공지" },
];

const gallery = [
  "카멘 하드 첫 클리어",
  "길드 단체 스샷",
  "모코코 납치 현장",
  "레이드 후 단체사진",
];

const raids = [
  { name: "카제로스 레이드", status: "모집중", members: "6 / 8" },
  { name: "카멘 하드", status: "예정", members: "8 / 8" },
  { name: "에키드나 노말", status: "모집중", members: "4 / 8" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-6 text-zinc-100 sm:px-8 lg:px-10">
      <section className="relative overflow-hidden rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-8 shadow-2xl">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200">
              카단 서버 · 로스트아크 길드 허브
            </p>

            <h1 className="max-w-3xl text-4xl font-black tracking-tight text-white sm:text-6xl">
              오늘도 대환장
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-zinc-300 sm:text-lg">
              모험섬 일정, 공식 패치노트, 길드 공지, 팬아트, 사진첩까지 한 번에 보는
              대환장 길드 메인 허브입니다.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href="/raids"
                className="rounded-full bg-amber-300 px-5 py-3 text-sm font-bold text-zinc-950 transition hover:bg-amber-200"
              >
                오늘 공대 보기
              </a>
              <a
                href="/guides"
                className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-100 transition hover:bg-zinc-900"
              >
                공략집 바로가기
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-800 bg-white/5 p-5 backdrop-blur">
            <p className="text-sm font-semibold text-zinc-400">오늘의 길드 상태</p>
            <div className="mt-5 grid grid-cols-3 gap-3">
              <StatusCard label="공지" value="3" />
              <StatusCard label="공대" value="3" />
              <StatusCard label="사진" value="12" />
            </div>
            <p className="mt-5 rounded-2xl bg-zinc-900 p-4 text-sm leading-6 text-zinc-300">
              “강화는 확률이 아니라 기도다.”
            </p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="오늘의 모험섬" subtitle="임시 데이터 · 추후 API/수동관리 연결">
          <div className="space-y-3">
            {islands.map((item) => (
              <div
                key={item.time}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <div>
                  <p className="text-sm font-bold text-amber-200">{item.time}</p>
                  <p className="mt-1 text-base font-bold text-white">{item.name}</p>
                </div>
                <p className="text-sm text-zinc-400">{item.reward}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="공지사항" subtitle="중요 공지는 메인에 고정">
          <div className="space-y-3">
            {notices.map((notice) => (
              <a
                key={notice.title}
                href="/notice"
                className="block rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4 transition hover:border-amber-300/60"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs font-bold text-amber-200">
                    {notice.tag}
                  </span>
                  <span className="text-xs text-zinc-500">{notice.date}</span>
                </div>
                <p className="mt-3 font-bold text-white">{notice.title}</p>
              </a>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Panel title="로아 공식 패치 / 밸패" subtitle="나중에 공식 공지 크롤링 영역">
          <div className="space-y-3">
            {patches.map((patch) => (
              <div
                key={patch.title}
                className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-sky-400/10 px-3 py-1 text-xs font-bold text-sky-200">
                    {patch.type}
                  </span>
                  <span className="text-xs text-zinc-500">{patch.date}</span>
                </div>
                <p className="mt-3 font-bold text-white">{patch.title}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="길드 사진첩" subtitle="레이드, 단체사진, 웃긴 장면 저장소">
          <div className="grid gap-3 sm:grid-cols-2">
            {gallery.map((title, index) => (
              <div
                key={title}
                className="group min-h-36 rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-800 to-zinc-950 p-4 transition hover:-translate-y-1 hover:border-amber-300/60"
              >
                <div className="flex h-full flex-col justify-between">
                  <span className="text-xs text-zinc-500">PHOTO #{index + 1}</span>
                  <p className="text-lg font-black text-white">{title}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <Panel title="오늘의 길드 아틀리에" subtitle="팬아트 / 그림러 전용 전시 공간">
          <div className="rounded-3xl border border-dashed border-amber-300/40 bg-amber-300/5 p-6">
            <p className="text-sm font-bold text-amber-200">FEATURED ART</p>
            <h3 className="mt-4 text-2xl font-black text-white">이번 주 대표 팬아트</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              여기에 그림 이미지, 작가 닉네임, 짧은 코멘트를 붙이면 됨.
              나중에 Supabase Storage 붙이면 업로드형 갤러리로 확장 가능.
            </p>
            <div className="mt-6 flex h-56 items-center justify-center rounded-2xl bg-zinc-900 text-sm text-zinc-500">
              이미지 자리
            </div>
          </div>
        </Panel>

        <Panel title="모집중인 레이드" subtitle="오늘의 공대 / 남은 자리">
          <div className="space-y-3">
            {raids.map((raid) => (
              <div
                key={raid.name}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 p-4"
              >
                <div>
                  <p className="font-bold text-white">{raid.name}</p>
                  <p className="mt-1 text-sm text-zinc-500">{raid.members}</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  {raid.status}
                </span>
              </div>
            ))}
          </div>
        </Panel>
      </section>
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React;
}) {
  return (
    <section className="rounded-[1.75rem] border border-zinc-800 bg-zinc-950/80 p-5 shadow-xl">
      <div className="mb-5">
        <h2 className="text-xl font-black text-white">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-zinc-500">{subtitle}</p> : null}
      </div>
      {children}
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-center">
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="mt-1 text-xs text-zinc-500">{label}</p>
    </div>
  );
}