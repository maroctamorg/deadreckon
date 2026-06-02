import type { ContentPage, ContentParseError } from "../../domain/content/index.ts";

import { LogseqParser } from "./logseqParser.ts";
import { ReadLogseqSourceFiles } from "./logseqSourceFiles.ts";

export interface LogseqContentParseSummary {
  pages: ContentPage[];
  errors: ContentParseError[];
}

export async function ParseLogseqContent(
  pagesDirectory: string
): Promise<LogseqContentParseSummary> {
  const pages: ContentPage[] = [];
  const errors: ContentParseError[] = [];

  for await (const sourceFile of ReadLogseqSourceFiles(pagesDirectory)) {
    const result = await LogseqParser.Parse(sourceFile);

    if (result.page !== null) {
      pages.push(result.page);
    }

    errors.push(...result.errors);
  }

  return {
    pages,
    errors
  };
}
