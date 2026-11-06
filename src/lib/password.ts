export const SETS = {
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lower: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()-_=+[]{};:,.?/~",
};
export const AMBIGUOUS = /[O0oIl1|`'"]/g;

export type PasswordOptions = {
  length: number;
  upper: boolean;
  lower: boolean;
  numbers: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

/** Unbiased random integer in [0, max) using crypto.getRandomValues with rejection sampling. */
function randomInt(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  const buf = new Uint32Array(1);
  for (;;) {
    crypto.getRandomValues(buf);
    if (buf[0]! < limit) return buf[0]! % max;
  }
}

export function activeSets(o: PasswordOptions): string[] {
  return (["upper", "lower", "numbers", "symbols"] as const)
    .filter((k) => o[k])
    .map((k) => (o.excludeAmbiguous ? SETS[k].replace(AMBIGUOUS, "") : SETS[k]));
}

/** Generates a password guaranteed to contain at least one character from each selected set. */
export function generatePassword(o: PasswordOptions): string {
  const sets = activeSets(o);
  if (sets.length === 0) throw new Error("Choose at least one character type.");
  const length = Math.min(128, Math.max(sets.length, Math.floor(o.length)));
  const pool = sets.join("");
  const chars = sets.map((s) => s[randomInt(s.length)]!);
  while (chars.length < length) chars.push(pool[randomInt(pool.length)]!);
  for (let i = chars.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

/** Entropy in bits for a random password of this length drawn from the given pool size. */
export function entropyBits(length: number, poolSize: number): number {
  if (length <= 0 || poolSize <= 1) return 0;
  return length * Math.log2(poolSize);
}

export function strengthLabel(bits: number): { label: string; level: 0 | 1 | 2 | 3 } {
  if (bits < 40) return { label: "Weak", level: 0 };
  if (bits < 60) return { label: "Fair", level: 1 };
  if (bits < 80) return { label: "Strong", level: 2 };
  return { label: "Very strong", level: 3 };
}
