import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const PASSWORDS = {
  admin: "Admin123!",
  docente: "Profe123!",
  estudiante: "Alumno123!",
  padre: "Padre123!",
};

async function main() {
  const centro = await prisma.centro.upsert({
    where: { nombre: "Academia Demo" },
    update: {},
    create: { nombre: "Academia Demo" },
  });

  const usuarios: Array<[string, string, "ADMIN" | "DOCENTE" | "ESTUDIANTE" | "PADRE"]> = [
    ["admin@demo.com", PASSWORDS.admin, "ADMIN"],
    ["profe@demo.com", PASSWORDS.docente, "DOCENTE"],
    ["alumno@demo.com", PASSWORDS.estudiante, "ESTUDIANTE"],
    ["padre@demo.com", PASSWORDS.padre, "PADRE"],
  ];

  for (const [email, password, rol] of usuarios) {
    await prisma.usuario.upsert({
      where: { centroId_email: { centroId: centro.id, email } },
      update: {},
      create: {
        centroId: centro.id,
        email,
        passwordHash: await hash(password, 10),
        nombre: rol.charAt(0) + rol.slice(1).toLowerCase(),
        rol,
      },
    });
  }

  console.log("Seed OK — centro:", centro.nombre, "| usuarios:", usuarios.map(([e]) => e).join(", "));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
