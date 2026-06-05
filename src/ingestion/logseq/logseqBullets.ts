export interface LogseqBullet {
  content: string;
  line: number;
  children: LogseqBullet[];
}

interface BulletStackEntry {
  level: number;
  bullet: LogseqBullet;
}

const LOGSEQ_SPACE_INDENT_WIDTH = 2;

export function ParseLogseqBullets(content: string): LogseqBullet[] {
  const roots: LogseqBullet[] = [];
  const stack: BulletStackEntry[] = [];
  const lines = content.split(/\r?\n/);
  let current: LogseqBullet | null = null;
  let currentLevel: number | null = null;

  const flush = (entry: BulletStackEntry) => {
    while (stack.length > 0 && stack[stack.length - 1].level >= entry.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(entry.bullet);
    } else {
      stack[stack.length - 1].bullet.children.push(entry.bullet);
    }

    stack.push(entry);
  };

  for (let i = 0; i < lines.length; i++) {
    const parsed = ParseLogseqBulletLine(lines[i], i + 1);

    // new bullet
    if (parsed) {
      flush(parsed);
      current = parsed.bullet;
      currentLevel = parsed.level;

      continue;
    }

    // multiline continuation (only if we already have a bullet)
    if (current) {
      const trimmed = lines[i].trimEnd();
      if (trimmed.length === 0) continue;

      current.content += "\n" + trimmed;
    }
  }
  return roots;
}

function ParseLogseqBulletLine(
  line: string,
  lineNumber: number
): BulletStackEntry | null {
  const match = line.match(/^(\s*)-\s?(.*)$/);
  if (!match) return null;

  return {
    level: GetIndentLevel(match[1]),
    bullet: {
      content: match[2],
      line: lineNumber,
      children: []
    }
  };
}

function GetIndentLevel(indent: string): number {
  let level = 0;
  let spaces = 0;

  for (const character of indent) {
    if (character === "\t") {
      level += 1;
      spaces = 0;
      continue;
    }

    if (character === " ") {
      spaces += 1;
    }
  }

  return level + Math.floor(spaces / LOGSEQ_SPACE_INDENT_WIDTH);
}
