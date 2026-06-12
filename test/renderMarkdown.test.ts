import assert from "node:assert/strict";
import test from "node:test";

import { ExtractMarkdownPreviewText, RenderMarkdownHtml } from "../src/generation/renderMarkdown.ts";

test("renders inline math", async () => {
  const html = await RenderMarkdownHtml("Inline math: $a^2 + b^2 = c^2$.");

  assert.match(html, /katex/);
  assert.match(html, /a\^2 \+ b\^2 = c\^2/);
  assert.doesNotMatch(html, /\$a\^2 \+ b\^2 = c\^2\$/);
});

test("renders display math", async () => {
  const html = await RenderMarkdownHtml(["$$", "\\int_0^1 x^2 \\, dx", "$$"].join("\n"));

  assert.match(html, /katex-display/);
  assert.match(html, /\\int_0\^1 x\^2/);
  assert.doesNotMatch(html, /\$\$/);
});

test("renders fenced code blocks", async () => {
  const html = await RenderMarkdownHtml(["```ts", "const answer = 42", "```"].join("\n"));

  assert.match(html, /data-rehype-pretty-code-figure/);
  assert.match(html, /data-language="ts"/);
  assert.match(html, /<span data-line="">/);
});

test("renders internal topic links", async () => {
  const html = await RenderMarkdownHtml("See [[Topology]] for context.");

  assert.match(html, /href="\/topics\/topology\//);
  assert.match(html, />Topology<\/a>/);
});

test("extracts preview text from markdown", () => {
  const preview = ExtractMarkdownPreviewText("See [[Topology]] with $a^2$ and **bold** text.");

  assert.equal(preview, "See Topology with a^2 and bold text.");
});