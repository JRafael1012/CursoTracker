import * as XLSX from "xlsx";
import { getBoletin, getSabana, getEstadisticas } from "./queries";

export async function boletinToExcel(
  centroId: string,
  estudianteId: string,
  periodoId: string,
): Promise<Buffer | null> {
  const data = await getBoletin(centroId, estudianteId, periodoId);
  if (!data) return null;

  const rows = data.filas.map((f) => ({
    Asignatura: f.asignatura,
    Docente: f.docente,
    Corte: f.corte,
    Nota: f.valor,
  }));
  rows.push({
    Asignatura: "PROMEDIO GENERAL",
    Docente: "",
    Corte: "",
    Nota: data.promedioGeneral ?? 0,
  });

  const ws = XLSX.utils.json_to_sheet(rows);
  ws["!cols"] = [{ wch: 30 }, { wch: 30 }, { wch: 12 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Boletín");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function sabanaToExcel(
  centroId: string,
  cursoId: string,
  periodoId: string,
): Promise<Buffer> {
  const rows = await getSabana(centroId, cursoId, periodoId);
  const data = rows.map((r) => ({
    Estudiante: r.estudiante,
    Asignatura: r.asignatura,
    Docente: r.docente,
    Corte: r.corte,
    Nota: r.valor,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 30 }, { wch: 25 }, { wch: 30 }, { wch: 12 }, { wch: 8 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sábana");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function estadisticasToExcel(
  centroId: string,
  cursoId: string,
  periodoId: string,
  notaAprobatoria: number,
): Promise<Buffer> {
  const rows = await getEstadisticas(centroId, cursoId, periodoId, notaAprobatoria);
  const data = rows.map((r) => ({
    Asignatura: r.asignatura,
    Corte: r.corte,
    Total: r.total,
    Promedio: r.promedio,
    Aprobados: r.aprobados,
    Suspensos: r.suspensos,
  }));

  const ws = XLSX.utils.json_to_sheet(data);
  ws["!cols"] = [{ wch: 25 }, { wch: 12 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 12 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Estadísticas");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
}
