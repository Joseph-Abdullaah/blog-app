import { prisma } from "@/lib/prisma"
const RESERVED = new Set(["admin", "administrator", "support"]);

export async function generateUniqueUsername(email: string) {
  const base =
    email.split("@")[0]
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")   // any run of other characters becomes one "_"
      .replace(/^_+|_+$/g, "")       // trim "_" from both ends
      .slice(0, 24) || "user";

  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? base : `${base}_${Math.floor(1000 + Math.random() * 9000)}`;
    if (candidate.length < 3 || RESERVED.has(candidate)) continue;
    const taken = await prisma.user.findUnique({ where: { username: candidate }, select: { id: true } });
    if (!taken) return candidate;
  }
  return `user_${crypto.randomUUID().replace(/-/g, "").slice(0, 10)}`;
}