import { useState, useEffect, useCallback } from "react";

const SB = "https://gxhdxbabjqmyldbctwoy.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGR4YmFianFteWxkYmN0d295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTcyOTMsImV4cCI6MjA5NTYzMzI5M30.xq_HSa1s1qjECPvC9lpH0ikjGnkZFoJeYzF4i_epr6Y";
const H = { "apikey": SK, "Authorization": `Bearer ${SK}`, "Content-Type": "application/json", "Prefer": "return=representation" };

const api = {
  get: async (t, q="") => { try { const r=await fetch(`${SB}/rest/v1/${t}?${q}`,{headers:H}); if(!r.ok)return[]; return r.json(); } catch{return[];} },
  post: async (t, b) => { try { const r=await fetch(`${SB}/rest/v1/${t}`,{method:"POST",headers:H,body:JSON.stringify(b)}); if(!r.ok)return null; const d=await r.json(); return Array.isArray(d)?d[0]:d; } catch{return null;} },
  patch: async (t, f, b) => { try { const r=await fetch(`${SB}/rest/v1/${t}?${f}`,{method:"PATCH",headers:H,body:JSON.stringify(b)}); if(!r.ok)return null; return r.json(); } catch{return null;} },
  del: async (t, f) => { try { await fetch(`${SB}/rest/v1/${t}?${f}`,{method:"DELETE",headers:H}); } catch{} },
};

const D = n => `RD$${new Intl.NumberFormat("es-DO").format(Math.round(Math.abs(n||0)))}`;
const pct = (a,b) => b>0?Math.min(100,(a/b)*100):0;

// ── Configuración base ─────────────────────────────────────────────
const INIT = {
  tc: 61.4, mes: "Septiembre",
  fuentes: [
    { id:"eted1", nombre:"ETED 1°",   color:"#2DD4BF", monto:110000, credito:15335 },
    { id:"mem",   nombre:"MEM",        color:"#60A5FA", monto:61200,  credito:0 },
    { id:"cne",   nombre:"CNE",        color:"#F97316", monto:140000, credito:0 },
    { id:"eted2", nombre:"ETED 2°",    color:"#A78BFA", monto:90000,  credito:0 },
    { id:"fs",    nombre:"Cliente FS", color:"#34D399", monto:120000, credito:0 },
  ],
  // tarjeta: null = pago directo (efectivo/transferencia)
  sobres: [
    { id:"s1",  fuente:"eted1", concepto:"Colegio (hija mayor)", categoria:"educacion",    monto:27500,  tarjeta:null },
    { id:"s2",  fuente:"eted1", concepto:"Alquiler/Hipoteca",    categoria:"vivienda",     monto:36600,  tarjeta:null },
    { id:"s3",  fuente:"eted1", concepto:"Social",               categoria:"social",       monto:8000,   tarjeta:null },
    { id:"s4",  fuente:"eted1", concepto:"Salud",                categoria:"salud",        monto:10000,  tarjeta:null },
    { id:"s5",  fuente:"eted1", concepto:"Imprevistos",          categoria:"social",       monto:2500,   tarjeta:null },
    { id:"s6",  fuente:"eted1", concepto:"Reservas",             categoria:"ahorro",       monto:10000,  tarjeta:null },
    { id:"s7",  fuente:"eted1", concepto:"Pago hipotecario",     categoria:"vivienda",     monto:170465, tarjeta:null },
    { id:"s8",  fuente:"cne",   concepto:"Alimentación",         categoria:"alimentacion", monto:13500,  tarjeta:"visapremia" },
    { id:"s9",  fuente:"cne",   concepto:"Mantenimiento apto",   categoria:"vivienda",     monto:17045,  tarjeta:"banres" },
    { id:"s10", fuente:"eted2", concepto:"Alimentación 1",       categoria:"alimentacion", monto:18500,  tarjeta:"visapremia" },
    { id:"s11", fuente:"eted2", concepto:"Electricidad",         categoria:"servicios",    monto:12000,  tarjeta:"edesur" },
    { id:"s12", fuente:"eted2", concepto:"Alimentación 2",       categoria:"alimentacion", monto:8000,   tarjeta:"visapremia" },
    { id:"s13", fuente:"eted2", concepto:"Yeli",                 categoria:"salud",        monto:17000,  tarjeta:null },
    { id:"s14", fuente:"eted2", concepto:"Valentina (colegio)",  categoria:"educacion",    monto:6000,   tarjeta:null },
    { id:"s15", fuente:"eted2", concepto:"LUMURI Recrea (tanda)",categoria:"educacion",    monto:10000,  tarjeta:"bravo" },
  ],
  tarjetas: [
    { id:"edesur",     nombre:"EDESUR BHD Master",   color:"#EF4444", saldo:0,     presup:12000, cashback:0.05, tipo:"servicio" },
    { id:"visapremia", nombre:"Visa Premia BHD",     color:"#F97316", saldo:88421, presup:21500, cashback:0.05, tipo:"mercado" },
    { id:"bravo",      nombre:"Bravo BSC Visa",      color:"#A78BFA", saldo:45323, presup:46000, cashback:0.07, tipo:"cashback" },
    { id:"banres",     nombre:"Banreservas MC",      color:"#60A5FA", saldo:64203, presup:30500, cashback:0,    tipo:"corriente" },
    { id:"promerica",  nombre:"Promerica Visa Gold", color:"#34D399", saldo:0,     presup:0,     cashback:0,    tipo:"liquidada" },
  ],
  extracredito: { saldo:45077, abono:2500 },
};

const CATS = {
  vivienda:     { icon:"🏠", label:"Vivienda",        color:"#EF4444" },
  educacion:    { icon:"📚", label:"Educación",        color:"#8B5CF6" },
  alimentacion: { icon:"🍽️",  label:"Alimentación",    color:"#10B981" },
  salud:        { icon:"💊", label:"Salud",            color:"#EC4899" },
  servicios:    { icon:"🔌", label:"Servicios",        color:"#6366F1" },
  social:       { icon:"🎉", label:"Social/Imprev.",   color:"#14B8A6" },
  ahorro:       { icon:"💰", label:"Ahorro",           color:"#22C55E" },
};

const MESES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const T = { bg:"#09090B", surf:"#18181B", bord:"#27272A", text:"#FAFAFA", muted:"#71717A", sub:"#3F3F46" };

// ── Micro UI ───────────────────────────────────────────────────────
const Bar = ({v,max,color,h=6}) => (
  <div style={{background:T.sub,borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${pct(v,max)}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}}/>
  </div>
);
const Chip = ({color,children,sm}) => (
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:sm?"1px 7px":"3px 10px",fontSize:sm?10:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>
);
const Card = ({children,style={},accent}) => (
  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:14,padding:16,borderLeft:accent?`3px solid ${accent}`:undefined,...style}}>{children}</div>
);
const Lbl = ({children}) => (
  <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{children}</div>
);

// ── Modal gasto rápido ─────────────────────────────────────────────
function ModalGasto({sobre, fuente, tarjetaNombre, onSave, onClose}) {
  const [desc,setDesc]=useState("");
  const [monto,setMonto]=useState("");
  const [fecha,setFecha]=useState(new Date().toISOString().slice(0,10));
  const [saving,setSaving]=useState(false);
  const disponible = sobre.monto - (sobre.ejecutado||0);

  const guardar = async () => {
    if(!monto||!desc) return;
    setSaving(true);
    await onSave({sobre_id:sobre.id,descripcion:desc,monto:parseFloat(monto),fecha,fuente:fuente.id,categoria:sobre.categoria,tarjeta:sobre.tarjeta});
    setSaving(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"#000D",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:T.surf,borderRadius:"20px 20px 0 0",borderTop:`3px solid ${fuente.color}`,padding:"24px 20px 44px",width:"100%",maxWidth:520}}>
        <div style={{width:36,height:3,background:T.sub,borderRadius:99,margin:"0 auto 20px"}}/>
        <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{sobre.concepto}</div>
        <div style={{fontSize:11,color:T.muted,marginBottom:4}}>
          Disponible: <span style={{color:"#22C55E",fontWeight:700}}>{D(disponible)}</span>
        </div>
        {sobre.tarjeta && (
          <div style={{marginBottom:16}}>
            <Chip color={fuente.color} sm>💳 Se carga a: {tarjetaNombre}</Chip>
          </div>
        )}

        <div style={{background:T.bg,border:`1px solid ${T.bord}`,borderRadius:14,padding:16,marginBottom:14,textAlign:"center"}}>
          <Lbl>Monto (DOP)</Lbl>
          <input type="number" inputMode="numeric" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0" autoFocus
            style={{background:"transparent",border:"none",fontFamily:"monospace",fontSize:40,fontWeight:700,color:fuente.color,textAlign:"center",width:"100%",outline:"none"}}/>
        </div>

        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="¿En qué? (supermercado, farmacia...)"
          style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:12,padding:"12px 14px",color:T.text,fontSize:14,marginBottom:10,outline:"none"}}/>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
          style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:12,padding:"10px 14px",color:T.muted,fontSize:13,marginBottom:18,outline:"none"}}/>

        <div style={{display:"flex",gap:10}}>
          <button onClick={guardar} disabled={saving} style={{flex:2,background:fuente.color,border:"none",borderRadius:12,color:"#000",fontWeight:700,padding:14,cursor:"pointer",fontSize:16}}>
            {saving?"Guardando...":"✓ Registrar"}
          </button>
          <button onClick={onClose} style={{flex:1,background:T.bg,border:`1px solid ${T.bord}`,borderRadius:12,color:T.muted,padding:14,cursor:"pointer",fontSize:14}}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sobre card expandible ──────────────────────────────────────────
function SobreCard({sobre,fuente,gastosList,tarjeta,onRegistrar,onEliminar}) {
  const [open,setOpen]=useState(false);
  const cat=CATS[sobre.categoria];
  const ejecutado=gastosList.reduce((s,g)=>s+Number(g.monto),0);
  const disponible=sobre.monto-ejecutado;
  const agotado=disponible<=0;
  const p=pct(ejecutado,sobre.monto);
  const barColor=p>=100?"#EF4444":p>=80?"#F97316":p>=50?"#F59E0B":fuente.color;

  return (
    <div style={{background:agotado?"#EF444408":T.surf,border:`1px solid ${agotado?"#EF444433":T.bord}`,borderRadius:14,marginBottom:8,overflow:"hidden"}}>
      {/* Header */}
      <div style={{padding:"14px 16px",cursor:"pointer"}} onClick={()=>setOpen(!open)}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{flex:1}}>
            <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
              <span style={{fontSize:14,fontWeight:700}}>{sobre.concepto}</span>
              <Chip color={cat?.color||"#888"} sm>{cat?.icon} {cat?.label}</Chip>
            </div>
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
              <Chip color={fuente.color} sm>{fuente.nombre}</Chip>
              {tarjeta && <Chip color={tarjeta.color} sm>💳 {tarjeta.nombre}</Chip>}
              {gastosList.length>0 && <Chip color={T.muted} sm>{gastosList.length} movs.</Chip>}
            </div>
          </div>
          <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
            <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:agotado?"#EF4444":"#22C55E"}}>
              {agotado?"AGOTADO":D(disponible)}
            </div>
            <div style={{fontSize:10,color:T.muted}}>de {D(sobre.monto)}</div>
          </div>
        </div>
        <Bar v={ejecutado} max={sobre.monto} color={barColor} h={6}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:4,fontSize:10,color:T.muted}}>
          <span>{D(ejecutado)} gastado · {p.toFixed(0)}%</span>
          <span>{open?"▲":"▼"}</span>
        </div>
      </div>

      {/* Detalle */}
      {open && (
        <div style={{borderTop:`1px solid ${T.bord}`}}>
          {gastosList.length===0 ? (
            <div style={{padding:"16px",textAlign:"center",color:T.muted,fontSize:13}}>Sin gastos registrados</div>
          ) : (
            <div style={{padding:"0 16px"}}>
              {gastosList.map(g=>(
                <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.bord}`}}>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{g.descripcion}</div>
                    <div style={{fontSize:10,color:T.muted}}>
                      {new Date(g.fecha).toLocaleDateString("es-DO",{day:"numeric",month:"short"})}
                      {g.tarjeta && <span style={{color:tarjeta?.color||T.muted}}> · {tarjeta?.nombre}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:"#EF4444"}}>{D(Number(g.monto))}</span>
                    <button onClick={()=>onEliminar(g.id)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:16,padding:"0 4px"}}>×</button>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0",fontWeight:700}}>
                <span style={{fontSize:13}}>Total gastado</span>
                <span style={{fontFamily:"monospace",fontSize:14,color:barColor}}>{D(ejecutado)}</span>
              </div>
            </div>
          )}
          <div style={{padding:"12px 16px",borderTop:`1px solid ${T.bord}`}}>
            <button onClick={()=>onRegistrar({...sobre,ejecutado})} style={{
              width:"100%",background:agotado?"#EF444422":fuente.color+"22",
              border:`1px solid ${agotado?"#EF444455":fuente.color+"55"}`,
              borderRadius:10,color:agotado?"#EF4444":fuente.color,
              padding:"11px",cursor:"pointer",fontSize:13,fontWeight:600,
            }}>
              {agotado?"⚠️ Sobre agotado — registrar igualmente":"+ Registrar gasto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── APP ────────────────────────────────────────────────────────────
export default function App() {
  const [data,setData]=useState(INIT);
  const [tab,setTab]=useState("sobres");
  const [gastos,setGastos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);
  const [modalSobre,setModalSobre]=useState(null);
  const [catActiva,setCatActiva]=useState(null);

  const flash=()=>{setSaved(true);setTimeout(()=>setSaved(false),2500);};

  const cargar=useCallback(async()=>{
    setLoading(true);
    const [cfg,gs]=await Promise.all([
      api.get("panel_raniero","order=id.desc&limit=1"),
      api.get("gastos_raniero","order=fecha.desc"),
    ]);
    if(cfg&&cfg.length>0&&cfg[0].datos){try{setData(JSON.parse(cfg[0].datos));}catch{}}
    setGastos(gs||[]);
    setLoading(false);
  },[]);

  useEffect(()=>{cargar();},[cargar]);

  const guardarConfig=async(nd)=>{
    setData(nd);
    await api.post("panel_raniero",{datos:JSON.stringify(nd),updated_at:new Date().toISOString()});
    flash();
  };

  // Registrar gasto → actualiza tarjeta si aplica
  const registrarGasto=async(gasto)=>{
    const creado=await api.post("gastos_raniero",gasto);
    const g=creado||{...gasto,id:Date.now()};
    setGastos(prev=>[g,...prev]);

    // Si el sobre tiene tarjeta afiliada → subir saldo automáticamente
    if(gasto.tarjeta){
      const clone=JSON.parse(JSON.stringify(data));
      const t=clone.tarjetas.find(t=>t.id===gasto.tarjeta);
      if(t){ t.saldo=Number(t.saldo)+Number(gasto.monto); guardarConfig(clone); }
    } else { flash(); }
    setModalSobre(null);
  };

  const eliminarGasto=async(id)=>{
    // Revertir saldo de tarjeta si aplica
    const g=gastos.find(g=>g.id===id);
    if(g&&g.tarjeta){
      const clone=JSON.parse(JSON.stringify(data));
      const t=clone.tarjetas.find(t=>t.id===g.tarjeta);
      if(t){ t.saldo=Math.max(0,Number(t.saldo)-Number(g.monto)); guardarConfig(clone); }
    }
    await api.del("gastos_raniero",`id=eq.${id}`);
    setGastos(prev=>prev.filter(g=>g.id!==id));
    flash();
  };

  const updSobre=(id,f,v)=>{const c=JSON.parse(JSON.stringify(data));const s=c.sobres.find(s=>s.id===id);if(s){s[f]=v;guardarConfig(c);}};
  const updFuente=(id,f,v)=>{const c=JSON.parse(JSON.stringify(data));const fu=c.fuentes.find(f=>f.id===id);if(fu){fu[f]=v;guardarConfig(c);}};
  const updTarjeta=(id,f,v)=>{const c=JSON.parse(JSON.stringify(data));const t=c.tarjetas.find(t=>t.id===id);if(t){t[f]=v;guardarConfig(c);}};

  // ── Datos calculados ─────────────────────────────────────────────
  const sobreExt=data.sobres.map(s=>({
    ...s,
    ejecutado:gastos.filter(g=>g.sobre_id===s.id).reduce((a,g)=>a+Number(g.monto),0),
    gastos:gastos.filter(g=>g.sobre_id===s.id),
  }));

  const ingresoFijo=data.fuentes.filter(f=>f.id!=="fs").reduce((s,f)=>s+f.monto+f.credito,0);
  const ingresoTotal=data.fuentes.reduce((s,f)=>s+f.monto+f.credito,0);
  const totalPresup=data.sobres.reduce((s,x)=>s+x.monto,0);
  const totalEjec=gastos.reduce((s,g)=>s+Number(g.monto),0);
  const balanceFijo=ingresoFijo-totalPresup;
  const totalDeuda=data.tarjetas.reduce((s,t)=>s+t.saldo,0);
  const totalCB=data.tarjetas.reduce((s,t)=>s+(t.saldo*t.cashback),0);

  // Por categoría
  const porCat=Object.entries(CATS).map(([id,meta])=>({
    id,...meta,
    presup:sobreExt.filter(s=>s.categoria===id).reduce((a,s)=>a+s.monto,0),
    ejec:sobreExt.filter(s=>s.categoria===id).reduce((a,s)=>a+s.ejecutado,0),
    sobres:sobreExt.filter(s=>s.categoria===id),
  })).filter(c=>c.presup>0).sort((a,b)=>b.presup-a.presup);

  const getTarjeta=id=>id?data.tarjetas.find(t=>t.id===id):null;
  const getFuente=id=>data.fuentes.find(f=>f.id===id)||data.fuentes[0];

  const TABS=[
    {id:"sobres",  l:"💼 Sobres"},
    {id:"cats",    l:"📊 Categorías"},
    {id:"tarjetas",l:"💳 Tarjetas"},
    {id:"config",  l:"⚙️ Config"},
  ];

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"'Inter',system-ui,sans-serif",color:T.text,maxWidth:600,margin:"0 auto"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{outline:none}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.sub};border-radius:2px}button:active{opacity:.85;transform:scale(.98)}`}</style>

      {/* Header */}
      <div style={{background:T.surf,borderBottom:`1px solid ${T.bord}`,padding:"14px 16px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div>
            <div style={{fontSize:16,fontWeight:700,letterSpacing:"-0.02em"}}>Raniero Cassoni</div>
            <div style={{fontSize:11,color:T.muted}}>{data.mes} 2026</div>
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {saved&&<Chip color="#22C55E">✓ Guardado</Chip>}
            {loading&&<Chip color="#F59E0B">⟳</Chip>}
            <button onClick={cargar} style={{background:T.sub,border:"none",borderRadius:8,color:T.muted,padding:"5px 10px",cursor:"pointer",fontSize:12}}>↻</button>
          </div>
        </div>
        {/* KPI strip */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            {l:"Ingreso fijo",v:D(ingresoFijo),c:"#22C55E"},
            {l:"Presupuesto",v:D(totalPresup),c:"#F97316"},
            {l:"Ejecutado",v:D(totalEjec),c:totalEjec>totalPresup?"#EF4444":"#60A5FA"},
            {l:"Balance",v:D(Math.abs(balanceFijo)),c:balanceFijo>=0?"#22C55E":"#EF4444"},
          ].map((k,i)=>(
            <div key={i} style={{background:T.bg,borderRadius:10,padding:"8px 6px",textAlign:"center"}}>
              <Lbl>{k.l}</Lbl>
              <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:k.c}}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{background:T.surf,borderBottom:`1px solid ${T.bord}`,display:"flex"}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,background:"transparent",border:"none",borderBottom:tab===t.id?"2px solid #fff":"2px solid transparent",color:tab===t.id?T.text:T.muted,padding:"10px 4px",cursor:"pointer",fontSize:12,fontWeight:tab===t.id?600:400}}>{t.l}</button>
        ))}
      </div>

      <div style={{padding:16}}>

        {/* ══ SOBRES ════════════════════════════════════════════════ */}
        {tab==="sobres"&&(
          <div>
            {data.fuentes.map(fuente=>{
              const sf=sobreExt.filter(s=>s.fuente===fuente.id);
              if(!sf.length)return null;
              const ing=fuente.monto+fuente.credito;
              const pres=sf.reduce((a,s)=>a+s.monto,0);
              const ejec=sf.reduce((a,s)=>a+s.ejecutado,0);
              return(
                <div key={fuente.id} style={{marginBottom:20}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:fuente.color+"15",borderRadius:10,border:`1px solid ${fuente.color}33`,marginBottom:10}}>
                    <div>
                      <span style={{fontWeight:700,color:fuente.color,fontSize:14}}>{fuente.nombre}</span>
                      {fuente.credito>0&&<span style={{fontSize:10,color:T.muted,marginLeft:8}}>+crédito {D(fuente.credito)}</span>}
                    </div>
                    <div style={{textAlign:"right"}}>
                      <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:fuente.color}}>{D(ing)}</div>
                      <div style={{fontSize:10,color:T.muted}}>ejec {D(ejec)} · pres {D(pres)}</div>
                    </div>
                  </div>
                  {sf.map(s=>(
                    <SobreCard key={s.id} sobre={s} fuente={fuente}
                      gastosList={s.gastos}
                      tarjeta={getTarjeta(s.tarjeta)}
                      onRegistrar={setModalSobre}
                      onEliminar={eliminarGasto}/>
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ CATEGORÍAS ════════════════════════════════════════════ */}
        {tab==="cats"&&(
          <div>
            {/* Resumen global */}
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Balance general</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:10,marginBottom:14}}>
                {[
                  {l:"Presupuestado",v:D(totalPresup),c:"#F97316"},
                  {l:"Ejecutado",v:D(totalEjec),c:totalEjec>totalPresup?"#EF4444":"#60A5FA"},
                  {l:"Disponible",v:D(Math.abs(totalPresup-totalEjec)),c:totalPresup-totalEjec>=0?"#22C55E":"#EF4444"},
                ].map((k,i)=>(
                  <div key={i} style={{background:T.bg,borderRadius:10,padding:"10px 8px",textAlign:"center"}}>
                    <Lbl>{k.l}</Lbl>
                    <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:k.c}}>{k.v}</div>
                  </div>
                ))}
              </div>
              <Bar v={totalEjec} max={totalPresup} color={totalEjec>totalPresup?"#EF4444":"#22C55E"} h={10}/>
              <div style={{display:"flex",justifyContent:"space-between",marginTop:6,fontSize:10,color:T.muted}}>
                <span>{pct(totalEjec,totalPresup).toFixed(0)}% ejecutado</span>
                <span>Ing. fijo: {D(ingresoFijo)}</span>
              </div>
            </Card>

            {/* Cards por categoría */}
            {porCat.map(cat=>{
              const activa=catActiva===cat.id;
              const varianza=cat.presup-cat.ejec;
              const p=pct(cat.ejec,cat.presup);
              const barColor=p>=100?"#EF4444":p>=80?"#F97316":cat.color;
              return(
                <div key={cat.id} style={{marginBottom:10}}>
                  <div onClick={()=>setCatActiva(activa?null:cat.id)}
                    style={{background:T.surf,border:`1px solid ${activa?cat.color:T.bord}`,borderRadius:14,padding:16,cursor:"pointer",borderLeft:`3px solid ${cat.color}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:18}}>{cat.icon}</span>
                        <div>
                          <div style={{fontSize:14,fontWeight:700}}>{cat.label}</div>
                          <div style={{fontSize:10,color:T.muted}}>{cat.sobres.length} sobre{cat.sobres.length!==1?"s":""}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:15,fontWeight:700,color:p>=100?"#EF4444":cat.color}}>
                          {D(cat.ejec)}
                        </div>
                        <div style={{fontSize:10,color:T.muted}}>de {D(cat.presup)}</div>
                      </div>
                    </div>
                    {/* Doble barra pres vs ejec */}
                    <div style={{position:"relative",height:8,marginBottom:6}}>
                      <div style={{position:"absolute",inset:0,background:T.sub,borderRadius:99}}/>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct(cat.presup,totalPresup)}%`,background:cat.color+"33",borderRadius:99}}/>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${pct(cat.ejec,cat.presup>0?cat.presup:1)*pct(cat.presup,totalPresup)/100}%`,background:barColor,borderRadius:99}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                      <span style={{color:T.muted}}>{p.toFixed(0)}% ejecutado · {pct(cat.presup,totalPresup).toFixed(0)}% del presupuesto total</span>
                      <span style={{color:varianza>=0?"#22C55E":"#EF4444",fontWeight:600}}>
                        {varianza>=0?"+":""}{D(varianza)} disponible
                      </span>
                    </div>
                  </div>

                  {/* Detalle de sobres de esta categoría */}
                  {activa&&(
                    <div style={{marginTop:6,marginLeft:8}}>
                      {cat.sobres.map(s=>{
                        const fu=getFuente(s.fuente);
                        const tarj=getTarjeta(s.tarjeta);
                        const ejec=s.ejecutado||0;
                        const disp=s.monto-ejec;
                        return(
                          <div key={s.id} style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:10,padding:"12px 14px",marginBottom:8}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
                              <div>
                                <div style={{fontSize:13,fontWeight:600}}>{s.concepto}</div>
                                <div style={{display:"flex",gap:6,marginTop:4,flexWrap:"wrap"}}>
                                  <Chip color={fu.color} sm>{fu.nombre}</Chip>
                                  {tarj&&<Chip color={tarj.color} sm>💳 {tarj.nombre}</Chip>}
                                </div>
                              </div>
                              <div style={{textAlign:"right"}}>
                                <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:disp<0?"#EF4444":"#22C55E"}}>{D(Math.abs(disp))}</div>
                                <div style={{fontSize:10,color:T.muted}}>{disp<0?"excedido":"disponible"}</div>
                              </div>
                            </div>
                            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:8}}>
                              {[
                                {l:"Presupuesto",v:D(s.monto),c:T.muted},
                                {l:"Ejecutado",v:D(ejec),c:cat.color},
                                {l:"Varianza",v:D(Math.abs(s.monto-ejec)),c:s.monto-ejec>=0?"#22C55E":"#EF4444"},
                              ].map((x,i)=>(
                                <div key={i} style={{background:T.bg,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                                  <Lbl>{x.l}</Lbl>
                                  <div style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:x.c}}>{x.v}</div>
                                </div>
                              ))}
                            </div>
                            <Bar v={ejec} max={s.monto} color={pct(ejec,s.monto)>=100?"#EF4444":cat.color} h={5}/>
                            {/* Gastos del sobre */}
                            {s.gastos&&s.gastos.length>0&&(
                              <div style={{marginTop:10,borderTop:`1px solid ${T.bord}`,paddingTop:8}}>
                                {s.gastos.map(g=>(
                                  <div key={g.id} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",fontSize:12}}>
                                    <span style={{color:T.muted}}>{g.descripcion} · {new Date(g.fecha).toLocaleDateString("es-DO",{day:"numeric",month:"short"})}</span>
                                    <span style={{fontFamily:"monospace",fontWeight:600,color:"#EF4444"}}>{D(Number(g.monto))}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                            <button onClick={()=>setModalSobre({...s,ejecutado:ejec})} style={{width:"100%",marginTop:10,background:fu.color+"22",border:`1px solid ${fu.color}44`,borderRadius:8,color:fu.color,padding:"8px",cursor:"pointer",fontSize:12,fontWeight:600}}>
                              + Registrar gasto
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TARJETAS ══════════════════════════════════════════════ */}
        {tab==="tarjetas"&&(
          <div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
              <Card style={{padding:"14px 16px"}}>
                <Lbl>Deuda total</Lbl>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:"#EF4444"}}>{D(totalDeuda)}</div>
              </Card>
              <Card style={{padding:"14px 16px"}}>
                <Lbl>Cashback estimado</Lbl>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:"#22C55E"}}>{D(totalCB)}</div>
              </Card>
            </div>

            {/* Sobres vinculados a cada tarjeta */}
            {data.tarjetas.map(t=>{
              const sobresT=data.sobres.filter(s=>s.tarjeta===t.id);
              const gastosT=gastos.filter(g=>g.tarjeta===t.id);
              const totalGastosT=gastosT.reduce((s,g)=>s+Number(g.monto),0);
              return(
                <Card key={t.id} style={{marginBottom:10}} accent={t.color}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:10,alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:14,color:t.color}}>{t.nombre}</div>
                      {t.cashback>0&&<div style={{fontSize:11,color:T.muted}}>{(t.cashback*100).toFixed(0)}% cashback · {D(t.saldo*t.cashback)} est.</div>}
                    </div>
                    {t.saldo===0?<Chip color="#22C55E">Liquidada ✅</Chip>:<Chip color={t.color}>{D(t.saldo)}</Chip>}
                  </div>

                  {/* Sobres afiliados */}
                  {sobresT.length>0&&(
                    <div style={{marginBottom:10,padding:"8px 10px",background:T.bg,borderRadius:10}}>
                      <Lbl>Sobres afiliados</Lbl>
                      {sobresT.map(s=>{
                        const cat=CATS[s.categoria];
                        return(
                          <div key={s.id} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"4px 0"}}>
                            <span style={{color:T.muted}}>{cat?.icon} {s.concepto}</span>
                            <span style={{fontFamily:"monospace",fontWeight:600,color:t.color}}>{D(s.monto)}</span>
                          </div>
                        );
                      })}
                      <div style={{borderTop:`1px solid ${T.bord}`,marginTop:6,paddingTop:6,display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700}}>
                        <span>Total presupuestado</span>
                        <span style={{fontFamily:"monospace",color:t.color}}>{D(sobresT.reduce((a,s)=>a+s.monto,0))}</span>
                      </div>
                      {totalGastosT>0&&(
                        <div style={{display:"flex",justifyContent:"space-between",fontSize:12,fontWeight:700,marginTop:4}}>
                          <span>Total cargado (real)</span>
                          <span style={{fontFamily:"monospace",color:"#EF4444"}}>{D(totalGastosT)}</span>
                        </div>
                      )}
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <Lbl>Saldo actual</Lbl>
                      <input type="number" defaultValue={t.saldo} key={`s-${t.id}-${t.saldo}`}
                        onBlur={e=>updTarjeta(t.id,"saldo",parseFloat(e.target.value)||0)}
                        style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#EF4444",fontFamily:"monospace",fontSize:14,fontWeight:700}}/>
                    </div>
                    <div>
                      <Lbl>Presupuesto mes</Lbl>
                      <input type="number" defaultValue={t.presup} key={`p-${t.id}`}
                        onBlur={e=>updTarjeta(t.id,"presup",parseFloat(e.target.value)||0)}
                        style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:t.color,fontFamily:"monospace",fontSize:14,fontWeight:700}}/>
                    </div>
                  </div>
                  {t.saldo>0&&<div style={{marginTop:10}}><Bar v={t.saldo} max={t.saldo+t.presup} color={t.color} h={5}/></div>}
                </Card>
              );
            })}

            <Card accent="#6366F1">
              <div style={{fontWeight:700,color:"#6366F1",marginBottom:10}}>Extracredito</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <Lbl>Saldo</Lbl>
                  <input type="number" defaultValue={data.extracredito.saldo}
                    onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.extracredito.saldo=parseFloat(e.target.value)||0;guardarConfig(c);}}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#EF4444",fontFamily:"monospace",fontSize:14}}/>
                </div>
                <div>
                  <Lbl>Abono/mes</Lbl>
                  <input type="number" defaultValue={data.extracredito.abono}
                    onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.extracredito.abono=parseFloat(e.target.value)||0;guardarConfig(c);}}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#6366F1",fontFamily:"monospace",fontSize:14}}/>
                </div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:T.muted}}>
                ~{Math.ceil(data.extracredito.saldo/Math.max(data.extracredito.abono,1))} meses restantes
              </div>
            </Card>
          </div>
        )}

        {/* ══ CONFIG ════════════════════════════════════════════════ */}
        {tab==="config"&&(
          <div>
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Ingresos fijos</div>
              {data.fuentes.map(f=>(
                <div key={f.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:`1px solid ${T.bord}`}}>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <div style={{width:10,height:10,borderRadius:99,background:f.color}}/>
                    <span style={{fontSize:13,fontWeight:500}}>{f.nombre}</span>
                    {f.id==="fs"&&<Chip color={f.color} sm>irregular</Chip>}
                  </div>
                  <input type="number" defaultValue={f.monto}
                    onBlur={e=>updFuente(f.id,"monto",parseFloat(e.target.value)||0)}
                    style={{width:120,background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"6px 10px",color:f.color,fontFamily:"monospace",fontSize:13,textAlign:"right"}}/>
                </div>
              ))}
            </Card>

            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Sobres y montos</div>
              {data.sobres.map(s=>{
                const cat=CATS[s.categoria];
                const fu=data.fuentes.find(f=>f.id===s.fuente);
                const tarj=getTarjeta(s.tarjeta);
                return(
                  <div key={s.id} style={{padding:"8px 0",borderBottom:`1px solid ${T.bord}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:500}}>{s.concepto}</div>
                        <div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                          <Chip color={fu?.color||"#888"} sm>{fu?.nombre}</Chip>
                          <Chip color={cat?.color||"#888"} sm>{cat?.icon} {cat?.label}</Chip>
                          {tarj&&<Chip color={tarj.color} sm>💳 {tarj.nombre}</Chip>}
                        </div>
                      </div>
                      <input type="number" defaultValue={s.monto}
                        onBlur={e=>updSobre(s.id,"monto",parseFloat(e.target.value)||0)}
                        style={{width:100,background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"5px 8px",color:fu?.color||T.text,fontFamily:"monospace",fontSize:12,textAlign:"right"}}/>
                    </div>
                  </div>
                );
              })}
            </Card>

            <Card>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>General</div>
              <div style={{marginBottom:12}}>
                <Lbl>Mes actual</Lbl>
                <select value={data.mes} onChange={e=>{const c=JSON.parse(JSON.stringify(data));c.mes=e.target.value;guardarConfig(c);}}
                  style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13}}>
                  {MESES_L.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Tipo de cambio DOP/USD</Lbl>
                <input type="number" defaultValue={data.tc}
                  onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.tc=parseFloat(e.target.value)||61.4;guardarConfig(c);}}
                  style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:10,padding:"9px 12px",color:"#F59E0B",fontFamily:"monospace",fontSize:14}}/>
              </div>
            </Card>
          </div>
        )}
      </div>

      {modalSobre&&(
        <ModalGasto
          sobre={modalSobre}
          fuente={getFuente(modalSobre.fuente)}
          tarjetaNombre={getTarjeta(modalSobre.tarjeta)?.nombre}
          onSave={registrarGasto}
          onClose={()=>setModalSobre(null)}/>
      )}
    </div>
  );
}
