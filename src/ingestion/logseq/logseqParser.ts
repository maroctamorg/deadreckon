import { basename, extname } from "node:path";

import type {
  ContentPageParseResult,
  ContentPageTypeTag,
  ContentParser,
  ContentParseError,
  ContentImage,
  ContentReference,
  ContentSection,
  ContentSourceFile,
  Problem
} from "../../domain/content/index.ts";

import type { LogseqBullet } from "./logseqBullets.ts";
import { ParseLogseqBullets } from "./logseqBullets.ts";
import { ExtractLogseqReference } from "./logseqReferences.ts";

const PAGE_TYPE_TAGS: readonly ContentPageTypeTag[] = [
  "[[home]]",
  "[[topic]]",
  "[[problem]]"
];

export const LogseqParser: ContentParser = {
  async Parse(sourceFile: ContentSourceFile): Promise<ContentPageParseResult> {
    const content = await sourceFile.ReadContent();
    const bullets = ParseLogseqBullets(content);

    if (!HasMeaningfulContent(bullets)) {
      return { page: null, errors: [] };
    }

    const errors = ValidatePageType(sourceFile.path, bullets);

    if (errors.length > 0) {
      return { page: null, errors };
    }

    const pageTypeTag = bullets[0].content as ContentPageTypeTag;
    const contentBullets = bullets.slice(1);
    const title = GetTitleFromPath(sourceFile.path);

    if (pageTypeTag === "[[home]]") {
      return ParseHomePage(sourceFile.path, title, contentBullets);
    }

    if (pageTypeTag === "[[topic]]") {
      return ParseTopic(sourceFile.path, title, contentBullets);
    }

    return ParseProblem(sourceFile.path, title, contentBullets);
  }
};

function ValidatePageType(sourcePath: string, bullets: LogseqBullet[]) {
  if (bullets.length === 0) {
    return [
      {
        sourcePath,
        message: "Expected the first top-level bullet to be a page type tag."
      }
    ];
  }

  const firstBullet = bullets[0];

  if (!PAGE_TYPE_TAGS.includes(firstBullet.content as ContentPageTypeTag)) {
    return [
      {
        sourcePath,
        location: { line: firstBullet.line },
        context: firstBullet.content,
        message:
          "Expected first top-level bullet to be one of [[home]], [[topic]], or [[problem]]."
      }
    ];
  }

  return [];
}

function HasMeaningfulContent(bullets: LogseqBullet[]): boolean {
  return bullets.some(
    (bullet) => bullet.content.length > 0 || HasMeaningfulContent(bullet.children)
  );
}

function ParseHomePage(
  sourcePath: string,
  title: string,
  bullets: LogseqBullet[]
): ContentPageParseResult {
  const sections = GetSectionsByTitle(bullets);
  const hero = sections.get("hero");
  const topicReferences = ParseReferenceList(sourcePath, sections.get("topics"));

  return {
    errors: topicReferences.errors,
    page: {
      kind: "home",
      id: NormalizeContentId(title),
      title,
      hero: {
        title: hero?.children[0]?.content ?? title,
        summary: hero?.children[1]?.content ?? ""
      },
      topicReferences: topicReferences.references
    }
  };
}

function ParseTopic(
  sourcePath: string,
  title: string,
  bullets: LogseqBullet[]
): ContentPageParseResult {
  const sections = GetSectionsByTitle(bullets);
  const image = ParseImage(sections.get("image"));
  const dependencies = ParseReferenceList(sourcePath, sections.get("dependencies"));
  const problemReferences = ParseReferenceList(sourcePath, sections.get("problems"));

  return {
    errors: [...dependencies.errors, ...problemReferences.errors],
    page: {
      kind: "topic",
      id: NormalizeContentId(title),
      title,
      image,
      dependencies: dependencies.references,
      overview: ParseSection(sections.get("overview")),
      problemReferences: problemReferences.references,
      references: ParseSection(sections.get("references")),
      summary: ParseSection(sections.get("summary and key ideas"))
    }
  };
}

function ParseProblem(
  sourcePath: string,
  title: string,
  bullets: LogseqBullet[]
): ContentPageParseResult {
  const sections = GetSectionsByTitle(bullets);
  const statement = ParseSection(sections.get("statement"));
  const topicReferences = ParseReferenceList(sourcePath, sections.get("topic"));

  if (statement === null) {
    return {
      page: null,
      errors: [
        {
          sourcePath,
          message: "Problem pages must define a statement section."
        }
      ]
    };
  }

  const problem: Problem = {
    kind: "problem",
    id: NormalizeContentId(title),
    title,
    topicReferences: topicReferences.references,
    statement,
    hints: ParseSection(sections.get("hints")),
    sketch: ParseSection(sections.get("sketch")),
    modelSolution: ParseSection(sections.get("model solution")),
    summary: ParseSection(sections.get("summary and key ideas"))
  };

  return { page: problem, errors: topicReferences.errors };
}

function GetSectionsByTitle(bullets: LogseqBullet[]): Map<string, LogseqBullet> {
  return new Map(bullets.map((bullet) => [NormalizeSectionTitle(bullet.content), bullet]));
}

interface ReferenceListParseResult {
  references: ContentReference[] | null;
  errors: ContentParseError[];
}

function ParseReferenceList(
  sourcePath: string,
  section: LogseqBullet | undefined
): ReferenceListParseResult {
  if (section === undefined || section.children.length === 0) {
    return { references: null, errors: [] };
  }

  const references: ContentReference[] = [];
  const errors: ContentParseError[] = [];

  for (const child of section.children) {
    const reference = ExtractLogseqReference(child.content);

    if (reference === null) {
      errors.push({
        sourcePath,
        location: { line: child.line },
        context: child.content,
        message: `"${section.content}" entries must be Logseq page links.`
      });
      continue;
    }

    references.push({ title: reference });
  }

  if (references.length === 0) {
    return { references: null, errors };
  }

  return { references, errors };
}

function ParseSection(section: LogseqBullet | undefined): ContentSection | null {
  if (section === undefined || section.children.length === 0) {
    return null;
  }

  return {
    title: section.content,
    content: section.children.map(RenderBulletContent).join("\n")
  };
}

function RenderBulletContent(bullet: LogseqBullet): string {
  if (bullet.children.length === 0) {
    return bullet.content;
  }

  const childContent = bullet.children
    .map((child) => RenderNestedBulletContent(child, 1))
    .join("\n");

  return `${bullet.content}\n${childContent}`;
}

function RenderNestedBulletContent(bullet: LogseqBullet, depth: number): string {
  const indent = "  ".repeat(depth);
  const content = `${indent}- ${bullet.content}`;

  if (bullet.children.length === 0) {
    return content;
  }

  return [
    content,
    ...bullet.children.map((child) => RenderNestedBulletContent(child, depth + 1))
  ].join("\n");
}

function NormalizeSectionTitle(title: string): string {
  return title.trim().toLowerCase();
}

function NormalizeContentId(title: string): string {
  return title.trim().toLowerCase();
}

function GetTitleFromPath(path: string): string {
  return ToDisplayTitle(basename(path, extname(path)));
}

function ParseImage(section: LogseqBullet | undefined): ContentImage | null {
  if (section === undefined || section.children.length === 0) {
    return null;
  }

  for (const child of section.children) {
    const image = ParseImageContent(child.content);

    if (image !== null) {
      return image;
    }
  }

  return null;
}

function ParseImageContent(content: string): ContentImage | null {
  const trimmed = content.trim();

  if (trimmed.length === 0) {
    return null;
  }

  const markdownImageMatch = trimmed.match(/^!\[([^\]]*)\]\((.+)\)$/);

  if (markdownImageMatch !== null) {
    return {
      src: markdownImageMatch[2].trim(),
      alt: markdownImageMatch[1].trim().length > 0 ? markdownImageMatch[1].trim() : null
    };
  }

  const logseqImageMatch = trimmed.match(/^!\[\[(.+)\]\]$/);

  if (logseqImageMatch !== null) {
    return {
      src: logseqImageMatch[1].trim(),
      alt: null
    };
  }

  if (LooksLikeImageSource(trimmed)) {
    return {
      src: trimmed,
      alt: null
    };
  }

  return null;
}

function LooksLikeImageSource(value: string): boolean {
  return /^(https?:\/\/|\/|\.\.?\/)/i.test(value) || /\.(png|jpe?g|webp|gif|svg)(\?.*)?$/i.test(value);
}

function ToDisplayTitle(value: string): string {
  return value
    .split(/\s+/)
    .map((part) => {
      if (part.length === 0) {
        return part;
      }

      return `${part[0].toUpperCase()}${part.slice(1).toLowerCase()}`;
    })
    .join(" ");
}
