import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function MarkdownViewer({ content }: { content: string }) {
  return (
    <div className="max-w-none space-y-4 text-sm leading-7 text-zinc-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="mt-8 text-3xl font-black text-white">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="mt-7 text-2xl font-black text-white">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-6 text-xl font-black text-white">{children}</h3>
          ),
          p: ({ children }) => <p className="text-zinc-200">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc space-y-1 pl-6">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal space-y-1 pl-6">{children}</ol>
          ),
          li: ({ children }) => <li className="text-zinc-200">{children}</li>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-violet-500 bg-zinc-900 px-4 py-3 text-zinc-300">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-violet-200">
              {children}
            </code>
          ),
          pre: ({ children }) => (
            <pre className="overflow-x-auto rounded-xl bg-zinc-950 p-4">
              {children}
            </pre>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-violet-300 underline underline-offset-4"
            >
              {children}
            </a>
          ),
          img: ({ src, alt }) => (
            <img
              src={src ?? ""}
              alt={alt ?? "공략 이미지"}
              className="my-5 max-h-[720px] rounded-2xl border border-zinc-800 object-contain"
            />
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto rounded-xl border border-zinc-800">
              <table className="w-full border-collapse text-sm">{children}</table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-zinc-800 bg-zinc-900 px-3 py-2 text-left font-bold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-zinc-800 px-3 py-2 text-zinc-300">
              {children}
            </td>
          ),
        }}
      >
        {content || "내용 없음"}
      </ReactMarkdown>
    </div>
  );
}