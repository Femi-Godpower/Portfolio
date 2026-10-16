type Token = { word: string; accent: boolean; space: boolean };

/** Words with their accent flag, keeping only the spaces the text had ("*next*?" stays "next?"). */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const part of text.split(/(\*[^*]+\*)/)) {
    const accent = /^\*[^*]+\*$/.test(part);
    const plain = part.replace(/\*/g, "");
    const last = tokens.at(-1);
    if (last && /^\s/.test(plain)) last.space = true;
    for (const [, word = "", gap = ""] of plain.matchAll(/(\S+)(\s*)/g)) {
      tokens.push({ word, accent, space: gap.length > 0 });
    }
  }
  return tokens;
}
