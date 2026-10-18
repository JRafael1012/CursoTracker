import React from "react";
import { Document, Page, Text, View, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import { getBoletin, getSabana, getEstadisticas } from "./queries";

const styles = StyleSheet.create({
  page: { padding: 30, fontSize: 10, fontFamily: "Helvetica" },
  title: { fontSize: 16, marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 11, marginBottom: 16, textAlign: "center", color: "#444" },
  table: { width: "100%", marginBottom: 12 },
  row: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc", paddingVertical: 4 },
  header: { backgroundColor: "#f0f0f0", fontWeight: "bold" },
  cellAsig: { width: "30%" },
  cellDoc: { width: "30%" },
  cellCorte: { width: "15%" },
  cellNota: { width: "15%", textAlign: "right" },
  promedio: { marginTop: 12, fontSize: 12, fontWeight: "bold", textAlign: "right" },
  footer: { position: "absolute", bottom: 20, left: 30, right: 30, fontSize: 8, color: "#888", textAlign: "center" },
});

function BoletinDoc({ data, centro }: { data: NonNullable<Awaited<ReturnType<typeof getBoletin>>>; centro: string }) {
  return (
    <Document title={`Boletín - ${data.estudiante}`} author={centro}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{centro}</Text>
        <Text style={styles.subtitle}>Boletín de Notas — {data.periodo}</Text>
        <Text style={{ marginBottom: 4 }}>Estudiante: {data.estudiante}</Text>
        <Text style={{ marginBottom: 12 }}>Curso: {data.curso}</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellAsig}>Asignatura</Text>
            <Text style={styles.cellDoc}>Docente</Text>
            <Text style={styles.cellCorte}>Corte</Text>
            <Text style={styles.cellNota}>Nota</Text>
          </View>
          {data.filas.map((f, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cellAsig}>{f.asignatura}</Text>
              <Text style={styles.cellDoc}>{f.docente}</Text>
              <Text style={styles.cellCorte}>{f.corte}</Text>
              <Text style={styles.cellNota}>{f.valor.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        {data.promedioGeneral !== null && (
          <Text style={styles.promedio}>Promedio general: {data.promedioGeneral.toFixed(2)}</Text>
        )}
        <Text style={styles.footer}>Generado por CursoTracker — {new Date().toLocaleDateString("es-CO")}</Text>
      </Page>
    </Document>
  );
}

function SabanaDoc({ rows, centro, curso, periodo }: { rows: Awaited<ReturnType<typeof getSabana>>; centro: string; curso: string; periodo: string }) {
  return (
    <Document title={`Sábana - ${curso}`} author={centro}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{centro}</Text>
        <Text style={styles.subtitle}>Sábana de Notas — {curso} · {periodo}</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellAsig}>Estudiante</Text>
            <Text style={styles.cellAsig}>Asignatura</Text>
            <Text style={styles.cellCorte}>Corte</Text>
            <Text style={styles.cellNota}>Nota</Text>
          </View>
          {rows.map((r, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cellAsig}>{r.estudiante}</Text>
              <Text style={styles.cellAsig}>{r.asignatura}</Text>
              <Text style={styles.cellCorte}>{r.corte}</Text>
              <Text style={styles.cellNota}>{r.valor.toFixed(2)}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Generado por CursoTracker — {new Date().toLocaleDateString("es-CO")}</Text>
      </Page>
    </Document>
  );
}

function EstadisticasDoc({ rows, centro, curso, periodo }: { rows: Awaited<ReturnType<typeof getEstadisticas>>; centro: string; curso: string; periodo: string }) {
  return (
    <Document title={`Estadísticas - ${curso}`} author={centro}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{centro}</Text>
        <Text style={styles.subtitle}>Estadísticas — {curso} · {periodo}</Text>
        <View style={styles.table}>
          <View style={[styles.row, styles.header]}>
            <Text style={styles.cellAsig}>Asignatura</Text>
            <Text style={styles.cellCorte}>Corte</Text>
            <Text style={styles.cellNota}>Total</Text>
            <Text style={styles.cellNota}>Prom.</Text>
            <Text style={styles.cellNota}>Apr.</Text>
            <Text style={styles.cellNota}>Sus.</Text>
          </View>
          {rows.map((r, i) => (
            <View key={i} style={styles.row}>
              <Text style={styles.cellAsig}>{r.asignatura}</Text>
              <Text style={styles.cellCorte}>{r.corte}</Text>
              <Text style={styles.cellNota}>{r.total}</Text>
              <Text style={styles.cellNota}>{r.promedio.toFixed(2)}</Text>
              <Text style={styles.cellNota}>{r.aprobados}</Text>
              <Text style={styles.cellNota}>{r.suspensos}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.footer}>Generado por CursoTracker — {new Date().toLocaleDateString("es-CO")}</Text>
      </Page>
    </Document>
  );
}

export async function boletinToPdf(
  centroId: string,
  estudianteId: string,
  periodoId: string,
  centro: string,
): Promise<Buffer | null> {
  const data = await getBoletin(centroId, estudianteId, periodoId);
  if (!data) return null;
  const buffer = await renderToBuffer(<BoletinDoc data={data} centro={centro} />);
  return buffer as unknown as Buffer;
}

export async function sabanaToPdf(
  centroId: string,
  cursoId: string,
  periodoId: string,
  centro: string,
  curso: string,
  periodo: string,
): Promise<Buffer> {
  const rows = await getSabana(centroId, cursoId, periodoId);
  const buffer = await renderToBuffer(<SabanaDoc rows={rows} centro={centro} curso={curso} periodo={periodo} />);
  return buffer as unknown as Buffer;
}

export async function estadisticasToPdf(
  centroId: string,
  cursoId: string,
  periodoId: string,
  notaAprobatoria: number,
  centro: string,
  curso: string,
  periodo: string,
): Promise<Buffer> {
  const rows = await getEstadisticas(centroId, cursoId, periodoId, notaAprobatoria);
  const buffer = await renderToBuffer(<EstadisticasDoc rows={rows} centro={centro} curso={curso} periodo={periodo} />);
  return buffer as unknown as Buffer;
}
