// Very lightweight markdown renderer — handles common elements used in articles.
// For more advanced needs, swap in `marked` or `react-markdown`.
export function renderMarkdown(md: string): string {
  let html = md;

  // Escape HTML first
  html = html
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Code block (triple backtick)
  html = html.replace(
    /```([\s\S]*?)```/g,
    (_, code) =>
      `<pre class="bg-brand-bg border border-brand-hair p-4 my-5 overflow-x-auto text-[13px] font-mono text-brand-text"><code>${code}</code></pre>`
  );

  // Inline code
  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-brand-bg px-1.5 py-0.5 text-[13px] font-mono text-brand-dark">$1</code>'
  );

  // Headings
  html = html.replace(
    /^######\s+(.+)$/gm,
    '<h6 class="font-serif text-[16px] text-brand-text mt-8 mb-3 font-semibold">$1</h6>'
  );
  html = html.replace(
    /^#####\s+(.+)$/gm,
    '<h5 class="font-serif text-[18px] text-brand-text mt-8 mb-3 font-semibold">$1</h5>'
  );
  html = html.replace(
    /^####\s+(.+)$/gm,
    '<h4 class="font-serif text-[20px] text-brand-text mt-8 mb-3 font-semibold">$1</h4>'
  );
  html = html.replace(
    /^###\s+(.+)$/gm,
    '<h3 class="font-serif text-[22px] text-brand-text mt-10 mb-3 font-semibold">$1</h3>'
  );
  html = html.replace(
    /^##\s+(.+)$/gm,
    '<h2 class="font-serif text-[26px] text-brand-text mt-12 mb-4 font-semibold">$1</h2>'
  );
  html = html.replace(
    /^#\s+(.+)$/gm,
    '<h1 class="font-serif text-[32px] text-brand-text mt-12 mb-5 font-semibold">$1</h1>'
  );

  // Blockquote
  html = html.replace(
    /^>\s+(.+)$/gm,
    '<blockquote class="border-l-4 border-brand-accent bg-brand-bg pl-5 py-3 my-5 italic text-brand-muted">$1</blockquote>'
  );

  // Unordered list
  html = html.replace(/(^[-*]\s+.+$\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((l) => l.replace(/^[-*]\s+/, ""))
      .map((item) => `<li class="mb-1.5">${item}</li>`)
      .join("");
    return `<ul class="list-disc pl-6 my-5 space-y-1 text-brand-text">${items}</ul>`;
  });

  // Ordered list
  html = html.replace(/(^\d+\.\s+.+$\n?)+/gm, (match) => {
    const items = match
      .trim()
      .split("\n")
      .map((l) => l.replace(/^\d+\.\s+/, ""))
      .map((item) => `<li class="mb-1.5">${item}</li>`)
      .join("");
    return `<ol class="list-decimal pl-6 my-5 space-y-1 text-brand-text">${items}</ol>`;
  });

  // Bold
  html = html.replace(
    /\*\*([^*]+)\*\*/g,
    '<strong class="font-semibold text-brand-dark">$1</strong>'
  );

  // Italic
  html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');

  // Links
  html = html.replace(
    /\[([^\]]+)\]\(([^)]+)\)/g,
    '<a href="$2" class="text-brand-accent underline underline-offset-2 hover:text-brand-dark" target="_blank" rel="noopener noreferrer">$1</a>'
  );

  // Images
  html = html.replace(
    /!\[([^\]]*)\]\(([^)]+)\)/g,
    '<img src="$2" alt="$1" class="my-6 w-full" />'
  );

  // Horizontal rule
  html = html.replace(
    /^---+$/gm,
    '<hr class="border-t border-brand-hair my-10" />'
  );

  // Paragraphs (double newlines)
  html = html
    .split(/\n{2,}/)
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return "";
      if (/^<(h\d|ul|ol|blockquote|pre|hr|img)/.test(trimmed)) return trimmed;
      return `<p class="my-4 leading-[1.95] text-[15px] text-brand-text/85">${trimmed.replace(/\n/g, "<br/>")}</p>`;
    })
    .join("\n");

  return html;
}
