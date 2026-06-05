import { PAGES_DIRECTORY } from "../config/constants.ts";
import { BuildContentGraph } from "../src/domain/content/graphBuilder.ts";
import { ParseLogseqContent } from "../src/ingestion/logseq/parseLogseqContent.ts";

const summary = await ParseLogseqContent(PAGES_DIRECTORY);

if (summary.errors.length > 0) {
  for (const error of summary.errors) {
    const location =
      error.location === undefined
        ? ""
        : `:${error.location.line}${error.location.column === undefined ? "" : `:${error.location.column}`}`;
    const context = error.context === undefined ? "" : ` (${error.context})`;

    console.warn(`${error.sourcePath}${location}: ${error.message}${context}`);
  }
}

const graphResult = BuildContentGraph(summary.pages);

for (const warning of graphResult.warnings) {
  console.warn(warning.message);
}

if (graphResult.graph === null) {
  process.exitCode = 1;
} else {
  const homePages = graphResult.graph.home === null ? 0 : 1;
  const topics = graphResult.graph.topics.length;
  const problems = graphResult.graph.problems.length;
  const links = graphResult.graph.links.length;

  console.log(
    `Parsed ${summary.pages.length} pages: ${homePages} home, ${topics} topics, ${problems} problems, ${links} links.`
  );
}
