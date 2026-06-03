import { join } from "node:path";

import { BuildContentGraph } from "@/domain/content/graphBuilder.ts";
import type { ContentGraph } from "@/domain/content/models.ts";
import { ParseLogseqContent } from "@/ingestion/logseq/parseLogseqContent.ts";
import { ExtractMarkdownPreviewText, RenderMarkdownHtml } from "./renderMarkdown.ts";

const CONTENT_PAGES_DIRECTORY = join(process.cwd(), "content", "logseq", "pages");

let contentGraphPromise: Promise<ContentGraph> | null = null;

export async function LoadContentGraph(): Promise<ContentGraph> {
  if (contentGraphPromise === null) {
    contentGraphPromise = LoadContentGraphInternal();
  }

  return contentGraphPromise;
}

export function GetTopicPath(topicId: string): string {
  return `/topics/${EncodePathSegment(topicId)}/`;
}

export function GetProblemPath(problemId: string): string {
  return `/problems/${EncodePathSegment(problemId)}/`;
}

export async function RenderSectionHtml(content: string): Promise<string> {
  return RenderMarkdownHtml(content);
}

async function LoadContentGraphInternal(): Promise<ContentGraph> {
  const summary = await ParseLogseqContent(CONTENT_PAGES_DIRECTORY);

  for (const error of summary.errors) {
    const location =
      error.location === undefined
        ? ""
        : `:${error.location.line}${error.location.column === undefined ? "" : `:${error.location.column}`}`;
    const context = error.context === undefined ? "" : ` (${error.context})`;

    console.warn(`${error.sourcePath}${location}: ${error.message}${context}`);
  }

  const graphResult = BuildContentGraph(summary.pages);

  for (const warning of graphResult.warnings) {
    console.warn(warning.message);
  }

  if (graphResult.graph === null) {
    throw new Error("Unable to build the content graph from Logseq pages.");
  }

  return graphResult.graph;
}

function EncodePathSegment(value: string): string {
  return encodeURIComponent(value.trim().toLowerCase());
}

export function ExtractPreviewText(content: string): string {
  return ExtractMarkdownPreviewText(content);
}

export default {
  LoadContentGraph,
  GetTopicPath,
  GetProblemPath,
  RenderSectionHtml,
  ExtractPreviewText
};
