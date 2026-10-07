import { PrismaClient, Rol } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

type SeedUser = {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  rol: Rol;
};

const DEMO_USERS: SeedUser[] = [
  { email: "admin@demo.com", password: "Admin123!", nombre: "Rector", apellido: "Demo", rol: "RECTOR" },
  { email: "profe@demo.com", password: "Profe123!", nombre: "Docente", apellido: "Demo", rol: "DOCENTE" },
  { email: "alumno@demo.com", password: "Alumno123!", nombre: "Alumno", apellido: "Demo", rol: "ESTUDIANTE" },
  { email: "padre@demo.com", password: "Padre123!", nombre: "Acudiente", apellido: "Demo", rol: "PADRE" },
];

const NORTE_USERS: SeedUser[] = [
  { email: "admin@norte.com", password: "Norte123!", nombre: "Rector", apellido: "Norte", rol: "RECTOR" },
];

async function crearCentro(nombre: string, subdominio: string) {
  return prisma.centro.upsert({
    where: { nombre },
    update: { subdominio },
    create: { nombre, subdominio },
  });
}

async function crearUsuario(centroId: string, u: SeedUser) {
  return prisma.usuario.upsert({
    where: { email: u.email },
    update: {},
    create: {
      centroId,
      email: u.email,
      passwordHash: await hash(u.password, 10),
      nombre: u.nombre,
      apellido: u.apellido,
      rol: u.rol,
    },
  });
}

async function main() {
  const demo = await crearCentro("Academia Demo", "demo");
  const norte = await crearCentro("Colegio Norte", "norte");

  for (const u of DEMO_USERS) await crearUsuario(demo.id, u);
  for (const u of NORTE_USERS) await crearUsuario(norte.id, u);

  const alumno = await prisma.usuario.findUniqueOrThrow({ where: { email: "alumno@demo.com" } });
  const padre = await prisma.usuario.findUniqueOrThrow({ where: { email: "padre@demo.com" } });

  const estudiante = await prisma.estudiante.upsert({
    where: { usuarioId: alumno.id },
    update: {},
    create: { centroId: demo.id, usuarioId: alumno.id, documento: "DEMO-001" },
  });

  await prisma.estudiantePadre.upsert({
    where: {
      estudianteId_padreId: { estudianteId: estudiante.id, padreId: padre.id },
    },
    update: {},
    create: { estudianteId: estudiante.id, padreId: padre.id, parentesco: "Padre" },
  });

  console.log(
    "Seed OK — centros: Academia Demo, Colegio Norte | demo:",
    DEMO_USERS.map((u) => u.email).join(", "),
    "| norte:",
    NORTE_USERS.map((u) => u.email).join(", "),
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());