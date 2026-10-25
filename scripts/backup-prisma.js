const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const RETENCION_DIAS = Number(process.env.BACKUP_RETENTION_DAYS ?? 30);

function limpiarAntiguos(dir) {
  const limite = Date.now() - RETENCION_DIAS * 24 * 60 * 60 * 1000;
  let borrados = 0;
  for (const nombre of fs.readdirSync(dir)) {
    if (!/^curso_tracker_prisma_.*\.json$/.test(nombre)) continue;
    const ruta = path.join(dir, nombre);
    if (fs.statSync(ruta).mtimeMs < limite) {
      fs.unlinkSync(ruta);
      borrados++;
    }
  }
  return borrados;
}

async function main() {
  const prisma = new PrismaClient();
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    
    const fecha = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const out = path.join(backupDir, `curso_tracker_prisma_${fecha}.json`);
    
    const data = {
      meta: { fecha: new Date().toISOString(), metodo: 'prisma-export', db: 'curso_tracker' },
      centro: await prisma.centro.findMany(),
      usuario: await prisma.usuario.findMany(),
      estudiante: await prisma.estudiante.findMany(),
      periodo: await prisma.periodo.findMany(),
      curso: await prisma.curso.findMany(),
      asignatura: await prisma.asignatura.findMany(),
      cursoAsignaturaDocente: await prisma.cursoAsignaturaDocente.findMany(),
      nota: await prisma.nota.findMany(),
      asistencia: await prisma.asistencia.findMany(),
      auditLog: await prisma.auditLog.findMany(),
    };
    
    fs.writeFileSync(out, JSON.stringify(data, null, 2));
    const size = fs.statSync(out).size;
    const borrados = limpiarAntiguos(backupDir);
    console.log('[OK] Backup generado con Prisma');
    console.log('[OK] Archivo:', out);
    console.log('[OK] Tamano:', Math.round(size/1024), 'KB');
    console.log('[OK] Tablas:', Object.keys(data).filter(k => k !== 'meta').length);
    console.log('[OK] Retencion:', RETENCION_DIAS, 'dias - eliminados:', borrados);
  } catch (e) {
    console.error('[ERR]', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
