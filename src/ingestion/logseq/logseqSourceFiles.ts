import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

import type { ContentSourceFile } from "../../domain/content/index.ts";

export async function* ReadLogseqSourceFiles(
  pagesDirectory: string
): AsyncGenerator<ContentSourceFile> {
  const filenames = await readdir(pagesDirectory);

  for (const filename of filenames.toSorted()) {
    if (!filename.endsWith(".md")) {
      continue;
    }

    const path = join(pagesDirectory, filename);

    yield {
      path,
      ReadContent: () => readFile(path, "utf-8")
    };
  }
}
