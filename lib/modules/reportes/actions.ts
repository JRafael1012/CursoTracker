import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";
import { logAudit } from "@/lib/modules/audit";
import { getConfigCalificacion } from "@/lib/modules/config";
import { boletinToExcel, sabanaToExcel, estadisticasToExcel } from "./excel";
import { boletinToPdf, sabanaToPdf, estadisticasToPdf } from "./pdf";

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function stamp() {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function fileRes(buf: Buffer | Uint8Array, mime: string, base: string, ext: string) {
  const bytes = new Uint8Array(buf);
  return new NextResponse(bytes, {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `attachment; filename="${base}-${stamp()}.${ext}"`,
    },
  });
}

async function centroNombre(centroId: string) {
  const c = await prisma.centro.findUnique({ where: { id: centroId }, select: { nombre: true } });
  return c?.nombre ?? "Centro";
}

export async function handleBoletinExcel(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE", "PADRE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  let estId = searchParams.get("estudianteId") ?? "";

  if (user.rol === "ESTUDIANTE") {
    const est = await prisma.estudiante.findFirst({
      where: { usuarioId: user.id, centroId },
      select: { id: true },
    });
    if (!est) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    estId = est.id;
  } else if (user.rol === "PADRE") {
    const hijos = await prisma.estudiantePadre.findMany({
      where: { padreId: user.id, estudiante: { centroId } },
      select: { estudianteId: true },
    });
    const permitidos = new Set(hijos.map((h) => h.estudianteId));
    if (!estId || !permitidos.has(estId)) {
      return NextResponse.json({ error: "Sin acceso al estudiante solicitado" }, { status: 403 });
    }
  }

  const buf = await boletinToExcel(centroId, estId, searchParams.get("periodoId") ?? "");
  if (!buf) return NextResponse.json({ error: "Datos no encontrados" }, { status: 404 });

  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Boletin", descripcion: "Boletín Excel" });
  return fileRes(buf, XLSX_MIME, "boletin", "xlsx");
}

export async function handleBoletinPdf(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE", "PADRE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  let estId = searchParams.get("estudianteId") ?? "";

  if (user.rol === "ESTUDIANTE") {
    const est = await prisma.estudiante.findFirst({
      where: { usuarioId: user.id, centroId },
      select: { id: true },
    });
    if (!est) return NextResponse.json({ error: "Sin acceso" }, { status: 403 });
    estId = est.id;
  } else if (user.rol === "PADRE") {
    const hijos = await prisma.estudiantePadre.findMany({
      where: { padreId: user.id, estudiante: { centroId } },
      select: { estudianteId: true },
    });
    const permitidos = new Set(hijos.map((h) => h.estudianteId));
    if (!estId || !permitidos.has(estId)) {
      return NextResponse.json({ error: "Sin acceso al estudiante solicitado" }, { status: 403 });
    }
  }

  const centro = await centroNombre(centroId);
  const buf = await boletinToPdf(centroId, estId, searchParams.get("periodoId") ?? "", centro);
  if (!buf) return NextResponse.json({ error: "Datos no encontrados" }, { status: 404 });

  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Boletin", descripcion: "Boletín PDF" });
  return fileRes(buf, "application/pdf", "boletin", "pdf");
}

export async function handleSabanaExcel(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  const buf = await sabanaToExcel(centroId, searchParams.get("cursoId") ?? "", searchParams.get("periodoId") ?? "");
  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Sabana", descripcion: "Sábana Excel" });
  return fileRes(buf, XLSX_MIME, "sabana", "xlsx");
}

export async function handleSabanaPdf(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  const cursoId = searchParams.get("cursoId") ?? "";
  const periodoId = searchParams.get("periodoId") ?? "";
  const [centro, curso, periodo] = await Promise.all([
    centroNombre(centroId),
    prisma.curso.findFirst({ where: { id: cursoId, centroId }, select: { nombre: true } }),
    prisma.periodo.findFirst({ where: { id: periodoId, centroId }, select: { nombre: true } }),
  ]);

  const buf = await sabanaToPdf(centroId, cursoId, periodoId, centro, curso?.nombre ?? "Curso", periodo?.nombre ?? "Período");
  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Sabana", descripcion: "Sábana PDF" });
  return fileRes(buf, "application/pdf", "sabana", "pdf");
}

export async function handleEstadisticasExcel(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  const config = await getConfigCalificacion(centroId);
  const buf = await estadisticasToExcel(centroId, searchParams.get("cursoId") ?? "", searchParams.get("periodoId") ?? "", config.notaAprobatoria);
  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Estadisticas", descripcion: "Estadísticas Excel" });
  return fileRes(buf, XLSX_MIME, "estadisticas", "xlsx");
}

export async function handleEstadisticasPdf(searchParams: URLSearchParams) {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE");
  const centroId = user.centroId;
  if (!centroId) return NextResponse.json({ error: "Sin centro" }, { status: 400 });

  const cursoId = searchParams.get("cursoId") ?? "";
  const periodoId = searchParams.get("periodoId") ?? "";
  const config = await getConfigCalificacion(centroId);
  const [centro, curso, periodo] = await Promise.all([
    centroNombre(centroId),
    prisma.curso.findFirst({ where: { id: cursoId, centroId }, select: { nombre: true } }),
    prisma.periodo.findFirst({ where: { id: periodoId, centroId }, select: { nombre: true } }),
  ]);

  const buf = await estadisticasToPdf(centroId, cursoId, periodoId, config.notaAprobatoria, centro, curso?.nombre ?? "Curso", periodo?.nombre ?? "Período");
  await logAudit({ centroId, usuarioId: user.id, accion: "EXPORT", entidad: "Estadisticas", descripcion: "Estadísticas PDF" });
  return fileRes(buf, "application/pdf", "estadisticas", "pdf");
}
