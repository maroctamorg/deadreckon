import { toString } from "mdast-util-to-string";
import { unified } from "unified";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeKatex from "rehype-katex";
import remarkBreaks from "remark-breaks";
import rehypeMermaid from "rehype-mermaid";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

import type { Root, Link } from "mdast";

const markdownToHtmlProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkBreaks)
  .use(remarkMath)
  .use(remarkLogseqLinks)
  .use(remarkRehype, { allowDangerousHtml: false })
  .use(rehypePrettyCode, {
    theme: "github-light",
    keepBackground: true
  })
  .use(rehypeMermaid, { strategy: "inline-svg" })
  .use(rehypeKatex)
  .use(rehypeStringify);

const markdownToTextProcessor = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkMath)
  .use(remarkLogseqLinks);

export async function RenderMarkdownHtml(content: string): Promise<string> {
  if (content.trim().length === 0) {
    return "";
  }

  const result = await markdownToHtmlProcessor.process(content);

  return String(result);
}

export function ExtractMarkdownPreviewText(content: string): string {
  if (content.trim().length === 0) {
    return "";
  }

  const tree = markdownToTextProcessor.parse(content) as Root;
  NormalizeLogseqLinks(tree);

  const text = toString(tree).trim();

  return text;
}

function remarkLogseqLinks() {
  return (tree: Root) => {
    NormalizeLogseqLinks(tree);
  };
}

function NormalizeLogseqLinks(tree: Root): void {
  VisitContentContainer(tree);
}

function VisitContentContainer(node: any): void {
  if (node !== null && typeof node === "object" && Array.isArray(node.children)) {
    node.children = NormalizeChildren(node.children);

    for (const child of node.children) {
      VisitContentContainer(child);
    }
  }
}

function NormalizeChildren(children: any[]): any[] {
  const normalized: any[] = [];

  for (const child of children) {
    if (child.type === "text") {
      normalized.push(...SplitLogseqText(String(child.value)));
      continue;
    }

    normalized.push(child);
  }

  return normalized;
}

function SplitLogseqText(value: string): any[] {
  const parts: any[] = [];
  const pattern = /\[\[([^\]]+)\]\]/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(value)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: "text", value: value.slice(lastIndex, match.index) });
    }

    const linkTitle = match[1].trim();

    if (linkTitle.length > 0) {
      parts.push(CreateTopicLink(linkTitle));
    }

    lastIndex = pattern.lastIndex;
  }

  if (lastIndex < value.length) {
    parts.push({ type: "text", value: value.slice(lastIndex) });
  }

  return parts;
}

function CreateTopicLink(title: string): Link {
  return {
    type: "link",
    url: `/topics/${EncodePathSegment(title)}/`,
    title: null,
    children: [{ type: "text", value: title }]
  };
}

function EncodePathSegment(value: string): string {
  return encodeURIComponent(value.trim().toLowerCase());
}
