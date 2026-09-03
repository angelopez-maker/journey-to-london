// Arnés: carga el bloque del pasaporte del server real con un `app` falso, para poder
// invocar los handlers HTTP sin levantar express ni instalar nada.
const fs=require('fs'), path=require('path');
const src=fs.readFileSync('server.js','utf8');
const DATA_DIR='/tmp/rkdata'; fs.rmSync(DATA_DIR,{recursive:true,force:true});
const routes={};
const app={ get:(p,...h)=>routes['GET '+p]=h.pop(), post:(p,...h)=>routes['POST '+p]=h.pop() };
const rateLimit=()=>null;
const i=src.indexOf("// ── Passport API"), j=src.indexOf("// ── Fallback: serve index.html");
eval(src.slice(i,j).replace(/\bconst /g,'var '));

const call=(key,body)=>{ let out=null,code=200;
  const res={ json:d=>{out=d;return res;}, status:c=>{code=c;return res;}, set:()=>res };
  routes[key]({body},res); return {code,out}; };

let fails=0; const ok=(c,m)=>{ console.log((c?'  ok   ':'  FAIL ')+m); if(!c) fails++; };
const earn=b=>call('POST /api/passport/earn',b);

ok(call('GET /api/passport').out.shillings===0, 'GET arranca en 0 shillings');
ok(call('GET /api/passport').out.n===15, 'GET expone N=15');

ok(earn({station:'inventada',earned:5}).code===400, 'estación desconocida -> 400');
ok(earn({station:'match_day',earned:-3}).code===400, 'monto negativo -> 400');
ok(earn({station:'match_day',earned:999}).code===400, 'monto absurdo -> 400');
ok(earn({}).code===400, 'body vacío -> 400 y no revienta');

let r=earn({station:'match_day',earned:7,itemId:'md_epl_01'});
ok(r.out.paid===7 && r.out.repeat===false, 'primera vez paga completo');
r=earn({station:'match_day',earned:7,itemId:'md_epl_01'});
ok(r.out.paid===3 && r.out.repeat===true, 'la misma actividad otra vez paga el tope (3), no 7');
r=earn({station:'match_day',earned:7,itemId:'md_epl_02'});
ok(r.out.paid===7, 'otra actividad de la misma estación vuelve a pagar completo');

r=earn({station:'abbey_road',earned:5,itemId:'song_01'});
ok(r.out.paid===5 && !('abbey_road' in r.out.passport.bars), 'Abbey Road paga al bolsillo pero no tiene barra');
const antesBolsillo=r.out.passport.shillings;
ok(antesBolsillo===7+3+7+5, 'el bolsillo acumula todo, incluidas las culturales');

// Match Day ya va en 17. Al llenar las cinco restantes, el sello tiene que caer en la
// respuesta del earn que completa la ÚLTIMA que faltaba, no en una llamada posterior.
let stampResp=null, cuandoCayo=null;
['scavenger_hunt','survival_kit','mystery_picture','mind_the_gap','stop_look_and_listen'].forEach((s,k)=>{
  const rr=earn({station:s,earned:15,itemId:'a'+k});
  if(rr.out.newStamps.length){ stampResp=rr; cuandoCayo=s; }
});
ok(stampResp && stampResp.out.newStamps.length===1, 'al completar las seis llega el sello en la misma respuesta del earn');
ok(cuandoCayo==='stop_look_and_listen', 'y cae exactamente en la estación que completó la vuelta, ni antes ni después');
ok(!!stampResp.out.newStamps[0].place, 'el sello viene con destino');
ok(earn({station:'match_day',earned:1,itemId:'md_epl_03'}).out.newStamps.length===0, 'seguir jugando después no regala sellos de más');
ok(call('GET /api/passport').out.stampCount===1, 'el sello quedó persistido en passport.json');

ok(fs.existsSync(path.join(DATA_DIR,'passport.json')), 'passport.json se escribió en DATA_DIR');
ok(src.includes("'/passport.json'"), 'passport.json está en la lista BLOCKED');

console.log(fails ? `\n${fails} PRUEBA(S) FALLARON` : '\nTodas las pruebas del endpoint pasaron.');
process.exit(fails?1:0);
