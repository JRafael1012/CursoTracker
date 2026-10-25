import { PrismaClient } from "@prisma/client";

const BASE = process.env.HEALTH_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) console.log(`[OK]   ${name}${detail ? ` — ${detail}` : ""}`);
  else {
    failed++;
    console.log(`[FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

try {
  const res = await fetch(`${BASE}/login`, { redirect: "manual" });
  check("HTTP /login", res.status === 200, `status=${res.status} url=${BASE}/login`);
} catch (e) {
  check("HTTP /login", false, e.message);
}

try {
  await prisma.$queryRaw`SELECT 1`;
  check("MySQL SELECT 1", true);
} catch (e) {
  check("MySQL SELECT 1", false, e.message);
}

await prisma.$disconnect();
console.log(failed === 0 ? "\nHEALTH OK" : `\nHEALTH CON ${failed} FALLOS`);
process.exitCode = failed === 0 ? 0 : 1;
