import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownViewer({
  content,
}: {
  content: string;
}) {
  return (
    <div className="prose prose-invert max-w-none prose-headings:font-black prose-p:text-zinc-200 prose-li:text-zinc-200 prose-strong:text-white prose-code:text-violet-300 prose-pre:bg-zinc-950">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}