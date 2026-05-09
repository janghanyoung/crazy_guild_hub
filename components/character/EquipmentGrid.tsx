type Equipment = {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
  Tooltip?: string;
};

const gradeStyles: Record<string, string> = {
  고대: "border-orange-500/50 bg-orange-950/20",
  유물: "border-red-500/50 bg-red-950/20",
  전설: "border-yellow-500/50 bg-yellow-950/20",
  영웅: "border-purple-500/50 bg-purple-950/20",
};

function stripHtml(value: string) {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function getQuality(tooltip?: string) {
  if (!tooltip) return null;

  const match =
    tooltip.match(/품질[^0-9]{0,20}(\d{1,3})/) ||
    tooltip.match(/"qualityValue":\s*(\d{1,3})/);

  return match?.[1] ?? null;
}

function getAccessoryOptions(tooltip?: string) {
  if (!tooltip) return [];

  const text = stripHtml(tooltip);

  const optionPatterns = [
    /치명\s*\+?\s*\d+/g,
    /특화\s*\+?\s*\d+/g,
    /신속\s*\+?\s*\d+/g,
    /제압\s*\+?\s*\d+/g,
    /인내\s*\+?\s*\d+/g,
    /숙련\s*\+?\s*\d+/g,
    /공격력\s*\+?\s*\d+/g,
    /무기 공격력\s*\+?\s*\d+/g,
    /최대 생명력\s*\+?\s*\d+/g,
    /체력\s*\+?\s*\d+/g,
  ];

  const found = optionPatterns.flatMap((pattern) => text.match(pattern) ?? []);

  return [...new Set(found)].slice(0, 6);
}

function isAccessory(type: string) {
  return ["목걸이", "귀걸이", "반지", "팔찌"].some((keyword) =>
    type.includes(keyword)
  );
}

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
          품질과 악세 옵션을 함께 표시합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {equipments.map((item) => {
          const quality = getQuality(item.Tooltip);
          const accessoryOptions = getAccessoryOptions(item.Tooltip);
          const accessory = isAccessory(item.Type);

          return (
            <article
              key={`${item.Type}-${item.Name}`}
              className={`rounded-2xl border p-4 ${
                gradeStyles[item.Grade] ?? "border-zinc-800 bg-zinc-900/60"
              }`}
            >
              <div className="flex gap-4">
                <img
                  src={item.Icon}
                  alt={item.Name}
                  className="h-16 w-16 shrink-0 rounded-xl border border-zinc-800"
                />

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs text-zinc-400">{item.Type}</p>
                      <h3 className="mt-1 line-clamp-2 font-bold text-white">
                        {item.Name}
                      </h3>
                    </div>

                    {quality && (
                      <span className="rounded-lg bg-zinc-950 px-2 py-1 text-sm font-black text-violet-300">
                        품질 {quality}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm font-medium text-violet-300">
                    {item.Grade}
                  </p>

                  {accessory && accessoryOptions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {accessoryOptions.map((option) => (
                        <span
                          key={option}
                          className="rounded-full border border-zinc-700 bg-zinc-950 px-2.5 py-1 text-xs font-medium text-zinc-200"
                        >
                          {option}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}