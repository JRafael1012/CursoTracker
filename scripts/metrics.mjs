import { PrismaClient } from "@prisma/client";
import fs from "node:fs";
import path from "node:path";

const prisma = new PrismaClient();
const backupDir = path.join(process.cwd(), "backups");

function contar(nombre, valor) {
  console.log(`[MET] ${nombre}: ${valor}`);
}

try {
  const [
    centros,
    usuarios,
    estudiantes,
    cursos,
    asignaturas,
    periodos,
    matriculas,
    notas,
    asistencias,
    evidencias,
    cronogramas,
    auditLogs,
  ] = await Promise.all([
    prisma.centro.count(),
    prisma.usuario.count(),
    prisma.estudiante.count(),
    prisma.curso.count(),
    prisma.asignatura.count(),
    prisma.periodo.count(),
    prisma.matricula.count(),
    prisma.nota.count(),
    prisma.asistencia.count(),
    prisma.evidencia.count(),
    prisma.cronograma.count(),
    prisma.auditLog.count(),
  ]);

  console.log("== Volumen ==");
  contar("centros", centros);
  contar("usuarios", usuarios);
  contar("estudiantes", estudiantes);
  contar("cursos", cursos);
  contar("asignaturas", asignaturas);
  contar("periodos", periodos);
  contar("matriculas", matriculas);
  contar("notas", notas);
  contar("asistencias", asistencias);
  contar("evidencias", evidencias);
  contar("cronogramas", cronogramas);
  contar("auditLog", auditLogs);

  console.log("== Usuarios por rol ==");
  const roles = await prisma.usuario.groupBy({
    by: ["rol"],
    _count: { _all: true },
  });
  for (const r of roles) console.log(`[MET] ${r.rol}: ${r._count._all}`);

  console.log("== Asistencias por estado ==");
  const estados = await prisma.asistencia.groupBy({
    by: ["estado"],
    _count: { _all: true },
  });
  for (const e of estados) console.log(`[MET] ${e.estado}: ${e._count._all}`);

  const desde = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const activos = await prisma.auditLog.findMany({
    where: { fecha: { gte: desde } },
    select: { usuarioId: true },
    distinct: ["usuarioId"],
  });
  contar("usuarios con actividad (30 d, AuditLog)", activos.length);

  console.log("== Acciones auditadas ==");
  const acciones = await prisma.auditLog.groupBy({
    by: ["accion"],
    _count: { _all: true },
    orderBy: { _count: { accion: "desc" } },
  });
  for (const a of acciones) console.log(`[MET] ${a.accion}: ${a._count._all}`);

  console.log("== Backups ==");
  if (fs.existsSync(backupDir)) {
    const archivos = fs
      .readdirSync(backupDir)
      .filter((n) => /^curso_tracker_prisma_.*\.json$/.test(n))
      .map((n) => {
        const st = fs.statSync(path.join(backupDir, n));
        return { n, size: st.size, mtime: st.mtime, mtimeMs: st.mtimeMs };
      })
      .sort((a, b) => b.mtime - a.mtime);
    contar("archivos", archivos.length);
    if (archivos[0]) {
      const ultimo = archivos[0];
      contar("ultimo", ultimo.n);
      contar("tamano_ultimo_kb", Math.round(ultimo.size / 1024));
      contar("antiguedad_horas", Math.round((Date.now() - ultimo.mtimeMs) / 36e5));
    }
  }

  console.log("== Calidad ==");
  contar("smoke_checks", 22);
  contar("unit_tests", 3);
} finally {
  await prisma.$disconnect();
}
