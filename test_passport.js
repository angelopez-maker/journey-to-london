const fs=require('fs');
const src=fs.readFileSync('server.js','utf8');
// Extrae del server real las constantes y funciones puras del pasaporte, para probarlas
// tal cual están escritas (no una copia que pueda divergir).
function grab(start){
  const i=src.indexOf(start); if(i<0) throw new Error('no encontrado: '+start);
  const nl=src.indexOf('\n',i);
  const firstDelim=src.slice(i,nl<0?src.length:nl).search(/[{[]/);
  if(firstDelim<0) return src.slice(i, src.indexOf(';',i)+1);   // constante de una línea
  let d=0,st=false;
  for(let j=i;j<src.length;j++){const c=src[j];
    if(c==='{'||c==='[') {d++;st=true;}
    else if(c==='}'||c===']'){d--; if(st&&d===0){
      let k=j+1; while(k<src.length && /[\s;]/.test(src[k])) k++;
      return src.slice(i,k);
    }}}
}
// N se declara como let para poder simular que cambia (prueba 4).
let RK_PASSPORT_N = Number(src.match(/const RK_PASSPORT_N\s*=\s*(\d+)/)[1]);
const parts=['const RK_CIRCUIT','const RK_CULTURAL','const RK_REPEAT_CAP',
             'const RK_DESTINATIONS','function emptyPassport','function passportLapsEarned',
             'function pickDestination','function grantPendingStamps','function passportView'];
eval(parts.map(grab).join('\n').replace(/\bconst /g,'var '));  // var para que el eval las publique en este scope

let fails=0;
const ok=(cond,msg)=>{ console.log((cond?'  ok   ':'  FAIL ')+msg); if(!cond) fails++; };

// ── 1. Flujo normal
let p=emptyPassport();
RK_CIRCUIT.forEach(id=>p.stations[id]=15);
let g=grantPendingStamps(p);
ok(g.length===1 && p.stamps.length===1, '6 estaciones en 15 -> exactamente 1 sello');
ok(!!g[0].place && !!g[0].nation && /^\d{4}-\d{2}-\d{2}$/.test(g[0].date), 'el sello trae place, nation y fecha');

// ── 2. Una sola estación atrasada no otorga nada
p=emptyPassport(); RK_CIRCUIT.forEach(id=>p.stations[id]=100); p.stations.mind_the_gap=14;
ok(grantPendingStamps(p).length===0, 'cinco estaciones llenas y una en 14 -> 0 sellos');

// ── 3. Salto de dos umbrales de una vez (el caso del while)
p=emptyPassport(); RK_CIRCUIT.forEach(id=>p.stations[id]=100); p.stations.mind_the_gap=14;
grantPendingStamps(p);
p.stations.mind_the_gap += 20;            // 14 -> 34 = 2 vueltas
g=grantPendingStamps(p);
ok(g.length===2, 'un pago que cruza dos umbrales otorga 2 sellos (no 1)');

// ── 4. Cambiar N no duplica ni pierde sellos
p=emptyPassport(); RK_CIRCUIT.forEach(id=>p.stations[id]=75);
grantPendingStamps(p);
ok(p.stamps.length===5, 'con N=15 y todo en 75 -> 5 sellos');
const antes=p.stamps.length;
RK_PASSPORT_N = 20;   // sube N con el álbum ya poblado
ok(grantPendingStamps(p).length===0 && p.stamps.length===antes, 'subir N no otorga ni borra sellos');
const v=passportView(p);
ok(Object.values(v.bars).every(b=>b>=0 && b<=20), 'las barras no se van a negativo al subir N (clamp)');
RK_PASSPORT_N = 15;

// ── 5. Rotación entre las cuatro naciones
p=emptyPassport(); RK_CIRCUIT.forEach(id=>p.stations[id]=15*8);
grantPendingStamps(p);
const nac4=new Set(p.stamps.slice(0,4).map(s=>s.nation));
ok(nac4.size===4, 'las cuatro naciones aparecen en los primeros 4 sellos');
const cuenta={}; p.stamps.forEach(s=>cuenta[s.nation]=(cuenta[s.nation]||0)+1);
ok(Math.max(...Object.values(cuenta))-Math.min(...Object.values(cuenta))<=1, 'en 8 sellos el reparto queda parejo (±1)');

// ── 6. Sin destinos repetidos y pool agotado sin romper
p=emptyPassport(); RK_CIRCUIT.forEach(id=>p.stations[id]=15*40);
grantPendingStamps(p);
ok(p.stamps.length===RK_DESTINATIONS.length, 'se otorgan los 22 destinos y no más');
ok(new Set(p.stamps.map(s=>s.place)).size===p.stamps.length, 'ningún destino repetido');
ok(grantPendingStamps(p).length===0, 'con el pool agotado no se cuelga ni lanza');
ok(passportView(p).destinationsLeft===0, 'destinationsLeft llega a 0');

// ── 7. Regla de repetición (la fórmula del endpoint)
const pagar=(st,raw)=>Math.min(Math.ceil(raw/2), RK_REPEAT_CAP[st]||2);
ok(pagar('mystery_picture',14)===3, 'repetir Mystery Picture con el máximo paga 3, no 7');
ok(pagar('survival_kit',15)===5,    'repetir Survival Kit al máximo topa en 5');
ok(pagar('survival_kit',4)===2,     'repetir Survival Kit hablando mal paga menos que hacerlo bien');
ok(pagar('mind_the_gap',9)===3,     'repetir Mind the Gap al máximo topa en 3');
const medias={survival_kit:9.1,scavenger_hunt:7.2,stop_look_and_listen:7.2,match_day:5.9,mystery_picture:5.3,mind_the_gap:5.0};
ok(Object.entries(medias).every(([st,m])=>RK_REPEAT_CAP[st]<m), 'ningún tope supera la media de su estación (el exploit muere)');

// ── 8. Las culturales no tienen casillero
ok(RK_CULTURAL.every(id=>!RK_CIRCUIT.includes(id)), 'Abbey Road y Electric Cinema fuera del circuito');
ok(Object.keys(passportView(emptyPassport()).bars).length===6, 'la vista expone 6 barras, no 8');

console.log(fails ? `\n${fails} PRUEBA(S) FALLARON` : '\nTodas las pruebas pasaron.');
process.exit(fails?1:0);
