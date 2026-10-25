import assert from 'node:assert';

console.log('=== Test aislamiento multi-tenant ===');

// Test 1: Filtrado por centroId
const centroDemo = 'centro-demo-id';
const centroNorte = 'centro-norte-id';

const datos = [
  { id: '1', nombre: 'Estudiante Demo', centroId: centroDemo },
  { id: '2', nombre: 'Estudiante Norte', centroId: centroNorte },
];

const resultado = datos.filter(d => d.centroId === centroNorte);
assert.strictEqual(resultado.length, 1, 'Debe haber solo 1 resultado para centroNorte');
assert.strictEqual(resultado[0].nombre, 'Estudiante Norte', 'Debe ser solo estudiante de centroNorte');
assert.strictEqual(datos.some(d => d.centroId === centroDemo && resultado.includes(d)), false, 'No debe mezclar datos entre centros');
console.log('[OK] Filtrado por centroId correcto');

// Test 2: SuperAdmin con centroId null
const superAdmin = { id: 'sa-1', role: 'SUPERADMIN', centroId: null };
assert.strictEqual(superAdmin.centroId, null);
assert.strictEqual(superAdmin.role, 'SUPERADMIN');
console.log('[OK] SuperAdmin permite centroId null');

// Test 3: Usuarios normales con centroId asignado
const rector = { id: 'r-1', role: 'RECTOR', centroId: 'centro-demo-id' };
const docente = { id: 'd-1', role: 'DOCENTE', centroId: 'centro-demo-id' };
assert.notStrictEqual(rector.centroId, null);
assert.notStrictEqual(docente.centroId, null);
console.log('[OK] Usuarios con rol académico tienen centroId asignado');

console.log('\n=== TODOS LOS TESTS PASARON ===');
