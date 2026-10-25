import { PrismaClient } from "@prisma/client";

const BASE = process.env.SMOKE_BASE_URL ?? "http://localhost:3000";
const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function check(name, ok, detail = "") {
  if (ok) {
    passed++;
    console.log(`[OK]   ${name}${detail ? ` — ${detail}` : ""}`);
  } else {
    failed++;
    console.log(`[FAIL] ${name}${detail ? ` — ${detail}` : ""}`);
  }
}

function parseSetCookie(headers) {
  return headers.getSetCookie().map((c) => c.split(";")[0]);
}

async function login(email, password) {
  let cookies = [];
  const csrfRes = await fetch(`${BASE}/api/auth/csrf`);
  cookies.push(...parseSetCookie(csrfRes.headers));
  const { csrfToken } = await csrfRes.json();

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
    callbackUrl: `${BASE}/panel`,
  });
  const res = await fetch(`${BASE}/api/auth/callback/credentials`, {
    method: "POST",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      cookie: cookies.join("; "),
      origin: BASE,
    },
    body,
    redirect: "manual",
  });
  cookies.push(...parseSetCookie(res.headers));

  const sessionRes = await fetch(`${BASE}/api/auth/session`, {
    headers: { cookie: cookies.join("; ") },
  });
  const session = await sessionRes.json();
  return { cookie: cookies.join("; "), session, status: res.status };
}

async function get(path, cookie) {
  return fetch(`${BASE}${path}`, {
    headers: cookie ? { cookie } : {},
    redirect: "manual",
  });
}

async function firstBytes(res, n) {
  const buf = Buffer.from(await res.arrayBuffer());
  return buf.subarray(0, n).toString("latin1");
}

function blockedByRole(res, body) {
  if (res.status === 307 || res.status === 302) {
    const loc = res.headers.get("location") ?? "";
    return loc === "/panel" || loc.endsWith("/panel");
  }
  return res.status === 200 && body.includes("NEXT_REDIRECT;replace;/panel");
}

async function main() {
  const centro = await prisma.centro.findUniqueOrThrow({ where: { nombre: "Academia Demo" } });
  const norte = await prisma.centro.findUniqueOrThrow({ where: { nombre: "Colegio Norte" } });
  const alumnoUsuario = await prisma.usuario.findUniqueOrThrow({ where: { email: "alumno@demo.com" } });
  const estudiante = await prisma.estudiante.findUniqueOrThrow({ where: { usuarioId: alumnoUsuario.id } });
  const curso = await prisma.curso.findFirstOrThrow({ where: { centroId: centro.id } });
  const periodo = await prisma.periodo.findFirstOrThrow({ where: { centroId: centro.id } });

  const roles = [
    { email: "admin@demo.com", password: "Admin123!", rol: "RECTOR", panel: true },
    { email: "profe@demo.com", password: "Profe123!", rol: "DOCENTE", panel: true },
    { email: "alumno@demo.com", password: "Alumno123!", rol: "ESTUDIANTE", panel: true },
    { email: "padre@demo.com", password: "Padre123!", rol: "PADRE", panel: true },
    { email: "admin@norte.com", password: "Norte123!", rol: "RECTOR", panel: true },
  ];

  const sessions = {};
  for (const r of roles) {
    const s = await login(r.email, r.password);
    const panel = await get("/panel", s.cookie);
    check(
      `login ${r.email}`,
      s.session?.user?.rol === r.rol && panel.status === 200,
      `rol=${s.session?.user?.rol ?? "sin sesión"} panel=${panel.status}`,
    );
    sessions[r.email] = s;
  }

  const invalid = await get("/panel", "authjs.session-token=invalido");
  check("cookie inválida redirige a /login", invalid.status === 307 || invalid.status === 302, `status=${invalid.status}`);

  const rector = sessions["admin@demo.com"].cookie;
  const docente = sessions["profe@demo.com"].cookie;
  const alumno = sessions["alumno@demo.com"].cookie;
  const padre = sessions["padre@demo.com"].cookie;
  const norteRector = sessions["admin@norte.com"].cookie;

  const notasEst = await get("/panel/notas", alumno);
  const asisEst = await get("/panel/asistencia", alumno);
  const notasBody = await notasEst.text();
  const asisBody = await asisEst.text();
  check(
    "estudiante redirigido de /panel/notas",
    blockedByRole(notasEst, notasBody) && !notasBody.includes("<h1>Notas</h1>"),
    `status=${notasEst.status} sin_contenido=${!notasBody.includes("<h1>Notas</h1>")}`,
  );
  check(
    "estudiante redirigido de /panel/asistencia",
    blockedByRole(asisEst, asisBody) && !asisBody.includes("<h1>Asistencia diaria</h1>"),
    `status=${asisEst.status} sin_contenido=${!asisBody.includes("<h1>Asistencia diaria</h1>")}`,
  );

  const qs = `estudianteId=${estudiante.id}&cursoId=${curso.id}&periodoId=${periodo.id}`;
  const exports = [
    ["boletin/excel", "PK", rector],
    ["boletin/pdf", "%PDF", rector],
    ["sabana/excel", "PK", rector],
    ["sabana/pdf", "%PDF", rector],
    ["estadisticas/excel", "PK", rector],
    ["estadisticas/pdf", "%PDF", rector],
  ];
  for (const [path, magic, cookie] of exports) {
    const res = await get(`/api/reportes/${path}?${qs}`, cookie);
    const bytes = await firstBytes(res, magic.length);
    check(`export ${path}`, res.status === 200 && bytes === magic, `status=${res.status} magic=${JSON.stringify(bytes)}`);
  }

  const boletinEst = await get(`/api/reportes/boletin/excel?estudianteId=${estudiante.id}&periodoId=${periodo.id}`, alumno);
  check("estudiante exporta su propio boletín", boletinEst.status === 200 && (await firstBytes(boletinEst, 2)) === "PK", `status=${boletinEst.status}`);

  const sabanaEst = await get(`/api/reportes/sabana/excel?${qs}`, alumno);
  check("estudiante bloqueado de sábana", sabanaEst.status === 307 || sabanaEst.status === 302, `status=${sabanaEst.status}`);

  const boletinPadre = await get(`/api/reportes/boletin/pdf?estudianteId=${estudiante.id}&periodoId=${periodo.id}`, padre);
  check("padre exporta boletín de su hijo", boletinPadre.status === 200 && (await firstBytes(boletinPadre, 4)) === "%PDF", `status=${boletinPadre.status}`);

  const ajeno = await get(`/api/reportes/boletin/pdf?estudianteId=00000000-0000-0000-0000-000000000000`, padre);
  check("padre bloqueado de estudiante ajeno", ajeno.status === 403, `status=${ajeno.status}`);

  const cruzado = await get(`/api/reportes/boletin/excel?estudianteId=${estudiante.id}&periodoId=${periodo.id}`, norteRector);
  check("rector de otro centro no ve boletín ajeno", cruzado.status === 404, `status=${cruzado.status}`);

  const docenteSabana = await get(`/api/reportes/sabana/excel?${qs}`, docente);
  check("docente exporta sábana", docenteSabana.status === 200 && (await firstBytes(docenteSabana, 2)) === "PK", `status=${docenteSabana.status}`);

  check("centros demo distintos", centro.id !== norte.id);

  console.log(`\nResultado: ${passed} OK, ${failed} FAIL`);
  process.exitCode = failed === 0 ? 0 : 1;
}

main()
  .catch((e) => {
    console.error("[ERR]", e.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
