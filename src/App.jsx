import { useState, useEffect, useCallback } from "react";

const SUPA_URL = "https://gxhdxbabjqmyldbctwoy.supabase.co";
const SUPA_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGR4YmFianFteWxkYmN0d295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTcyOTMsImV4cCI6MjA5NTYzMzI5M30.xq_HSa1s1qjECPvC9lpH0ikjGnkZFoJeYzF4i_epr6Y";
const H = { "apikey":SUPA_KEY,"Authorization":`Bearer ${SUPA_KEY}`,"Content-Type":"application/json","Prefer":"return=representation" };

const db = {
  get: async (t,q="")=>{ const r=await fetch(`${SUPA_URL}/rest/v1/${t}?${q}`,{headers:H}); if(!r.ok)throw new Error(await r.text()); return r.json(); },
  patch: async (t,f,b)=>{ const r=await fetch(`${SUPA_URL}/rest/v1/${t}?${f}`,{method:"PATCH",headers:H,body:JSON.stringify(b)}); if(!r.ok)throw new Error(await r.text()); return r.json(); },
  post: async (t,b)=>{ const r=await fetch(`${SUPA_URL}/rest/v1/${t}`,{method:"POST",headers:H,body:JSON.stringify(b)}); if(!r.ok)throw new Error(await r.text()); return r.json(); },
  del: async (t,f)=>{ const r=await fetch(`${SUPA_URL}/rest/v1/${t}?${f}`,{method:"DELETE",headers:H}); if(!r.ok)throw new Error(await r.text()); }
};

const $$ = n=>`RD$${new Intl.NumberFormat("es-DO",{minimumFractionDigits:0}).format(Math.abs(n||0))}`;
const pct = (a,b)=>b>0?Math.min(100,(a/b)*100):0;
const catColor = {hogar:"#4A9AE8",deuda:"#E84A4A",ahorro:"#4AE8A0",personal:"#E8C44A",ccd:"#A04AE8"};
const catIcon  = {hogar:"🏠",deuda:"💳",ahorro:"💰",personal:"💄",ccd:"🏢"};
const MESES    = ["2026-06","2026-07","2026-08","2026-09","2026-10","2026-11","2026-12"];
const MES_L    = {"2026-06":"Junio","2026-07":"Julio","2026-08":"Agosto","2026-09":"Septiembre","2026-10":"Octubre","2026-11":"Noviembre","2026-12":"Diciembre"};

const Card=({children,style={}})=>(<div style={{background:"#0D1117",border:"1px solid #1E2530",borderRadius:16,padding:"16px 18px",...style}}>{children}</div>);
const Pill=({color,children,sm})=>(<span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:99,padding:sm?"2px 8px":"4px 12px",fontSize:sm?10:12,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>);
const BarG=({gastado,asignado,h=8})=>{const p=pct(gastado,asignado);const c=p>=100?"#E84A4A":p>=80?"#E8924A":p>=50?"#E8C44A":"#4AE8A0";return(<div style={{background:"#1A2030",borderRadius:99,height:h,overflow:"hidden"}}><div style={{width:`${p}%`,height:"100%",background:c,borderRadius:99,transition:"width .4s ease"}}/></div>);};

function SobreCard({sobre,onGasto,onEdit}){
  const disp=Number(sobre.monto_asignado)-Number(sobre.monto_gastado);
  const p=pct(Number(sobre.monto_gastado),Number(sobre.monto_asignado));
  const agotado=disp<=0;
  return(
    <div style={{background:agotado?"#1A0D0D":"#0D1117",border:`1px solid ${agotado?"#E84A4A44":sobre.fuente_color+"33"}`,borderRadius:14,padding:"14px 16px",borderLeft:`3px solid ${agotado?"#E84A4A":sobre.fuente_color}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontSize:14,fontWeight:700,color:"#F0F4F8"}}>{sobre.nombre}</span>
            {sobre.tarjeta_id&&<Pill color={sobre.fuente_color} sm>{sobre.tarjeta_id.toUpperCase()}</Pill>}
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <Pill color={sobre.fuente_color} sm>{sobre.fuente}</Pill>
            <Pill color={catColor[sobre.categoria]||"#7A8899"} sm>{catIcon[sobre.categoria]} {sobre.categoria}</Pill>
          </div>
        </div>
        <button onClick={()=>onEdit(sobre)} style={{background:"#1A2030",border:"1px solid #2A3545",borderRadius:8,color:"#7A8899",padding:"4px 8px",cursor:"pointer",fontSize:12,marginLeft:8}}>✏️</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
        {[{l:"Asignado",v:$$(Number(sobre.monto_asignado)),c:"#8A9AAA"},{l:"Gastado",v:$$(Number(sobre.monto_gastado)),c:p>=80?"#E84A4A":"#E8924A"},{l:"Disponible",v:agotado?"AGOTADO":$$(disp),c:agotado?"#E84A4A":"#4AE8A0"}].map((x,i)=>(
          <div key={i}><div style={{fontSize:10,color:"#5A6878",marginBottom:2}}>{x.l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:i===2?14:13,fontWeight:700,color:x.c}}>{x.v}</div></div>
        ))}
      </div>
      <BarG gastado={Number(sobre.monto_gastado)} asignado={Number(sobre.monto_asignado)}/>
      <button onClick={()=>onGasto(sobre)} style={{width:"100%",marginTop:12,background:agotado?"#2A1010":sobre.fuente_color+"22",border:`1px solid ${agotado?"#E84A4A44":sobre.fuente_color+"55"}`,borderRadius:10,color:agotado?"#E84A4A":sobre.fuente_color,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600}}>
        {agotado?"⚠️ Sobre agotado — registrar igualmente":"+ Registrar gasto de este sobre"}
      </button>
    </div>
  );
}

function ModalGasto({sobre,onSave,onClose}){
  const [monto,setMonto]=useState("");
  const [desc,setDesc]=useState("");
  const [metodo,setMetodo]=useState("tarjeta");
  const [saving,setSaving]=useState(false);
  const guardar=async()=>{ if(!monto||isNaN(Number(monto)))return; setSaving(true); await onSave(sobre,Number(monto),desc,metodo); setSaving(false); };
  return(
    <div style={{position:"fixed",inset:0,background:"#000C",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:"#0D1117",borderRadius:"20px 20px 0 0",border:"1px solid #1E2530",padding:"24px 20px 36px",width:"100%",maxWidth:480,borderTop:`3px solid ${sobre.fuente_color}`}}>
        <div style={{width:40,height:4,background:"#2A3545",borderRadius:99,margin:"0 auto 20px"}}/>
        <div style={{fontSize:16,fontWeight:700,marginBottom:4}}>{sobre.nombre}</div>
        <div style={{fontSize:12,color:"#5A6878",marginBottom:20}}>Disponible: <span style={{color:"#4AE8A0",fontWeight:700}}>{$$(Math.max(0,Number(sobre.monto_asignado)-Number(sobre.monto_gastado)))}</span> · {sobre.fuente}</div>
        <div style={{background:"#131920",border:"1px solid #2A3545",borderRadius:14,padding:"16px 18px",marginBottom:14,textAlign:"center"}}>
          <div style={{fontSize:11,color:"#5A6878",marginBottom:6}}>MONTO (DOP)</div>
          <input autoFocus type="number" inputMode="numeric" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0" style={{background:"transparent",border:"none",fontFamily:"'DM Mono',monospace",fontSize:40,fontWeight:700,color:sobre.fuente_color,textAlign:"center",width:"100%"}}/>
        </div>
        <input type="text" value={desc} onChange={e=>setDesc(e.target.value)} placeholder="¿En qué? (Super Nacional, Farmacia, Gasolina...)" style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:12,padding:"12px 14px",color:"#F0F4F8",fontSize:14,marginBottom:14}}/>
        <div style={{display:"flex",gap:8,marginBottom:18}}>
          {["tarjeta","efectivo","transferencia"].map(m=>(
            <button key={m} onClick={()=>setMetodo(m)} style={{flex:1,background:metodo===m?sobre.fuente_color+"33":"#131920",border:`1px solid ${metodo===m?sobre.fuente_color:"#2A3545"}`,borderRadius:10,color:metodo===m?sobre.fuente_color:"#5A6878",padding:"8px 4px",cursor:"pointer",fontSize:11,fontWeight:600,textTransform:"capitalize"}}>{m}</button>
          ))}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={guardar} disabled={saving} style={{flex:2,background:sobre.fuente_color,border:"none",borderRadius:12,color:"#000",fontWeight:700,padding:"15px",cursor:"pointer",fontSize:16}}>{saving?"Guardando...":"✓ Registrar"}</button>
          <button onClick={onClose} style={{flex:1,background:"#1A2030",border:"1px solid #2A3545",borderRadius:12,color:"#7A8899",padding:"15px",cursor:"pointer",fontSize:14}}>Cancelar</button>
        </div>
      </div>
    </div>
  );
}

function ModalEditSobre({sobre,onSave,onClose}){
  const [v,setV]=useState({...sobre});
  return(
    <div style={{position:"fixed",inset:0,background:"#000C",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
      <Card style={{width:"100%",maxWidth:380}}>
        <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>Editar · {sobre.nombre}</div>
        {[{k:"nombre",l:"Nombre",t:"text"},{k:"monto_asignado",l:"Monto asignado",t:"number"},{k:"monto_gastado",l:"Gastado (corrección)",t:"number"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}>
            <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>{f.l}</div>
            <input type={f.t} value={v[f.k]||""} onChange={e=>setV({...v,[f.k]:f.t==="number"?parseFloat(e.target.value)||0:e.target.value})} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px 12px",color:"#F0F4F8",fontSize:14}}/>
          </div>
        ))}
        <div style={{marginBottom:16}}>
          <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Categoría</div>
          <select value={v.categoria} onChange={e=>setV({...v,categoria:e.target.value})} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px 12px",color:"#F0F4F8",fontSize:13}}>
            {Object.entries(catIcon).map(([k,ic])=><option key={k} value={k}>{ic} {k}</option>)}
          </select>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>onSave(v)} style={{flex:1,background:"#4A9AE8",border:"none",borderRadius:10,color:"#000",fontWeight:700,padding:12,cursor:"pointer",fontSize:14}}>Guardar</button>
          <button onClick={onClose} style={{flex:1,background:"#1A2030",border:"1px solid #2A3545",borderRadius:10,color:"#7A8899",padding:12,cursor:"pointer",fontSize:14}}>Cancelar</button>
        </div>
      </Card>
    </div>
  );
}

export default function App(){
  const [tab,setTab]=useState("sobres");
  const [mes,setMes]=useState("2026-06");
  const [quinc,setQuinc]=useState(1);
  const [sobres,setSobres]=useState([]);
  const [gastos,setGastos]=useState([]);
  const [tarjetas,setTarj]=useState([]);
  const [loading,setLoad]=useState(true);
  const [error,setErr]=useState(null);
  const [modalGasto,setModalGasto]=useState(null);
  const [modalEdit,setModalEdit]=useState(null);
  const [showAdd,setShowAdd]=useState(false);
  const [saved,setSaved]=useState(false);
  const [newS,setNewS]=useState({nombre:"",fuente:"ETED 1°",fuente_color:"#4AE8A0",tarjeta_id:"",monto_asignado:0,categoria:"hogar"});

  const flash=()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);};

  const load=useCallback(async()=>{
    setLoad(true);setErr(null);
    try{
      const [s,g,t]=await Promise.all([db.get("sobres","order=quincena,orden"),db.get("gastos","order=created_at.desc&limit=100"),db.get("tarjetas","order=nombre")]);
      setSobres(s);setGastos(g);setTarj(t);
    }catch(e){setErr(e.message);}
    setLoad(false);
  },[]);

  useEffect(()=>{load();},[load]);

  const sf=sobres.filter(s=>s.mes===mes&&s.quincena===quinc);
  const tA=sf.reduce((a,s)=>a+Number(s.monto_asignado),0);
  const tG=sf.reduce((a,s)=>a+Number(s.monto_gastado),0);
  const fuentes=[...new Set(sf.map(s=>s.fuente))];

  const registrarGasto=async(sobre,monto,desc,metodo)=>{
    const ng=Number(sobre.monto_gastado)+monto;
    await db.patch("sobres",`id=eq.${sobre.id}`,{monto_gastado:ng,updated_at:new Date().toISOString()});
    await db.post("gastos",{sobre_id:sobre.id,descripcion:desc||sobre.nombre,monto,metodo_pago:metodo,tarjeta_id:sobre.tarjeta_id||null,fecha:new Date().toISOString()});
    if(sobre.tarjeta_id&&metodo==="tarjeta"){
      const t=tarjetas.find(x=>x.id===sobre.tarjeta_id);
      if(t)await db.patch("tarjetas",`id=eq.${t.id}`,{saldo:Number(t.saldo)+monto,updated_at:new Date().toISOString()});
    }
    setSobres(prev=>prev.map(s=>s.id===sobre.id?{...s,monto_gastado:ng}:s));
    setModalGasto(null);flash();
    const g=await db.get("gastos","order=created_at.desc&limit=100");
    setGastos(g);
  };

  const editarSobre=async(v)=>{
    await db.patch("sobres",`id=eq.${v.id}`,{nombre:v.nombre,monto_asignado:v.monto_asignado,monto_gastado:v.monto_gastado,categoria:v.categoria,updated_at:new Date().toISOString()});
    setSobres(prev=>prev.map(s=>s.id===v.id?{...s,...v}:s));
    setModalEdit(null);flash();
  };

  const agregarSobre=async()=>{
    const [c]=await db.post("sobres",{...newS,mes,quincena:quinc,orden:sf.length+1});
    setSobres(prev=>[...prev,c]);setShowAdd(false);
    setNewS({nombre:"",fuente:"ETED 1°",fuente_color:"#4AE8A0",tarjeta_id:"",monto_asignado:0,categoria:"hogar"});
    flash();
  };

  const TABS=[{id:"sobres",l:"💼 Sobres"},{id:"resumen",l:"📊 Mes"},{id:"historial",l:"📋 Historial"},{id:"tarjetas",l:"💳 Tarjetas"}];

  if(error)return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",height:"100vh",background:"#080C10",gap:16,padding:20}}><div style={{fontSize:32}}>⚠️</div><div style={{color:"#E84A4A",fontSize:13,textAlign:"center"}}>{error}</div><div style={{color:"#5A6878",fontSize:12,textAlign:"center",maxWidth:340}}>Ejecuta el SQL en Supabase primero, luego recarga.</div><button onClick={load} style={{background:"#4A9AE8",border:"none",borderRadius:10,color:"#000",padding:"10px 24px",cursor:"pointer",fontWeight:700}}>Reintentar</button></div>);

  return(
    <div style={{minHeight:"100vh",background:"#080C10",fontFamily:"'Inter',system-ui,sans-serif",color:"#F0F4F8",maxWidth:600,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{outline:none}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:#2A3545;border-radius:2px}button:active{opacity:.8;transform:scale(.98)}`}</style>

      {/* HEADER */}
      <div style={{background:"#0A0F16",borderBottom:"1px solid #1A2030",padding:"14px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:500}}>RANIERO · FINANZAS</div>
            <div style={{fontSize:10,color:"#3A5A7A",marginTop:1,fontFamily:"'DM Mono',monospace"}}>{MES_L[mes]} · Q{quinc} · {new Date().toLocaleDateString("es-DO",{day:"numeric",month:"short"})}</div>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {saved&&<Pill color="#4AE8A0" sm>✓ Guardado</Pill>}
            {loading&&<Pill color="#E8924A" sm>⟳</Pill>}
            <button onClick={load} style={{background:"#1A2030",border:"1px solid #2A3545",borderRadius:8,color:"#7A8899",padding:"5px 9px",cursor:"pointer",fontSize:12}}>↻</button>
          </div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <select value={mes} onChange={e=>setMes(e.target.value)} style={{flex:1,background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"8px 12px",color:"#F0F4F8",fontSize:13}}>
            {MESES.map(m=><option key={m} value={m}>{MES_L[m]} 2026</option>)}
          </select>
          <div style={{display:"flex",gap:4,background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:3}}>
            {[1,2].map(q=><button key={q} onClick={()=>setQuinc(q)} style={{background:quinc===q?"#2A3545":"transparent",border:"none",borderRadius:8,color:quinc===q?"#F0F4F8":"#5A6878",padding:"6px 16px",cursor:"pointer",fontSize:13,fontWeight:quinc===q?600:400}}>Q{q}</button>)}
          </div>
        </div>
      </div>

      {/* TABS */}
      <div style={{background:"#0A0F16",borderBottom:"1px solid #1A2030",display:"flex"}}>
        {TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #4A9AE8":"2px solid transparent",color:tab===t.id?"#4A9AE8":"#5A6878",padding:"10px 4px",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400,whiteSpace:"nowrap"}}>{t.l}</button>)}
      </div>

      <div style={{padding:16}}>

        {/* ═══ SOBRES ═══ */}
        {tab==="sobres"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:16}}>
              {[{l:"Asignado",v:$$(tA),c:"#4A9AE8"},{l:"Gastado",v:$$(tG),c:tG>tA*0.9?"#E84A4A":"#E8924A"},{l:"Disponible",v:$$(tA-tG),c:tA-tG<0?"#E84A4A":"#4AE8A0"}].map((k,i)=>(
                <Card key={i} style={{padding:"12px 14px"}}>
                  <div style={{fontSize:10,color:"#5A6878",marginBottom:3}}>{k.l}</div>
                  <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,fontWeight:700,color:k.c,lineHeight:1}}>{k.v}</div>
                </Card>
              ))}
            </div>
            {loading?(<div style={{textAlign:"center",color:"#3A4A5A",padding:"40px 0",fontSize:13}}>Cargando sobres...</div>):
            sf.length===0?(<div style={{textAlign:"center",padding:"40px 0"}}><div style={{fontSize:32,marginBottom:12}}>💼</div><div style={{color:"#5A6878",fontSize:14,marginBottom:16}}>No hay sobres para {MES_L[mes]} Q{quinc}</div><button onClick={()=>setShowAdd(true)} style={{background:"#4A9AE833",border:"1px solid #4A9AE855",borderRadius:12,color:"#4A9AE8",padding:"10px 24px",cursor:"pointer",fontSize:14,fontWeight:600}}>+ Crear primer sobre</button></div>):(
            <>
              {fuentes.map(fuente=>{
                const sFuente=sf.filter(s=>s.fuente===fuente);
                const fA=sFuente.reduce((a,s)=>a+Number(s.monto_asignado),0);
                const fG=sFuente.reduce((a,s)=>a+Number(s.monto_gastado),0);
                const fC=sFuente[0]?.fuente_color||"#7A8899";
                return(
                  <div key={fuente} style={{marginBottom:20}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10,padding:"8px 12px",background:fC+"11",borderRadius:10,border:`1px solid ${fC}33`}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <div style={{width:10,height:10,borderRadius:99,background:fC}}/>
                        <span style={{fontWeight:700,fontSize:14,color:fC}}>{fuente}</span>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:fC}}>{$$(fA)}</div>
                        <div style={{fontSize:10,color:"#5A6878"}}>gastado {$$(fG)} · disp {$$(fA-fG)}</div>
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:10}}>
                      {sFuente.map(s=><SobreCard key={s.id} sobre={s} onGasto={setModalGasto} onEdit={setModalEdit}/>)}
                    </div>
                  </div>
                );
              })}
              <button onClick={()=>setShowAdd(true)} style={{width:"100%",background:"#131920",border:"1px dashed #2A3545",borderRadius:12,color:"#5A6878",padding:"12px",cursor:"pointer",fontSize:13,marginTop:8}}>+ Agregar sobre</button>
            </>
            )}
          </div>
        )}

        {/* ═══ RESUMEN MES ═══ */}
        {tab==="resumen"&&(
          <div>
            {[1,2].map(q=>{
              const qs=sobres.filter(s=>s.mes===mes&&s.quincena===q);
              if(!qs.length)return null;
              const qa=qs.reduce((a,s)=>a+Number(s.monto_asignado),0);
              const qg=qs.reduce((a,s)=>a+Number(s.monto_gastado),0);
              return(
                <Card key={q} style={{marginBottom:14}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                    <span style={{fontWeight:700,fontSize:15}}>Quincena {q}</span>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"'DM Mono',monospace",fontSize:16,fontWeight:700,color:qg>qa?"#E84A4A":"#4AE8A0"}}>{$$(qa-qg)} disp.</div>
                      <div style={{fontSize:11,color:"#5A6878"}}>{$$(qg)} de {$$(qa)}</div>
                    </div>
                  </div>
                  <BarG gastado={qg} asignado={qa} h={10}/>
                  <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:"#5A6878"}}><span>{pct(qg,qa).toFixed(0)}% ejecutado</span><span>Varianza: {$$(qa-qg)}</span></div>
                  <div style={{marginTop:12}}>
                    {Object.keys(catIcon).map(cat=>{
                      const cs=qs.filter(s=>s.categoria===cat);
                      if(!cs.length)return null;
                      const ca=cs.reduce((a,s)=>a+Number(s.monto_asignado),0);
                      const cg=cs.reduce((a,s)=>a+Number(s.monto_gastado),0);
                      return(
                        <div key={cat} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #141C24"}}>
                          <div style={{display:"flex",gap:8,alignItems:"center"}}><span style={{fontSize:14}}>{catIcon[cat]}</span><span style={{fontSize:13,textTransform:"capitalize"}}>{cat}</span></div>
                          <div style={{display:"flex",gap:12,alignItems:"center"}}>
                            <span style={{fontSize:12,color:"#5A6878"}}>{$$(ca)}</span>
                            <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:cg>ca?"#E84A4A":"#4AE8A0"}}>{$$(cg)}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
            {/* Totales del mes */}
            <Card>
              <div style={{fontWeight:700,fontSize:14,marginBottom:12}}>Total {MES_L[mes]}</div>
              {[1,2].flatMap(q=>{
                const qs=sobres.filter(s=>s.mes===mes&&s.quincena===q);
                return fuentes.length?[...new Set(qs.map(s=>s.fuente))].map(fuente=>{
                  const fs=qs.filter(s=>s.fuente===fuente);
                  const fa=fs.reduce((a,s)=>a+Number(s.monto_asignado),0);
                  const fg=fs.reduce((a,s)=>a+Number(s.monto_gastado),0);
                  const fc=fs[0]?.fuente_color||"#7A8899";
                  return(<div key={`${q}-${fuente}`} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #141C24"}}>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}><div style={{width:8,height:8,borderRadius:99,background:fc}}/><span style={{fontSize:13}}>{fuente} (Q{q})</span></div>
                    <div style={{textAlign:"right"}}>
                      <span style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:600,color:fg>fa?"#E84A4A":"#4AE8A0"}}>{$$(fg)}</span>
                      <span style={{fontSize:11,color:"#5A6878"}}> / {$$(fa)}</span>
                    </div>
                  </div>);
                }):[];
              })}
            </Card>
          </div>
        )}

        {/* ═══ HISTORIAL ═══ */}
        {tab==="historial"&&(
          <div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#5A6878",letterSpacing:"0.12em",textTransform:"uppercase",marginBottom:14}}>Últimos movimientos</div>
            {gastos.length===0?(<div style={{textAlign:"center",color:"#3A4A5A",padding:"40px 0",fontSize:13}}>Sin gastos registrados aún</div>):
            gastos.map(g=>{
              const s=sobres.find(x=>x.id===g.sobre_id);
              return(<div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 4px",borderBottom:"1px solid #141C24"}}>
                <div style={{flex:1,marginRight:12}}>
                  <div style={{fontSize:13,fontWeight:500}}>{g.descripcion}</div>
                  <div style={{fontSize:11,color:"#5A6878",marginTop:2}}>
                    {new Date(g.fecha).toLocaleDateString("es-DO",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}
                    {s&&<span style={{color:s.fuente_color||"#7A8899"}}> · {s.nombre}</span>}
                    {" · "}{g.metodo_pago}
                  </div>
                </div>
                <div style={{fontFamily:"'DM Mono',monospace",fontSize:15,fontWeight:700,color:"#E84A4A",whiteSpace:"nowrap"}}>{$$(Number(g.monto))}</div>
              </div>);
            })}
          </div>
        )}

        {/* ═══ TARJETAS ═══ */}
        {tab==="tarjetas"&&(
          <div>
            {tarjetas.map(t=>{
              const p=pct(Number(t.saldo),Number(t.limite));
              const c=p>=80?"#E84A4A":p>=60?"#E8924A":"#4AE8A0";
              return(<Card key={t.id} style={{marginBottom:12,borderLeft:`3px solid ${t.color}`}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}>
                  <div><div style={{fontWeight:700,fontSize:15}}>{t.nombre}</div><div style={{fontSize:11,color:"#5A6878",marginTop:2}}>{t.nota}</div></div>
                  <Pill color={t.color} sm>{t.cashback}% CB</Pill>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[{l:"Saldo",v:$$(Number(t.saldo)),c:"#E84A4A"},{l:"Disponible",v:$$(Number(t.limite)-Number(t.saldo)),c:"#4AE8A0"},{l:"Mínimo",v:$$(Number(t.minimo)),c:"#E8924A"}].map((x,i)=>(
                    <div key={i}><div style={{fontSize:10,color:"#5A6878"}}>{x.l}</div><div style={{fontFamily:"'DM Mono',monospace",fontSize:13,fontWeight:700,color:x.c}}>{x.v}</div></div>
                  ))}
                </div>
                <BarG gastado={Number(t.saldo)} asignado={Number(t.limite)} h={6}/>
                <div style={{fontSize:10,color:c,textAlign:"right",marginTop:3}}>{p.toFixed(0)}% usado</div>
              </Card>);
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      {tab==="sobres"&&sf.length>0&&(
        <div style={{position:"fixed",bottom:28,right:20,zIndex:90}}>
          <button onClick={()=>{const s=sf.find(s=>Number(s.monto_asignado)>Number(s.monto_gastado));if(s)setModalGasto(s);}} style={{background:"#4A9AE8",border:"none",borderRadius:99,width:64,height:64,fontSize:30,cursor:"pointer",boxShadow:"0 4px 24px #4A9AE866",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
      )}

      {/* MODALES */}
      {modalGasto&&<ModalGasto sobre={modalGasto} onSave={registrarGasto} onClose={()=>setModalGasto(null)}/>}
      {modalEdit&&<ModalEditSobre sobre={modalEdit} onSave={editarSobre} onClose={()=>setModalEdit(null)}/>}

      {/* MODAL AGREGAR SOBRE */}
      {showAdd&&(
        <div style={{position:"fixed",inset:0,background:"#000C",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
          <Card style={{width:"100%",maxWidth:480,borderRadius:"20px 20px 0 0",padding:"24px 20px 36px",borderTop:"3px solid #4A9AE8"}}>
            <div style={{width:40,height:4,background:"#2A3545",borderRadius:99,margin:"0 auto 20px"}}/>
            <div style={{fontWeight:700,fontSize:16,marginBottom:20}}>Nuevo sobre · {MES_L[mes]} Q{quinc}</div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Nombre del sobre</div>
              <input type="text" value={newS.nombre} onChange={e=>setNewS({...newS,nombre:e.target.value})} placeholder="Ej: Alimentación, Abono EDESUR..." style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px 12px",color:"#F0F4F8",fontSize:14}}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
              <div>
                <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Fuente</div>
                <select value={newS.fuente} onChange={e=>{const cs={"ETED 1°":"#4AE8A0","CNE":"#E8924A","ETED 2°":"#A04AE8","MEM":"#E8C44A"};setNewS({...newS,fuente:e.target.value,fuente_color:cs[e.target.value]||"#7A8899"});}} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px",color:"#F0F4F8",fontSize:13}}>
                  {["ETED 1°","CNE","ETED 2°","MEM"].map(f=><option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Monto (DOP)</div>
                <input type="number" value={newS.monto_asignado||""} onChange={e=>setNewS({...newS,monto_asignado:parseFloat(e.target.value)||0})} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px",color:"#F0F4F8",fontSize:14,fontFamily:"'DM Mono',monospace"}}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
              <div>
                <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Categoría</div>
                <select value={newS.categoria} onChange={e=>setNewS({...newS,categoria:e.target.value})} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px",color:"#F0F4F8",fontSize:13}}>
                  {Object.entries(catIcon).map(([k,v])=><option key={k} value={k}>{v} {k}</option>)}
                </select>
              </div>
              <div>
                <div style={{fontSize:11,color:"#7A8899",marginBottom:5}}>Tarjeta (opcional)</div>
                <select value={newS.tarjeta_id} onChange={e=>setNewS({...newS,tarjeta_id:e.target.value})} style={{width:"100%",background:"#131920",border:"1px solid #2A3545",borderRadius:10,padding:"10px",color:"#F0F4F8",fontSize:13}}>
                  <option value="">Ninguna</option>
                  {tarjetas.map(t=><option key={t.id} value={t.id}>{t.nombre}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"flex",gap:10}}>
              <button onClick={agregarSobre} style={{flex:2,background:"#4A9AE8",border:"none",borderRadius:12,color:"#000",fontWeight:700,padding:14,cursor:"pointer",fontSize:15}}>Crear sobre</button>
              <button onClick={()=>setShowAdd(false)} style={{flex:1,background:"#1A2030",border:"1px solid #2A3545",borderRadius:12,color:"#7A8899",padding:14,cursor:"pointer",fontSize:14}}>Cancelar</button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
