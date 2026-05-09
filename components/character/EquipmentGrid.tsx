type Equipment = {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
};

const gradeStyles: Record<string, string> = {
  고대: "border-orange-500/50 bg-orange-950/20",
  유물: "border-red-500/50 bg-red-950/20",
  전설: "border-yellow-500/50 bg-yellow-950/20",
  영웅: "border-purple-500/50 bg-purple-950/20",
};

export default function EquipmentGrid({
  equipments,
}: {
  equipments: Equipment[];
}) {
  return (
    <section className="mt-10">
      <div className="mb-5">
        <h2 className="text-2xl font-black">장비</h2>
        <p className="mt-2 text-sm text-zinc-400">
          로스트아크 장비 정보
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
        {equipments.map((item) => (
          <article
            key={`${item.Type}-${item.Name}`}
            className={`rounded-2xl border p-4 ${
              gradeStyles[item.Grade] ??
              "border-zinc-800 bg-zinc-900/60"
            }`}
          >
            <div className="flex items-center gap-4">
              <img
                src={item.Icon}
                alt={item.Name}
                className="h-16 w-16 rounded-xl border border-zinc-800"
              />

              <div className="min-w-0">
                <p className="text-xs text-zinc-400">
                  {item.Type}
                </p>

                <h3 className="mt-1 line-clamp-2 font-bold text-white">
                  {item.Name}
                </h3>

                <p className="mt-2 text-sm font-medium text-violet-300">
                  {item.Grade}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
