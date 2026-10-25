import { PrismaClient } from "@prisma/client";
import { readFileSync } from "node:fs";

const file = process.argv[2];
const url = process.env.RESTORE_DATABASE_URL;

if (!file) {
  console.error("Uso: node scripts/restore-prisma.mjs <backup.json>");
  process.exit(1);
}
if (!url) {
  console.error("Falta RESTORE_DATABASE_URL");
  process.exit(1);
}
if (url === process.env.DATABASE_URL || !/_test(\?|$)/.test(url)) {
  console.error("RESTORE_DATABASE_URL debe apuntar a una BD de prueba (*_test)");
  process.exit(1);
}

const backup = JSON.parse(readFileSync(file, "utf8"));

const orden = [
  "centro",
  "usuario",
  "estudiante",
  "periodo",
  "curso",
  "asignatura",
  "cursoAsignaturaDocente",
  "nota",
  "asistencia",
  "auditLog",
];

const prisma = new PrismaClient({ datasourceUrl: url });
let failed = 0;

async function main() {
  for (const tabla of orden) {
    const filas = backup[tabla] ?? [];
    const res = await prisma[tabla].createMany({ data: filas });
    const total = await prisma[tabla].count();
    const ok = res.count === filas.length && total === filas.length;
    if (!ok) failed++;
    console.log(`[${ok ? "OK" : "FAIL"}] ${tabla}: backup=${filas.length} insertados=${res.count} en_bd=${total}`);
  }

  const totalBackup = orden.reduce((n, t) => n + (backup[t]?.length ?? 0), 0);
  console.log(`\nTotal filas restauradas: ${totalBackup}`);
  console.log(failed === 0 ? "RESTAURACION OK" : `RESTAURACION CON ${failed} FALLOS`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main()
  .catch((e) => {
    console.error("[ERR]", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
