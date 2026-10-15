import { requireRole } from "@/lib/modules/auth/session";
import { getConfigCalificacion } from "@/lib/modules/config";
import { ConfigCalificacionForm } from "./form";

export default async function ConfiguracionPage() {
  const user = await requireRole("RECTOR", "ADMIN");
  const config = await getConfigCalificacion(user.centroId ?? "");

  return (
    <div className="page">
      <section className="welcome">
        <div>
          <p className="eyebrow">CONFIGURACIÓN</p>
          <h1>Calificación</h1>
          <p>
            Escala, nota de aprobación y cortes por período de tu centro.
          </p>
        </div>
      </section>

      <section className="data-card">
        <ConfigCalificacionForm config={config} />
      </section>
    </div>
  );
}
