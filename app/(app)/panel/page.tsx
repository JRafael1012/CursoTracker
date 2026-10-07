import Link from "next/link";
import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/modules/auth/session";
import { Icon } from "@/components/icon";

const ROL_LABEL: Record<string, string> = {
  ADMIN: "Administrador",
  DOCENTE: "Docente",
  ESTUDIANTE: "Estudiante",
  PADRE: "Padre/Acudiente",
};

function saludo(hora: number) {
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

function fechaLarga(d: Date) {
  const s = new Intl.DateTimeFormat("es", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(d);
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export default async function PanelPage() {
  const user = await requireUser();
  const centroId = user.centroId;

  const [
    estudiantes,
    cursos,
    periodos,
    totalNotas,
    promedio,
    porPeriodo,
    audit,
    conteoCursos,
  ] = await Promise.all([
    prisma.estudiante.count({ where: { centroId, estado: "activo" } }),
    prisma.curso.count({ where: { centroId } }),
    prisma.periodo.count({ where: { centroId } }),
    prisma.nota.count({ where: { centroId } }),
    prisma.nota.aggregate({ where: { centroId }, _avg: { valor: true } }),
    prisma.nota.groupBy({
      by: ["periodoId"],
      where: { centroId },
      _avg: { valor: true },
      _count: true,
    }),
    prisma.auditLog.findMany({
      where: { centroId },
      orderBy: { fecha: "desc" },
      take: 5,
      include: { usuario: { select: { nombre: true } } },
    }),
    prisma.curso.findMany({
      where: { centroId },
      orderBy: { nombre: "asc" },
      take: 4,
      include: {
        _count: { select: { matriculas: true, notas: true } },
      },
    }),
  ]);

  const listaPeriodos = await prisma.periodo.findMany({
    where: { centroId, id: { in: porPeriodo.map((p) => p.periodoId) } },
  });
  const seriesPeriodos = porPeriodo
    .map((p) => ({
      nombre:
        listaPeriodos.find((x) => x.id === p.periodoId)?.nombre ??
        `Período ${p.periodoId}`,
      valor: Number(p._avg.valor ?? 0),
      cantidad: p._count,
      orden:
        listaPeriodos.find((x) => x.id === p.periodoId)?.fechaInicio.getTime() ??
        0,
    }))
    .sort((a, b) => a.orden - b.orden);

  const maxSerie = Math.max(100, ...seriesPeriodos.map((s) => s.valor));
  const puntos = seriesPeriodos.map((s, i) => {
    const x = seriesPeriodos.length > 1 ? (i / (seriesPeriodos.length - 1)) * 600 : 0;
    const y = 180 - (s.valor / maxSerie) * 180;
    return { ...s, x, y };
  });
  const linea =
    puntos.length > 1
      ? puntos.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ")
      : "";

  const promedioGeneral =
    promedio._avg.valor != null ? Number(promedio._avg.valor).toFixed(1) : "—";

  const metrics = [
    {
      label: "Estudiantes activos",
      value: String(estudiantes),
      trend: `${conteoCursos.reduce((a, c) => a + c._count.matriculas, 0)}`,
      detail: "matrículas registradas",
      icon: "students" as const,
      tone: "blue" as const,
    },
    {
      label: "Cursos",
      value: String(cursos),
      trend: `${periodos}`,
      detail: "períodos definidos",
      icon: "book" as const,
      tone: "indigo" as const,
    },
    {
      label: "Notas registradas",
      value: String(totalNotas),
      trend: porPeriodo.length ? `${porPeriodo.length}` : "0",
      detail: "períodos con notas",
      icon: "chart" as const,
      tone: "green" as const,
    },
    {
      label: "Promedio general",
      value: promedioGeneral,
      trend: user.rol === "ADMIN" ? "admin" : "docente",
      detail: "según tu rol",
      icon: "trend" as const,
      tone: "amber" as const,
    },
  ];

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">{fechaLarga(new Date())}</p>
          <h1>
            {saludo(new Date().getHours())}, {user.name?.split(" ")[0]}
          </h1>
          <p>
            Sesión activa como {ROL_LABEL[user.rol] ?? user.rol}. Este es el
            resumen de tu centro.
          </p>
        </div>
        {user.rol !== "ESTUDIANTE" && user.rol !== "PADRE" ? (
          <Link href="/panel/estudiantes" className="primary-button">
            <Icon name="plus" size={18} /> Nuevo estudiante
          </Link>
        ) : null}
      </section>

      <section className="metrics-grid">
        {metrics.map((metric) => (
          <article className="metric-card" key={metric.label}>
            <div className={`metric-icon ${metric.tone}`}>
              <Icon name={metric.icon} />
            </div>
            <div className="metric-copy">
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
              <small>
                <b className={metric.tone === "amber" ? "neutral" : ""}>
                  {metric.trend}
                </b>{" "}
                {metric.detail}
              </small>
            </div>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Promedio por período</h2>
              <p>Notas registradas en el centro</p>
            </div>
          </div>
          <div className="chart-legend">
            <span>
              <i className="dot-blue" /> Promedio
            </span>
            <strong>
              {promedioGeneral}{" "}
              <small>promedio general</small>
            </strong>
          </div>
          {puntos.length > 1 ? (
            <div className="chart-area">
              <div className="y-axis">
                <span>{maxSerie}</span>
                <span>{Math.round(maxSerie * 0.75)}</span>
                <span>{Math.round(maxSerie * 0.5)}</span>
                <span>{Math.round(maxSerie * 0.25)}</span>
                <span>0</span>
              </div>
              <div className="line-chart">
                <div className="grid-lines">
                  <i />
                  <i />
                  <i />
                  <i />
                  <i />
                </div>
                <svg viewBox="0 0 600 180" preserveAspectRatio="none" role="img" aria-label="Promedio por período">
                  <path className="line-path" d={linea} />
                  {puntos.map((p) => (
                    <circle key={p.nombre} cx={p.x} cy={p.y} r="4" />
                  ))}
                </svg>
                <div className="x-axis">
                  {puntos.map((p) => (
                    <span key={p.nombre}>{p.nombre}</span>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="empty-note">
              Aún no hay notas en varios períodos. Al cargarlas verás la
              evolución aquí.
            </p>
          )}
        </article>

        <article className="panel attendance-panel">
          <div className="panel-header">
            <div>
              <h2>Cobertura de notas</h2>
              <p>Notas por período registradas</p>
            </div>
          </div>
          <div className="donut-wrap">
            <div className="donut">
              <div>
                <strong>{totalNotas}</strong>
                <span>Notas</span>
              </div>
            </div>
          </div>
          <div className="attendance-legend">
            <div>
              <span>
                <i className="dot green" />
                Períodos
              </span>
              <b>{porPeriodo.length}</b>
            </div>
            <div>
              <span>
                <i className="dot amber" />
                Cursos
              </span>
              <b>{cursos}</b>
            </div>
            <div>
              <span>
                <i className="dot red" />
                Cursos s/ nota
              </span>
              <b>{conteoCursos.filter((c) => c._count.notas === 0).length}</b>
            </div>
          </div>
        </article>
      </section>

      <section className="lower-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Cursos</h2>
              <p>Matrículas y notas por curso</p>
            </div>
            <Link href="/panel/cursos" className="text-button">
              Ver cursos <Icon name="arrow" size={16} />
            </Link>
          </div>
          <div className="course-list">
            {conteoCursos.length === 0 ? (
              <p className="empty-note">Sin cursos creados todavía.</p>
            ) : (
              conteoCursos.map((c, i) => {
                const tono = ["blue", "indigo", "amber"][i % 3] as
                  | "blue"
                  | "indigo"
                  | "amber";
                const avance = totalNotas
                  ? Math.round((c._count.notas / totalNotas) * 100)
                  : 0;
                return (
                  <div className="course-row" key={c.id}>
                    <div className={`course-badge ${tono}`}>
                      {c.nombre.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="course-info">
                      <strong>{c.nombre}</strong>
                      <span>
                        {c.nivel || "Sin nivel"} · {c._count.matriculas}{" "}
                        matriculados
                      </span>
                    </div>
                    <div className="course-progress">
                      <div>
                        <span>Notas del centro</span>
                        <b>{avance}%</b>
                      </div>
                      <div className="progress-track">
                        <i className={tono} style={{ width: `${avance}%` }} />
                      </div>
                    </div>
                    <Link
                      href="/panel/cursos"
                      className="plain-button"
                      aria-label={`Ver ${c.nombre}`}
                    >
                      <Icon name="chevron" size={18} />
                    </Link>
                  </div>
                );
              })
            )}
          </div>
        </article>

        <article className="panel">
          <div className="panel-header">
            <div>
              <h2>Actividad reciente</h2>
              <p>Últimos cambios registrados</p>
            </div>
          </div>
          <div className="activity-list">
            {audit.length === 0 ? (
              <p className="empty-note">Sin actividad registrada aún.</p>
            ) : (
              audit.map((a) => (
                <div className="activity-row" key={a.id}>
                  <div className="avatar blue">
                    {a.usuario.nombre.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p>
                      <strong>{a.usuario.nombre}</strong> · {a.accion}{" "}
                      <b>{a.entidad}</b>
                    </p>
                    <span>
                      <Icon name="clock" size={13} />{" "}
                      {new Intl.DateTimeFormat("es", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      }).format(a.fecha)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </div>
  );
}