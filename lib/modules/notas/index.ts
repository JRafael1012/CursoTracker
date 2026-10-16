import { prisma } from "@/lib/db";

export type ClaseOption = {
  id: string;
  cursoId: string;
  docenteId: string;
  label: string;
};

export type Alumno = {
  estudianteId: string;
  nombre: string;
};

export async function listClases(
  centroId: string,
  soloDocenteId?: string,
): Promise<ClaseOption[]> {
  const clases = await prisma.cursoAsignaturaDocente.findMany({
    where: {
      curso: { centroId },
      asignatura: { centroId },
      ...(soloDocenteId ? { docenteId: soloDocenteId } : {}),
    },
    include: {
      curso: { select: { nombre: true } },
      asignatura: { select: { nombre: true } },
      docente: { select: { nombre: true, apellido: true } },
    },
  });

  return clases
    .map((c) => ({
      id: c.id,
      cursoId: c.cursoId,
      docenteId: c.docenteId,
      label: `${c.curso.nombre} · ${c.asignatura.nombre} · ${c.docente.nombre} ${c.docente.apellido}`,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function listMatriculados(
  centroId: string,
  cursoId: string,
  periodoId: string,
): Promise<Alumno[]> {
  const matriculas = await prisma.matricula.findMany({
    where: { centroId, cursoId, periodoId },
    include: {
      estudiante: {
        select: { id: true, usuario: { select: { nombre: true, apellido: true } } },
      },
    },
  });

  return matriculas
    .map((m) => ({
      estudianteId: m.estudiante.id,
      nombre: `${m.estudiante.usuario.nombre} ${m.estudiante.usuario.apellido}`,
    }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre));
}

export async function listNotas(
  centroId: string,
  claseId: string,
  periodoId: string,
  corte: string,
): Promise<Record<string, string>> {
  const notas = await prisma.nota.findMany({
    where: {
      centroId,
      cursoAsignaturaDocenteId: claseId,
      periodoId,
      corte,
    },
    select: { estudianteId: true, valor: true },
  });

  const map: Record<string, string> = {};
  for (const n of notas) map[n.estudianteId] = n.valor.toString();
  return map;
}
