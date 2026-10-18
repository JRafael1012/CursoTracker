import { handleEstadisticasExcel } from "@/lib/modules/reportes/actions";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return handleEstadisticasExcel(searchParams);
}
