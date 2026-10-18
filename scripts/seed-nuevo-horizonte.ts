import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const NOMBRES = ["Ana","Luis","Carlos","María","Camila","Santiago","Valentina","Mateo","Juliana","Felipe","Daniela","Andrés","Laura","Sebastián","Paula","Javier","Natalia","Alejandro","Isabella","David","Sara","José","Camilo","Lucía","Tomás","Adriana","Ricardo","Carolina","Martín","Verónica"];
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const APELLIDOS = ["García","Rodríguez","Martínez","López","Sánchez","Ramírez","Torres","Álvarez","Romero","González","Hernández","Díaz","Castro","Rojas","Moreno","Ortiz","Cruz","Pérez","Vargas","Suárez"];

function randInt(min:number,max:number){ return Math.floor(Math.random()*(max-min+1))+min; }
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function pick<T>(a:T[]){ return a[randInt(0,a.length-1)]; }

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function nombreGrupo(grado:string,g:string){
  if(grado==="Transición") return `Transición ${g}`;
  const map:Record<string,string>={Primero:"1",Segundo:"2",Tercero:"3",Cuarto:"4",Quinto:"5",Sexto:"6",Séptimo:"7",Octavo:"8",Noveno:"9",Décimo:"10",Undécimo:"11"};
  return `${map[grado]}${g}`;
}

async function main(){
  const centro = await prisma.centro.upsert({
    where:{nombre:"Institución Educativa Nuevo Horizonte"},
    update:{subdominio:"nuevohorizonte"},
    create:{nombre:"Institución Educativa Nuevo Horizonte", subdominio:"nuevohorizonte"},
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const periodo = await prisma.periodo.upsert({
    where:{centroId_nombre:{centroId:centro.id,nombre:"2026-1"}},
    update:{},
    create:{centroId:centro.id,nombre:"2026-1",fechaInicio:new Date("2026-01-13"),fechaFin:new Date("2026-11-20")},
  });
  console.log("OK: centro, periodo");
}

main().catch(e=>{console.error(e);process.exit(1)}).finally(()=>prisma.$disconnect());
