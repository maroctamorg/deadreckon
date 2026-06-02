import { join } from "node:path";

import { ParseLogseqContent } from "../src/ingestion/logseq/parseLogseqContent.ts";

const PAGES_DIRECTORY = join(import.meta.dirname, "..", "content", "logseq", "pages");

const summary = await ParseLogseqContent(PAGES_DIRECTORY);

if (summary.errors.length > 0) {
  for (const error of summary.errors) {
    const location =
      error.location === undefined
        ? ""
        : `:${error.location.line}${error.location.column === undefined ? "" : `:${error.location.column}`}`;
    const context = error.context === undefined ? "" : ` (${error.context})`;

    console.error(`${error.sourcePath}${location}: ${error.message}${context}`);
  }

  process.exitCode = 1;
} else {
  const homePages = summary.pages.filter((page) => page.kind === "home").length;
  const topics = summary.pages.filter((page) => page.kind === "topic").length;
  const problems = summary.pages.filter((page) => page.kind === "problem").length;

  console.log(
    `Parsed ${summary.pages.length} pages: ${homePages} home, ${topics} topics, ${problems} problems.`
  );
}
