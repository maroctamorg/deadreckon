export interface LogseqBullet {
  content: string;
  line: number;
  children: LogseqBullet[];
}

interface BulletStackEntry {
  level: number;
  bullet: LogseqBullet;
}

export function ParseLogseqBullets(content: string): LogseqBullet[] {
  const roots: LogseqBullet[] = [];
  const stack: BulletStackEntry[] = [];
  const lines = content.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (line.trim().length === 0) {
      return;
    }

    const bullet = ParseLogseqBulletLine(line, index + 1);

    if (bullet === null) {
      return;
    }

    while (stack.length > 0 && stack[stack.length - 1].level >= bullet.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      roots.push(bullet.bullet);
    } else {
      stack[stack.length - 1].bullet.children.push(bullet.bullet);
    }

    stack.push(bullet);
  });

  return roots;
}

function ParseLogseqBulletLine(
  line: string,
  lineNumber: number
): BulletStackEntry | null {
  const match = line.match(/^(\s*)-\s?(.*)$/);

  if (match === null) {
    return null;
  }

  return {
    level: GetIndentLevel(match[1]),
    bullet: {
      content: match[2].trim(),
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

  return level + Math.floor(spaces / 2);
}
