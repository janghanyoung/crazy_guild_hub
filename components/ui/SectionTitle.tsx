type SectionTitleProps = {
  title: string;
  description?: string;
};

export default function SectionTitle({
  title,
  description,
}: SectionTitleProps) {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-black tracking-tight">{title}</h1>

      {description && (
        <p className="mt-3 text-zinc-400">{description}</p>
      )}
    </div>
  );
}
