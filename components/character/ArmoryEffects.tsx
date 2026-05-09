type ProfileStat = {
  Type: string;
  Value: string;
};

type Profile = {
  Stats?: ProfileStat[];
  CombatPower?: string;
};

export default function ArmoryEffects({ profile }: { profile: Profile | null }) {
  const stats = profile?.Stats ?? [];

  const visibleStats = stats.filter((stat) =>
    ["치명", "특화", "신속", "제압", "인내", "숙련", "공격력", "최대 생명력"].includes(stat.Type)
  );

  return (
    <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5">
      <h2 className="text-2xl font-black">전투 효과</h2>

      <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="rounded-xl bg-zinc-950 p-3">
          <p className="text-sm text-zinc-500">전투력</p>
          <p className="mt-1 font-black text-red-300">
            {profile?.CombatPower ?? "-"}
          </p>
        </div>

        {visibleStats.map((stat) => (
          <div key={stat.Type} className="rounded-xl bg-zinc-950 p-3">
            <p className="text-sm text-zinc-500">{stat.Type}</p>
            <p className="mt-1 font-black text-white">{stat.Value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
