const LOGSEQ_REFERENCE_PATTERN = /^\[\[(.+)\]\]$/;

export function ExtractLogseqReference(content: string): string | null {
  const match = content.match(LOGSEQ_REFERENCE_PATTERN);

  if (match === null) {
    return null;
  }

  return match[1].trim();
}
