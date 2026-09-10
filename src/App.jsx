import { useState, useEffect, useCallback } from "react";

const SB = "https://gxhdxbabjqmyldbctwoy.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGR4YmFianFteWxkYmN0d295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTcyOTMsImV4cCI6MjA5NTYzMzI5M30.xq_HSa1s1qjECPvC9lpH0ikjGnkZFoJeYzF4i_epr6Y";
const H = {"apikey":SK,"Authorization":`Bearer ${SK}`,"Content-Type":"application/json","Prefer":"return=representation"};

const api = {
  get: async(t,q="")=>{try{const r=await fetch(`${SB}/rest/v1/${t}?${q}`,{headers:H});if(!r.ok)return[];return r.json();}catch{return[];}},
  post: async(t,b)=>{try{const r=await fetch(`${SB}/rest/v1/${t}`,{method:"POST",headers:H,body:JSON.stringify(b)});if(!r.ok)return null;const d=await r.json();return Array.isArray(d)?d[0]:d;}catch{return null;}},
  patch: async(t,f,b)=>{try{const r=await fetch(`${SB}/rest/v1/${t}?${f}`,{method:"PATCH",headers:H,body:JSON.stringify(b)});if(!r.ok)return null;return r.json();}catch{return null;}},
  del: async(t,f)=>{try{await fetch(`${SB}/rest/v1/${t}?${f}`,{method:"DELETE",headers:H});}catch{}},
};

const D = n=>`RD$${new Intl.NumberFormat("es-DO").format(Math.round(Math.abs(n||0)))}`;
const pct = (a,b)=>b>0?Math.min(100,(a/b)*100):0;

// ── DATOS BASE ─────────────────────────────────────────────────────
// tarjeta: null = efectivo/transferencia
const INIT = {
  tc: 61.4, mes: "Septiembre",
  fuentes: [
    {id:"eted1",nombre:"ETED 1°",  color:"#2DD4BF",monto:110000,credito:15335},
    {id:"mem",  nombre:"MEM",      color:"#60A5FA",monto:61200, credito:0},
    {id:"cne",  nombre:"CNE",      color:"#F97316",monto:140000,credito:0},
    {id:"eted2",nombre:"ETED 2°",  color:"#A78BFA",monto:90000, credito:0},
    {id:"fs",   nombre:"Cliente FS",color:"#34D399",monto:120000,credito:0},
  ],
  // ── SOBRES — agrupados por RUBRO/CATEGORÍA ──────────────────────
  sobres: [
    // ── 💵 EFECTIVO / TRANSFERENCIA ─────────────────────────────
    {id:"s_hip", fuente:"eted1",concepto:"Apartamento (hipoteca)",   categoria:"vivienda",    tarjeta:null,  monto:170465},
    {id:"s_mant",fuente:"cne",  concepto:"Mantenimiento apto",       categoria:"vivienda",    tarjeta:null,  monto:17045},
    {id:"s_yeli",fuente:"eted2",concepto:"Yeli",                     categoria:"salud",       tarjeta:null,  monto:17000},
    {id:"s_val", fuente:"eted2",concepto:"Valentina",                categoria:"educacion",   tarjeta:null,  monto:6000},
    {id:"s_imp", fuente:"eted1",concepto:"Imprevistos",              categoria:"imprevistos", tarjeta:null,  monto:32600},
    // ── 💳 BRAVO BSC VISA ───────────────────────────────────────
    {id:"s_col", fuente:"eted1",concepto:"Colegio",                  categoria:"educacion",   tarjeta:"bravo",monto:27500},
    {id:"s_a3",  fuente:"eted2",concepto:"Alimentación",             categoria:"alimentacion",tarjeta:"bravo",monto:18500},
    {id:"s_lum", fuente:"eted2",concepto:"LUMURI Recrea (tanda)",    categoria:"educacion",   tarjeta:"bravo",monto:10000},
    {id:"s_uber",fuente:"eted1",concepto:"Uber",                     categoria:"transporte",  tarjeta:"bravo",monto:4000},
    {id:"s_soc", fuente:"eted1",concepto:"Social",                   categoria:"social",      tarjeta:"bravo",monto:8000},
    // ── 💳 BHD VISA PREMIA ──────────────────────────────────────
    {id:"s_alim",fuente:"cne",  concepto:"Alimentación",             categoria:"alimentacion",tarjeta:"visapremia",monto:21500},
    // ── 💳 BANRESERVAS MC ───────────────────────────────────────
    {id:"s_sal", fuente:"eted1",concepto:"Salud",                    categoria:"salud",       tarjeta:"banres",monto:10000},
    {id:"s_ext", fuente:"eted1",concepto:"Extracredito",             categoria:"deuda",       tarjeta:"banres",monto:2500},
    {id:"s_res", fuente:"eted1",concepto:"Reservas",                 categoria:"ahorro",      tarjeta:"banres",monto:10000},
    // ── 💳 EDESUR ───────────────────────────────────────────────
    {id:"s_elec",fuente:"eted2",concepto:"Electricidad",             categoria:"servicios",   tarjeta:"edesur",monto:12000},
  ],
  tarjetas: [
    {id:"bravo",     nombre:"Bravo BSC Visa",     color:"#6366F1",saldo:45323,presup:68000,cashback:0.07},
    {id:"visapremia",nombre:"BHD Visa Premia",    color:"#10B981",saldo:88421,presup:21500,cashback:0.05},
    {id:"banres",    nombre:"Banreservas MC",      color:"#60A5FA",saldo:64203,presup:22500,cashback:0},
    {id:"edesur",    nombre:"EDESUR BHD Master",  color:"#84CC16",saldo:0,    presup:12000,cashback:0.05},
    {id:"promerica", nombre:"Promerica Visa Gold", color:"#34D399",saldo:0,    presup:0,    cashback:0},
  ],
  extracredito:{saldo:45077,abono:2500},
};

// ── CATEGORÍAS con ícono, label, color ────────────────────────────
const CATS = {
  vivienda:     {icon:"🏠",label:"Vivienda",       color:"#EF4444"},
  educacion:    {icon:"📚",label:"Educación",       color:"#8B5CF6"},
  alimentacion: {icon:"🍽️", label:"Alimentación",   color:"#10B981"},
  transporte:   {icon:"🚗",label:"Transporte",      color:"#F59E0B"},
  social:       {icon:"🎉",label:"Social",           color:"#14B8A6"},
  salud:        {icon:"💊",label:"Salud",            color:"#EC4899"},
  servicios:    {icon:"🔌",label:"Servicios",        color:"#6366F1"},
  deuda:        {icon:"💳",label:"Deuda/Crédito",   color:"#F97316"},
  ahorro:       {icon:"💰",label:"Ahorro",           color:"#22C55E"},
  imprevistos:  {icon:"⚡",label:"Imprevistos",      color:"#94A3B8"},
};

const MESES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const T = {bg:"#09090B",surf:"#18181B",bord:"#27272A",text:"#FAFAFA",muted:"#71717A",sub:"#3F3F46"};

// ── Micro UI ───────────────────────────────────────────────────────
const Bar=({v,max,color,h=6})=>(
  <div style={{background:T.sub,borderRadius:99,height:h,overflow:"hidden"}}>
    <div style={{width:`${pct(v,max)}%`,height:"100%",background:color,borderRadius:99,transition:"width .4s"}}/>
  </div>
);
const Chip=({color,children,sm})=>(
  <span style={{background:color+"22",color,border:`1px solid ${color}44`,borderRadius:6,padding:sm?"1px 7px":"3px 10px",fontSize:sm?10:11,fontWeight:600,whiteSpace:"nowrap"}}>{children}</span>
);
const Card=({children,style={},accent})=>(
  <div style={{background:T.surf,border:`1px solid ${T.bord}`,borderRadius:14,padding:16,borderLeft:accent?`3px solid ${accent}`:undefined,...style}}>{children}</div>
);
const Lbl=({children})=>(
  <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{children}</div>
);

// ── Modal gasto ────────────────────────────────────────────────────
function ModalGasto({sobre,fuente,tarjeta,onSave,onClose}){
  const [desc,setDesc]=useState("");
  const [monto,setMonto]=useState("");
  const [fecha,setFecha]=useState(new Date().toISOString().slice(0,10));
  const [saving,setSaving]=useState(false);
  const disp=sobre.monto-(sobre.ejecutado||0);
  const color=tarjeta?.color||fuente.color;

  const guardar=async()=>{
    if(!monto||!desc)return;
    setSaving(true);
    await onSave({sobre_id:sobre.id,descripcion:desc,monto:parseFloat(monto),fecha,fuente:fuente.id,categoria:sobre.categoria,tarjeta:sobre.tarjeta});
    setSaving(false);
  };

  return(
    <div style={{position:"fixed",inset:0,background:"#000D",display:"flex",alignItems:"flex-end",justifyContent:"center",zIndex:1000}}>
      <div style={{background:T.surf,borderRadius:"20px 20px 0 0",borderTop:`3px solid ${color}`,padding:"24px 20px 44px",width:"100%",maxWidth:520}}>
        <div style={{width:36,height:3,background:T.sub,borderRadius:99,margin:"0 auto 20px"}}/>
        <div style={{fontSize:15,fontWeight:700,marginBottom:2}}>{sobre.concepto}</div>
        <div style={{display:"flex",gap:8,alignItems:"center",marginBottom:16,flexWrap:"wrap"}}>
          <span style={{fontSize:11,color:T.muted}}>Disponible: <span style={{color:"#22C55E",fontWeight:700}}>{D(disp)}</span></span>
          {tarjeta
            ? <Chip color={tarjeta.color} sm>💳 {tarjeta.nombre}</Chip>
            : <Chip color={T.muted} sm>💵 Efectivo / transferencia</Chip>
          }
        </div>

        <div style={{background:T.bg,border:`1px solid ${T.bord}`,borderRadius:14,padding:16,marginBottom:14,textAlign:"center"}}>
          <Lbl>Monto (DOP)</Lbl>
          <input type="number" inputMode="numeric" value={monto} onChange={e=>setMonto(e.target.value)} placeholder="0" autoFocus
            style={{background:"transparent",border:"none",fontFamily:"monospace",fontSize:40,fontWeight:700,color,textAlign:"center",width:"100%",outline:"none"}}/>
        </div>

        <input value={desc} onChange={e=>setDesc(e.target.value)} placeholder="¿En qué? (descripción del gasto)"
          style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:12,padding:"12px 14px",color:T.text,fontSize:14,marginBottom:10,outline:"none"}}/>
        <input type="date" value={fecha} onChange={e=>setFecha(e.target.value)}
          style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:12,padding:"10px 14px",color:T.muted,fontSize:13,marginBottom:18,outline:"none"}}/>

        <div style={{display:"flex",gap:10}}>
          <button onClick={guardar} disabled={saving} style={{flex:2,background:color,border:"none",borderRadius:12,color:"#000",fontWeight:700,padding:14,cursor:"pointer",fontSize:16}}>
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

// ── Sobre item dentro de categoría ────────────────────────────────
function SobreItem({sobre,fuente,tarjeta,gastosList,onRegistrar,onEliminar}){
  const [open,setOpen]=useState(false);
  const ejecutado=gastosList.reduce((s,g)=>s+Number(g.monto),0);
  const disp=sobre.monto-ejecutado;
  const agotado=disp<=0;
  const p=pct(ejecutado,sobre.monto);
  const color=tarjeta?.color||(agotado?"#EF4444":"#94A3B8");
  const barColor=p>=100?"#EF4444":p>=80?"#F97316":p>=50?"#F59E0B":color;

  return(
    <div style={{border:`1px solid ${open?color:T.bord}`,borderRadius:12,marginBottom:8,overflow:"hidden",background:agotado?"#EF444408":T.bg}}>
      {/* Fila principal */}
      <div onClick={()=>setOpen(!open)} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 14px",cursor:"pointer"}}>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
            <span style={{fontSize:13,fontWeight:600}}>{sobre.concepto}</span>
            {tarjeta
              ? <Chip color={tarjeta.color} sm>💳 {tarjeta.nombre.split(" ")[0]}</Chip>
              : <Chip color={T.muted} sm>💵 Cash</Chip>
            }
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <Chip color={fuente.color} sm>{fuente.nombre}</Chip>
            {gastosList.length>0&&<Chip color={T.muted} sm>{gastosList.length} movs.</Chip>}
          </div>
        </div>
        <div style={{textAlign:"right",marginLeft:10,flexShrink:0}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:agotado?"#EF4444":"#22C55E"}}>
            {agotado?"AGOTADO":D(disp)}
          </div>
          <div style={{fontSize:10,color:T.muted}}>{D(ejecutado)} / {D(sobre.monto)}</div>
        </div>
      </div>

      {/* Barra */}
      <div style={{padding:"0 14px 10px"}}>
        <Bar v={ejecutado} max={sobre.monto} color={barColor} h={5}/>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:3,fontSize:9,color:T.muted}}>
          <span>{p.toFixed(0)}% ejecutado</span>
          <span style={{color:open?T.text:T.muted}}>{open?"▲ cerrar":"▼ detalle"}</span>
        </div>
      </div>

      {/* Detalle expandido */}
      {open&&(
        <div style={{borderTop:`1px solid ${T.bord}`}}>
          {gastosList.length===0?(
            <div style={{padding:"12px 14px",textAlign:"center",color:T.muted,fontSize:12}}>Sin gastos registrados</div>
          ):(
            <div style={{padding:"0 14px"}}>
              {gastosList.map(g=>(
                <div key={g.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:`1px solid ${T.bord}`}}>
                  <div>
                    <div style={{fontSize:13}}>{g.descripcion}</div>
                    <div style={{fontSize:10,color:T.muted}}>
                      {new Date(g.fecha).toLocaleDateString("es-DO",{day:"numeric",month:"short"})}
                      {tarjeta&&<span style={{color:tarjeta.color}}> · {tarjeta.nombre.split(" ")[0]}</span>}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:"#EF4444"}}>{D(Number(g.monto))}</span>
                    <button onClick={()=>onEliminar(g.id)} style={{background:"transparent",border:"none",color:T.muted,cursor:"pointer",fontSize:16}}>×</button>
                  </div>
                </div>
              ))}
              <div style={{display:"flex",justifyContent:"space-between",padding:"8px 0",fontWeight:700,fontSize:13}}>
                <span>Total</span>
                <span style={{fontFamily:"monospace",color:barColor}}>{D(ejecutado)}</span>
              </div>
            </div>
          )}
          <div style={{padding:"10px 14px",borderTop:`1px solid ${T.bord}`}}>
            <button onClick={()=>onRegistrar({...sobre,ejecutado})} style={{
              width:"100%",background:color+"22",border:`1px solid ${color}44`,
              borderRadius:10,color,padding:"10px",cursor:"pointer",fontSize:13,fontWeight:600,
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
export default function App(){
  const [data,setData]=useState(INIT);
  const [tab,setTab]=useState("rubros");
  const [gastos,setGastos]=useState([]);
  const [loading,setLoading]=useState(true);
  const [saved,setSaved]=useState(false);
  const [modal,setModal]=useState(null);
  const [catOpen,setCatOpen]=useState({});

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

  const guardar=async(nd)=>{
    setData(nd);
    await api.post("panel_raniero",{datos:JSON.stringify(nd),updated_at:new Date().toISOString()});
    flash();
  };

  const registrarGasto=async(gasto)=>{
    const creado=await api.post("gastos_raniero",gasto);
    const g=creado||{...gasto,id:Date.now()};
    setGastos(prev=>[g,...prev]);
    // Auto-actualizar saldo tarjeta
    if(gasto.tarjeta){
      const clone=JSON.parse(JSON.stringify(data));
      const t=clone.tarjetas.find(t=>t.id===gasto.tarjeta);
      if(t){t.saldo=Number(t.saldo)+Number(gasto.monto);guardar(clone);}
    } else { flash(); }
    setModal(null);
  };

  const eliminarGasto=async(id)=>{
    const g=gastos.find(g=>g.id===id);
    if(g&&g.tarjeta){
      const clone=JSON.parse(JSON.stringify(data));
      const t=clone.tarjetas.find(t=>t.id===g.tarjeta);
      if(t){t.saldo=Math.max(0,Number(t.saldo)-Number(g.monto));guardar(clone);}
    }
    await api.del("gastos_raniero",`id=eq.${id}`);
    setGastos(prev=>prev.filter(g=>g.id!==id));
    flash();
  };

  const getTarj=id=>id?data.tarjetas.find(t=>t.id===id):null;
  const getFuente=id=>data.fuentes.find(f=>f.id===id)||data.fuentes[0];

  // Sobres enriquecidos con ejecutado
  const sobreExt=data.sobres.map(s=>({
    ...s,
    ejecutado:gastos.filter(g=>g.sobre_id===s.id).reduce((a,g)=>a+Number(g.monto),0),
    gastos:gastos.filter(g=>g.sobre_id===s.id),
  }));

  // Métricas globales
  const ingresoFijo=data.fuentes.filter(f=>f.id!=="fs").reduce((s,f)=>s+f.monto+f.credito,0);
  const totalPresup=data.sobres.reduce((s,x)=>s+x.monto,0);
  const totalEjec=gastos.reduce((s,g)=>s+Number(g.monto),0);
  const balanceFijo=ingresoFijo-totalPresup;

  // Métricas tarjetas
  const totalDeuda=data.tarjetas.reduce((s,t)=>s+t.saldo,0);
  const totalCB=data.tarjetas.reduce((s,t)=>s+t.saldo*t.cashback,0);

  // Rubros agrupados
  const rubros=Object.entries(CATS).map(([catId,meta])=>{
    const sob=sobreExt.filter(s=>s.categoria===catId);
    const presup=sob.reduce((a,s)=>a+s.monto,0);
    const ejec=sob.reduce((a,s)=>a+s.ejecutado,0);
    return{id:catId,...meta,sobres:sob,presup,ejec,varianza:presup-ejec};
  }).filter(r=>r.presup>0);

  const TABS=[
    {id:"rubros",  l:"📋 Rubros"},
    {id:"tarjetas",l:"💳 Tarjetas"},
    {id:"resumen", l:"📊 Resumen"},
    {id:"config",  l:"⚙️ Config"},
  ];

  const toggleCat=id=>setCatOpen(p=>({...p,[id]:!p[id]}));

  return(
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
        {/* KPIs */}
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8}}>
          {[
            {l:"Ing. fijo",  v:D(ingresoFijo), c:"#22C55E"},
            {l:"Presupuesto",v:D(totalPresup),  c:"#F97316"},
            {l:"Ejecutado",  v:D(totalEjec),    c:totalEjec>totalPresup?"#EF4444":"#60A5FA"},
            {l:"Balance",    v:D(Math.abs(balanceFijo)),c:balanceFijo>=0?"#22C55E":"#EF4444"},
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

        {/* ══ RUBROS (vista principal) ══════════════════════════════ */}
        {tab==="rubros"&&(
          <div>
            {rubros.map(rubro=>{
              const abierto=catOpen[rubro.id];
              const p=pct(rubro.ejec,rubro.presup);
              const barColor=p>=100?"#EF4444":p>=80?"#F97316":rubro.color;
              const varianzaPos=rubro.varianza>=0;

              return(
                <div key={rubro.id} style={{marginBottom:10}}>
                  {/* Header categoría */}
                  <div onClick={()=>toggleCat(rubro.id)} style={{
                    background:T.surf,border:`1px solid ${abierto?rubro.color:T.bord}`,
                    borderRadius:14,padding:"14px 16px",cursor:"pointer",
                    borderLeft:`4px solid ${rubro.color}`,
                  }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                      <div style={{display:"flex",gap:10,alignItems:"center"}}>
                        <span style={{fontSize:22}}>{rubro.icon}</span>
                        <div>
                          <div style={{fontSize:15,fontWeight:700}}>{rubro.label}</div>
                          <div style={{fontSize:11,color:T.muted}}>{rubro.sobres.length} sub-rubro{rubro.sobres.length!==1?"s":""}</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:16,fontWeight:700,color:p>=100?"#EF4444":rubro.color}}>
                          {D(rubro.ejec)}
                        </div>
                        <div style={{fontSize:11,color:T.muted}}>de {D(rubro.presup)}</div>
                      </div>
                    </div>

                    {/* Barra doble: presup vs ejec */}
                    <div style={{position:"relative",height:8,marginBottom:6}}>
                      <div style={{position:"absolute",inset:0,background:T.sub,borderRadius:99}}/>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${p}%`,background:barColor,borderRadius:99,transition:"width .4s"}}/>
                    </div>
                    <div style={{display:"flex",justifyContent:"space-between",fontSize:10}}>
                      <span style={{color:T.muted}}>{p.toFixed(0)}% ejecutado · {pct(rubro.presup,totalPresup).toFixed(0)}% del total</span>
                      <span style={{color:varianzaPos?"#22C55E":"#EF4444",fontWeight:600}}>
                        {varianzaPos?"+":""}{D(rubro.varianza)} {varianzaPos?"disponible":"excedido"}
                      </span>
                    </div>
                  </div>

                  {/* Sub-rubros expandidos */}
                  {abierto&&(
                    <div style={{marginTop:8,paddingLeft:8}}>
                      {rubro.sobres.map(s=>(
                        <SobreItem
                          key={s.id} sobre={s}
                          fuente={getFuente(s.fuente)}
                          tarjeta={getTarj(s.tarjeta)}
                          gastosList={s.gastos}
                          onRegistrar={setModal}
                          onEliminar={eliminarGasto}/>
                      ))}
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
                <Lbl>Deuda total tarjetas</Lbl>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:"#EF4444"}}>{D(totalDeuda)}</div>
              </Card>
              <Card style={{padding:"14px 16px"}}>
                <Lbl>Cashback estimado</Lbl>
                <div style={{fontFamily:"monospace",fontSize:20,fontWeight:700,color:"#22C55E"}}>{D(totalCB)}</div>
              </Card>
            </div>

            {data.tarjetas.map(t=>{
              // Sobres afiliados a esta tarjeta
              const sobresT=data.sobres.filter(s=>s.tarjeta===t.id);
              const gastosT=gastos.filter(g=>g.tarjeta===t.id);
              const totalPres=sobresT.reduce((a,s)=>a+s.monto,0);
              const totalCarg=gastosT.reduce((a,g)=>a+Number(g.monto),0);
              const p=pct(totalCarg,totalPres);

              return(
                <Card key={t.id} style={{marginBottom:10}} accent={t.color}>
                  <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:15,color:t.color}}>{t.nombre}</div>
                      {t.cashback>0&&<div style={{fontSize:11,color:T.muted,marginTop:2}}>{(t.cashback*100).toFixed(0)}% cashback · {D(t.saldo*t.cashback)} est.</div>}
                    </div>
                    {t.saldo===0
                      ?<Chip color="#22C55E">Liquidada ✅</Chip>
                      :<Chip color={t.color}>{D(t.saldo)} deuda</Chip>
                    }
                  </div>

                  {/* Sobres afiliados */}
                  {sobresT.length>0&&(
                    <div style={{background:T.bg,borderRadius:10,padding:"10px 12px",marginBottom:12}}>
                      <Lbl>Rubros afiliados a esta tarjeta</Lbl>
                      {sobresT.map(s=>{
                        const cat=CATS[s.categoria];
                        const ejec=gastos.filter(g=>g.sobre_id===s.id).reduce((a,g)=>a+Number(g.monto),0);
                        return(
                          <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.bord}`}}>
                            <span style={{fontSize:12}}>{cat?.icon} {s.concepto}</span>
                            <div style={{display:"flex",gap:10,alignItems:"center"}}>
                              <span style={{fontFamily:"monospace",fontSize:11,color:T.muted}}>{D(s.monto)}</span>
                              {ejec>0&&<span style={{fontFamily:"monospace",fontSize:12,fontWeight:700,color:"#EF4444"}}>{D(ejec)}</span>}
                            </div>
                          </div>
                        );
                      })}
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginTop:10}}>
                        {[
                          {l:"Presupuestado",v:D(totalPres),c:t.color},
                          {l:"Cargado (real)",v:D(totalCarg),c:"#EF4444"},
                          {l:"Disponible",v:D(totalPres-totalCarg),c:totalPres-totalCarg>=0?"#22C55E":"#EF4444"},
                        ].map((x,i)=>(
                          <div key={i} style={{textAlign:"center",padding:"6px 4px",background:T.surf,borderRadius:8}}>
                            <Lbl>{x.l}</Lbl>
                            <div style={{fontFamily:"monospace",fontSize:11,fontWeight:700,color:x.c}}>{x.v}</div>
                          </div>
                        ))}
                      </div>
                      {totalPres>0&&<div style={{marginTop:8}}><Bar v={totalCarg} max={totalPres} color={p>=100?"#EF4444":t.color} h={5}/></div>}
                    </div>
                  )}

                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                    <div>
                      <Lbl>Saldo actual</Lbl>
                      <input type="number" defaultValue={t.saldo} key={`s${t.id}${t.saldo}`}
                        onBlur={e=>{const c=JSON.parse(JSON.stringify(data));const tarj=c.tarjetas.find(x=>x.id===t.id);if(tarj){tarj.saldo=parseFloat(e.target.value)||0;guardar(c);}}}
                        style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#EF4444",fontFamily:"monospace",fontSize:14,fontWeight:700}}/>
                    </div>
                    <div>
                      <Lbl>Presupuesto mes</Lbl>
                      <input type="number" defaultValue={t.presup} key={`p${t.id}`}
                        onBlur={e=>{const c=JSON.parse(JSON.stringify(data));const tarj=c.tarjetas.find(x=>x.id===t.id);if(tarj){tarj.presup=parseFloat(e.target.value)||0;guardar(c);}}}
                        style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:t.color,fontFamily:"monospace",fontSize:14,fontWeight:700}}/>
                    </div>
                  </div>
                </Card>
              );
            })}

            <Card accent="#6366F1">
              <div style={{fontWeight:700,color:"#6366F1",marginBottom:10}}>Extracredito</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                <div>
                  <Lbl>Saldo</Lbl>
                  <input type="number" defaultValue={data.extracredito.saldo}
                    onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.extracredito.saldo=parseFloat(e.target.value)||0;guardar(c);}}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#EF4444",fontFamily:"monospace",fontSize:14}}/>
                </div>
                <div>
                  <Lbl>Abono/mes</Lbl>
                  <input type="number" defaultValue={data.extracredito.abono}
                    onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.extracredito.abono=parseFloat(e.target.value)||0;guardar(c);}}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"7px 10px",color:"#6366F1",fontFamily:"monospace",fontSize:14}}/>
                </div>
              </div>
              <div style={{marginTop:8,fontSize:11,color:T.muted}}>~{Math.ceil(data.extracredito.saldo/Math.max(data.extracredito.abono,1))} meses restantes</div>
            </Card>
          </div>
        )}

        {/* ══ RESUMEN ═══════════════════════════════════════════════ */}
        {tab==="resumen"&&(
          <div>
            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Ejecución global</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginBottom:14}}>
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

            {/* Tabla rubros */}
            <Card>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Balance por rubro</div>
              {rubros.map((r,i)=>{
                const p=pct(r.ejec,r.presup);
                const barColor=p>=100?"#EF4444":p>=80?"#F97316":r.color;
                return(
                  <div key={r.id} style={{marginBottom:14}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:6,alignItems:"center"}}>
                      <div style={{display:"flex",gap:8,alignItems:"center"}}>
                        <span style={{fontSize:16}}>{r.icon}</span>
                        <div>
                          <div style={{fontSize:13,fontWeight:600}}>{r.label}</div>
                          <div style={{fontSize:10,color:T.muted}}>{pct(r.presup,totalPresup).toFixed(0)}% del presupuesto</div>
                        </div>
                      </div>
                      <div style={{textAlign:"right"}}>
                        <div style={{fontFamily:"monospace",fontSize:13,fontWeight:700,color:p>=100?"#EF4444":r.color}}>{D(r.ejec)}</div>
                        <div style={{fontSize:10,color:r.varianza>=0?"#22C55E":"#EF4444",fontWeight:600}}>
                          {r.varianza>=0?"+":""}{D(r.varianza)}
                        </div>
                      </div>
                    </div>
                    {/* Barra con presup marcado */}
                    <div style={{position:"relative",height:7}}>
                      <div style={{position:"absolute",inset:0,background:T.sub,borderRadius:99}}/>
                      <div style={{position:"absolute",left:0,top:0,bottom:0,width:`${p}%`,background:barColor,borderRadius:99,transition:"width .4s"}}/>
                    </div>
                    {i<rubros.length-1&&<div style={{height:1,background:T.bord,marginTop:10}}/>}
                  </div>
                );
              })}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:12,fontWeight:700}}>
                <span>TOTAL</span>
                <div style={{textAlign:"right"}}>
                  <div style={{fontFamily:"monospace",fontSize:14,color:"#F97316"}}>{D(totalPresup)}</div>
                  <div style={{fontFamily:"monospace",fontSize:12,color:totalEjec>totalPresup?"#EF4444":"#22C55E"}}>{D(totalEjec)} ejec.</div>
                </div>
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
                    <span style={{fontSize:13}}>{f.nombre}</span>
                    {f.id==="fs"&&<Chip color={f.color} sm>irregular</Chip>}
                  </div>
                  <input type="number" defaultValue={f.monto}
                    onBlur={e=>{const c=JSON.parse(JSON.stringify(data));const fu=c.fuentes.find(x=>x.id===f.id);if(fu){fu.monto=parseFloat(e.target.value)||0;guardar(c);}}}
                    style={{width:120,background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"6px 10px",color:f.color,fontFamily:"monospace",fontSize:13,textAlign:"right"}}/>
                </div>
              ))}
            </Card>

            <Card style={{marginBottom:14}}>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>Montos por rubro</div>
              {rubros.map(r=>(
                <div key={r.id}>
                  <div style={{fontSize:12,fontWeight:700,color:r.color,padding:"8px 0",borderBottom:`1px solid ${T.bord}`}}>{r.icon} {r.label}</div>
                  {r.sobres.map(s=>{
                    const fu=getFuente(s.fuente);
                    const tarj=getTarj(s.tarjeta);
                    return(
                      <div key={s.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0 7px 12px",borderBottom:`1px solid ${T.bord}`}}>
                        <div>
                          <div style={{fontSize:12}}>{s.concepto}</div>
                          <div style={{display:"flex",gap:4,marginTop:2}}>
                            <Chip color={fu.color} sm>{fu.nombre}</Chip>
                            {tarj&&<Chip color={tarj.color} sm>💳 {tarj.nombre.split(" ")[0]}</Chip>}
                            {!tarj&&<Chip color={T.muted} sm>💵 Cash</Chip>}
                          </div>
                        </div>
                        <input type="number" defaultValue={s.monto}
                          onBlur={e=>{const c=JSON.parse(JSON.stringify(data));const sob=c.sobres.find(x=>x.id===s.id);if(sob){sob.monto=parseFloat(e.target.value)||0;guardar(c);}}}
                          style={{width:100,background:T.bg,border:`1px solid ${T.bord}`,borderRadius:8,padding:"5px 8px",color:fu.color,fontFamily:"monospace",fontSize:12,textAlign:"right"}}/>
                      </div>
                    );
                  })}
                </div>
              ))}
            </Card>

            <Card>
              <div style={{fontSize:13,fontWeight:600,marginBottom:14}}>General</div>
              <div style={{marginBottom:12}}>
                <Lbl>Mes actual</Lbl>
                <select value={data.mes} onChange={e=>{const c=JSON.parse(JSON.stringify(data));c.mes=e.target.value;guardar(c);}}
                  style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:10,padding:"9px 12px",color:T.text,fontSize:13}}>
                  {MESES_L.map(m=><option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Lbl>Tipo de cambio DOP/USD</Lbl>
                <input type="number" defaultValue={data.tc}
                  onBlur={e=>{const c=JSON.parse(JSON.stringify(data));c.tc=parseFloat(e.target.value)||61.4;guardar(c);}}
                  style={{width:"100%",background:T.bg,border:`1px solid ${T.bord}`,borderRadius:10,padding:"9px 12px",color:"#F59E0B",fontFamily:"monospace",fontSize:14}}/>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* FAB */}
      <div style={{position:"fixed",bottom:28,right:20,zIndex:90}}>
        <button onClick={()=>{const s=sobreExt.find(s=>s.monto>s.ejecutado);if(s)setModal({...s});}}
          style={{background:T.text,border:"none",borderRadius:99,width:60,height:60,fontSize:26,cursor:"pointer",boxShadow:"0 4px 24px #ffffff33",display:"flex",alignItems:"center",justifyContent:"center",color:T.bg,fontWeight:700}}>
          +
        </button>
      </div>

      {modal&&(
        <ModalGasto
          sobre={modal}
          fuente={getFuente(modal.fuente)}
          tarjeta={getTarj(modal.tarjeta)}
          onSave={registrarGasto}
          onClose={()=>setModal(null)}/>
      )}
    </div>
  );
}
