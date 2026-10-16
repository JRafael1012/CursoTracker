import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const mode = process.argv[2] ?? "seed";

const CURSO = "ZZTest-M5b";
const ASIG = "ZZTest-M5b-Asig";
const CORTE = "Corte 1";

async function centro() {
  const c = await prisma.centro.findFirst({ where: { nombre: "Academia Demo" } });
  if (!c) throw new Error("Centro 'Academia Demo' no encontrado");
  return c;
}

async function clean() {
  const c = await centro();
  const curso = await prisma.curso.findFirst({
    where: { centroId: c.id, nombre: CURSO },
  });
  const asig = await prisma.asignatura.findFirst({
    where: { centroId: c.id, nombre: ASIG },
  });
  if (curso) {
    const clases = await prisma.cursoAsignaturaDocente.findMany({
      where: { cursoId: curso.id },
    });
    for (const cl of clases) {
      await prisma.nota.deleteMany({ where: { cursoAsignaturaDocenteId: cl.id } });
    }
    await prisma.matricula.deleteMany({ where: { cursoId: curso.id } });
    await prisma.cursoAsignaturaDocente.deleteMany({ where: { cursoId: curso.id } });
  }
  if (asig) {
    await prisma.cursoAsignaturaDocente.deleteMany({ where: { asignaturaId: asig.id } });
    await prisma.asignatura.delete({ where: { id: asig.id } });
  }
  if (curso) await prisma.curso.delete({ where: { id: curso.id } });
  console.log(JSON.stringify({ cleaned: true }));
}

async function seed() {
  const c = await centro();

  const docente = await prisma.usuario.findFirst({
    where: { email: "profe@demo.com" },
  });
  const alumnoUser = await prisma.usuario.findFirst({
    where: { email: "alumno@demo.com" },
  });
  const adminUser = await prisma.usuario.findFirst({
    where: { email: "admin@demo.com" },
  });
  if (!docente || !alumnoUser || !adminUser) {
    throw new Error("Usuarios demo no encontrados (profe/alumno/admin)");
  }

  let estudiante = await prisma.estudiante.findFirst({
    where: { usuarioId: alumnoUser.id },
  });
  if (!estudiante) {
    estudiante = await prisma.estudiante.create({
      data: {
        centroId: c.id,
        usuarioId: alumnoUser.id,
        documento: "ZZTEST-M5B",
      },
    });
  }

  let periodo = await prisma.periodo.findFirst({ where: { centroId: c.id } });
  if (!periodo) {
    periodo = await prisma.periodo.create({
      data: {
        centroId: c.id,
        nombre: "ZZTest-M5b-Periodo",
        fechaInicio: new Date(),
        fechaFin: new Date(),
      },
    });
  }

  const curso = await prisma.curso.upsert({
    where: { centroId_nombre: { centroId: c.id, nombre: CURSO } },
    create: { centroId: c.id, nombre: CURSO },
    update: {},
  });
  const asignatura = await prisma.asignatura.upsert({
    where: { centroId_nombre: { centroId: c.id, nombre: ASIG } },
    create: { centroId: c.id, nombre: ASIG },
    update: {},
  });
  const clase = await prisma.cursoAsignaturaDocente.upsert({
    where: {
      asignaturaId_docenteId_cursoId: {
        asignaturaId: asignatura.id,
        docenteId: docente.id,
        cursoId: curso.id,
      },
    },
    create: {
      asignaturaId: asignatura.id,
      docenteId: docente.id,
      cursoId: curso.id,
    },
    update: {},
  });
  await prisma.matricula.upsert({
    where: {
      estudianteId_cursoId_periodoId: {
        estudianteId: estudiante.id,
        cursoId: curso.id,
        periodoId: periodo.id,
      },
    },
    create: {
      centroId: c.id,
      estudianteId: estudiante.id,
      cursoId: curso.id,
      periodoId: periodo.id,
    },
    update: {},
  });

  const nota = await prisma.nota.upsert({
    where: {
      estudianteId_cursoAsignaturaDocenteId_periodoId_corte: {
        estudianteId: estudiante.id,
        cursoAsignaturaDocenteId: clase.id,
        periodoId: periodo.id,
        corte: CORTE,
      },
    },
    create: {
      centroId: c.id,
      estudianteId: estudiante.id,
      cursoAsignaturaDocenteId: clase.id,
      periodoId: periodo.id,
      corte: CORTE,
      valor: 4.5,
      autorId: adminUser.id,
    },
    update: { valor: 4.5, autorId: adminUser.id },
  });

  const readBack = await prisma.nota.findUnique({
    where: {
      estudianteId_cursoAsignaturaDocenteId_periodoId_corte: {
        estudianteId: estudiante.id,
        cursoAsignaturaDocenteId: clase.id,
        periodoId: periodo.id,
        corte: CORTE,
      },
    },
  });

  console.log(
    JSON.stringify({
      centroId: c.id,
      claseId: clase.id,
      periodoId: periodo.id,
      corte: CORTE,
      estudianteId: estudiante.id,
      estudianteNombre: `${alumnoUser.nombre} ${alumnoUser.apellido}`,
      notaId: nota.id,
      valorRoundtrip: readBack?.valor.toString(),
    }),
  );
}

(mode === "clean" ? clean() : seed())
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
