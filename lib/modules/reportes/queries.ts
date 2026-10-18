import { prisma } from "@/lib/db";

export type BoletinRow = {
  asignatura: string;
  docente: string;
  corte: string;
  valor: number;
};

export type BoletinData = {
  estudiante: string;
  curso: string;
  periodo: string;
  promedioGeneral: number | null;
  filas: BoletinRow[];
};

export async function getBoletin(
  centroId: string,
  estudianteId: string,
  periodoId: string,
): Promise<BoletinData | null> {
  const estudiante = await prisma.estudiante.findFirst({
    where: { id: estudianteId, centroId },
    select: {
      usuario: { select: { nombre: true, apellido: true } },
      matriculas: {
        where: { periodoId },
        select: { curso: { select: { nombre: true } } },
      },
    },
  });
  if (!estudiante) return null;

  const periodo = await prisma.periodo.findFirst({
    where: { id: periodoId, centroId },
    select: { nombre: true },
  });
  if (!periodo) return null;

  const notas = await prisma.nota.findMany({
    where: { centroId, estudianteId, periodoId },
    include: {
      cursoAsignatura: {
        include: {
          asignatura: { select: { nombre: true } },
          docente: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: [{ corte: "asc" }],
  });

  const filas: BoletinRow[] = notas.map((n) => ({
    asignatura: n.cursoAsignatura.asignatura.nombre,
    docente: `${n.cursoAsignatura.docente.nombre} ${n.cursoAsignatura.docente.apellido}`,
    corte: n.corte,
    valor: Number(n.valor),
  }));

  const promedioGeneral =
    filas.length > 0
      ? Math.round((filas.reduce((s, f) => s + f.valor, 0) / filas.length) * 100) / 100
      : null;

  return {
    estudiante: `${estudiante.usuario.nombre} ${estudiante.usuario.apellido}`,
    curso: estudiante.matriculas[0]?.curso.nombre ?? "—",
    periodo: periodo.nombre,
    promedioGeneral,
    filas,
  };
}

export type SabanaRow = {
  estudiante: string;
  asignatura: string;
  docente: string;
  corte: string;
  valor: number;
};

export async function getSabana(
  centroId: string,
  cursoId: string,
  periodoId: string,
): Promise<SabanaRow[]> {
  const notas = await prisma.nota.findMany({
    where: {
      centroId,
      periodoId,
      cursoAsignatura: { cursoId },
    },
    include: {
      estudiante: { select: { usuario: { select: { nombre: true, apellido: true } } } },
      cursoAsignatura: {
        include: {
          asignatura: { select: { nombre: true } },
          docente: { select: { nombre: true, apellido: true } },
        },
      },
    },
    orderBy: [
      { estudiante: { usuario: { apellido: "asc" } } },
      { corte: "asc" },
    ],
  });

  return notas.map((n) => ({
    estudiante: `${n.estudiante.usuario.nombre} ${n.estudiante.usuario.apellido}`,
    asignatura: n.cursoAsignatura.asignatura.nombre,
    docente: `${n.cursoAsignatura.docente.nombre} ${n.cursoAsignatura.docente.apellido}`,
    corte: n.corte,
    valor: Number(n.valor),
  }));
}

export type EstadisticaRow = {
  asignatura: string;
  corte: string;
  total: number;
  promedio: number;
  aprobados: number;
  suspensos: number;
};

export async function getEstadisticas(
  centroId: string,
  cursoId: string,
  periodoId: string,
  notaAprobatoria: number,
): Promise<EstadisticaRow[]> {
  const notas = await prisma.nota.findMany({
    where: {
      centroId,
      periodoId,
      cursoAsignatura: { cursoId },
    },
    include: {
      cursoAsignatura: { include: { asignatura: { select: { nombre: true } } } },
    },
  });

  const grupos = new Map<string, { total: number; suma: number; aprobados: number }>();
  for (const n of notas) {
    const key = `${n.cursoAsignatura.asignatura.nombre}|${n.corte}`;
    const g = grupos.get(key) ?? { total: 0, suma: 0, aprobados: 0 };
    g.total += 1;
    g.suma += Number(n.valor);
    if (Number(n.valor) >= notaAprobatoria) g.aprobados += 1;
    grupos.set(key, g);
  }

  return [...grupos.entries()]
    .map(([key, g]) => {
      const [asignatura, corte] = key.split("|");
      return {
        asignatura,
        corte,
        total: g.total,
        promedio: Math.round((g.suma / g.total) * 100) / 100,
        aprobados: g.aprobados,
        suspensos: g.total - g.aprobados,
      };
    })
    .sort((a, b) => a.asignatura.localeCompare(b.asignatura) || a.corte.localeCompare(b.corte));
}
