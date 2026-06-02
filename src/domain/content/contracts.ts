import type { ContentPage } from "./models.ts";

export interface ContentSourceFile {
  path: string;
  ReadContent(): Promise<string>;
}

export interface ContentSourceLocation {
  line: number;
  column?: number;
}

export interface ContentParseError {
  sourcePath: string;
  location?: ContentSourceLocation;
  context?: string;
  message: string;
}

export interface ContentPageParseResult {
  page: ContentPage | null;
  errors: ContentParseError[];
}

export interface ContentParser {
  Parse(sourceFile: ContentSourceFile): Promise<ContentPageParseResult>;
}
