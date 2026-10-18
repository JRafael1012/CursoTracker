import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/modules/auth/session";



export default async function ReportesPage() {
  const user = await requireRole("RECTOR", "ADMIN", "COORDINADOR", "DOCENTE", "ESTUDIANTE", "PADRE");
  const centroId = user.centroId ?? "";
  const esAcademico = ["RECTOR", "ADMIN", "COORDINADOR", "DOCENTE"].includes(user.rol);
  const esDirectivo = ["RECTOR", "ADMIN", "COORDINADOR"].includes(user.rol);

  const [estudiantes, cursos, periodos] = await Promise.all([
    esDirectivo
      ? prisma.estudiante.findMany({
          where: { centroId, estado: "activo" },
          include: { usuario: { select: { nombre: true, apellido: true } } },
          orderBy: { usuario: { apellido: "asc" } },
          take: 200,
        })
      : Promise.resolve([]),
    esAcademico
      ? prisma.curso.findMany({
          where: { centroId },
          orderBy: { nombre: "asc" },
          select: { id: true, nombre: true },
        })
      : Promise.resolve([]),
    prisma.periodo.findMany({
      where: { centroId },
      orderBy: { fechaInicio: "desc" },
      select: { id: true, nombre: true },
    }),
  ]);

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">REPORTES</p>
          <h1>Reportes</h1>
          <p>Exporta boletines, sábanas y estadísticas en Excel o PDF.</p>
        </div>
      </section>

      {esDirectivo && estudiantes.length > 0 ? (
        <section className="data-card mb-[15px]">
          <h2 className="text-[14px] font-semibold mb-3">Boletín por estudiante</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <BoletinForm estudiantes={estudiantes} periodos={periodos} tipo="excel" />
            <BoletinForm estudiantes={estudiantes} periodos={periodos} tipo="pdf" />
          </div>
        </section>
      ) : null}

      {esAcademico && cursos.length > 0 ? (
        <>
          <section className="data-card mb-[15px]">
            <h2 className="text-[14px] font-semibold mb-3">Sábana de notas por curso</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <CursoForm cursos={cursos} periodos={periodos} tipo="excel" reporte="sabana" />
              <CursoForm cursos={cursos} periodos={periodos} tipo="pdf" reporte="sabana" />
            </div>
          </section>

          <section className="data-card mb-[15px]">
            <h2 className="text-[14px] font-semibold mb-3">Estadísticas por curso</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <CursoForm cursos={cursos} periodos={periodos} tipo="excel" reporte="estadisticas" />
              <CursoForm cursos={cursos} periodos={periodos} tipo="pdf" reporte="estadisticas" />
            </div>
          </section>
        </>
      ) : null}

      {!esDirectivo && !esAcademico ? (
        <section className="data-card">
          <p className="empty-note">
            Tu rol no tiene reportes disponibles. Consulta con tu institución.
          </p>
        </section>
      ) : null}
    </div>
  );
}

function BoletinForm({
  estudiantes,
  periodos,
  tipo,
}: {
  estudiantes: { id: string; usuario: { nombre: string; apellido: string } }[];
  periodos: { id: string; nombre: string }[];
  tipo: "excel" | "pdf";
}) {
  return (
    <form
      method="get"
      action={`/api/reportes/boletin/${tipo}`}
      className="flex gap-3"
    >
      <select name="estudianteId" className="field-input" required>
        <option value="" disabled>Estudiante…</option>
        {estudiantes.map((e) => (
          <option key={e.id} value={e.id}>
            {e.usuario.nombre} {e.usuario.apellido}
          </option>
        ))}
      </select>
      <select name="periodoId" className="field-input" required>
        <option value="" disabled>Período…</option>
        {periodos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>
      <button type="submit" className="primary-button whitespace-nowrap">
        {tipo === "excel" ? "Excel" : "PDF"}
      </button>
    </form>
  );
}

function CursoForm({
  cursos,
  periodos,
  tipo,
  reporte,
}: {
  cursos: { id: string; nombre: string }[];
  periodos: { id: string; nombre: string }[];
  tipo: "excel" | "pdf";
  reporte: "sabana" | "estadisticas";
}) {
  return (
    <form
      method="get"
      action={`/api/reportes/${reporte}/${tipo}`}
      className="flex gap-3"
    >
      <select name="cursoId" className="field-input" required>
        <option value="" disabled>Curso…</option>
        {cursos.map((c) => (
          <option key={c.id} value={c.id}>{c.nombre}</option>
        ))}
      </select>
      <select name="periodoId" className="field-input" required>
        <option value="" disabled>Período…</option>
        {periodos.map((p) => (
          <option key={p.id} value={p.id}>{p.nombre}</option>
        ))}
      </select>
      <button type="submit" className="primary-button whitespace-nowrap">
        {tipo === "excel" ? "Excel" : "PDF"}
      </button>
    </form>
  );
}
