import { useState, useEffect, useCallback } from "react";

const SB = "https://gxhdxbabjqmyldbctwoy.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGR4YmFianFteWxkYmN0d295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTcyOTMsImV4cCI6MjA5NTYzMzI5M30.xq_HSa1s1qjECPvC9lpH0ikjGnkZFoJeYzF4i_epr6Y";
const H = { "apikey": SK, "Authorization": `Bearer ${SK}`, "Content-Type": "application/json", "Prefer": "return=representation" };

const api = {
  get: async (t, q = "") => { try { const r = await fetch(`${SB}/rest/v1/${t}?${q}`, { headers: H }); if (!r.ok) return []; return r.json(); } catch { return []; } },
  post: async (t, b) => { try { const r = await fetch(`${SB}/rest/v1/${t}`, { method: "POST", headers: H, body: JSON.stringify(b) }); if (!r.ok) return null; const d = await r.json(); return Array.isArray(d) ? d[0] : d; } catch { return null; } },
  patch: async (t, f, b) => { try { const r = await fetch(`${SB}/rest/v1/${t}?${f}`, { method: "PATCH", headers: H, body: JSON.stringify(b) }); if (!r.ok) return null; return r.json(); } catch { return null; } },
  del: async (t, f) => { try { await fetch(`${SB}/rest/v1/${t}?${f}`, { method: "DELETE", headers: H }); } catch {} },
};

const D = n => `RD$${new Intl.NumberFormat("es-DO").format(Math.round(Math.abs(n || 0)))}`;
const pct = (a, b) => b > 0 ? Math.min(100, (a / b) * 100) : 0;
const TC = 61.4;

const INIT = {
  tc: 61.4, mes: "Septiembre",
  fuentes: [
    { id: "eted1", nombre: "ETED 1°",    color: "#2DD4BF", monto: 110000, credito: 15335 },
    { id: "mem",   nombre: "MEM",         color: "#60A5FA", monto: 61200,  credito: 0 },
    { id: "cne",   nombre: "CNE",         color: "#F97316", monto: 140000, credito: 0 },
    { id: "eted2", nombre: "ETED 2°",     color: "#A78BFA", monto: 90000,  credito: 0 },
    { id: "fs",    nombre: "Cliente FS",  color: "#34D399", monto: 120000, credito: 0 },
  ],
  sobres: [
    { id: "s1",  fuente: "eted1", concepto: "Colegio",           categoria: "educacion",    monto: 27500 },
    { id: "s2",  fuente: "eted1", concepto: "Extra (alquiler)",  categoria: "vivienda",     monto: 36600 },
    { id: "s3",  fuente: "eted1", concepto: "Social",            categoria: "social",       monto: 8000  },
    { id: "s4",  fuente: "eted1", concepto: "Salud",             categoria: "salud",        monto: 10000 },
    { id: "s5",  fuente: "eted1", concepto: "Extracredito",      categoria: "deuda",        monto: 2500  },
    { id: "s6",  fuente: "eted1", concepto: "Reservas",          categoria: "ahorro",       monto: 10000 },
    { id: "s7",  fuente: "eted1", concepto: "Pago hipotecario",  categoria: "vivienda",     monto: 170465 },
    { id: "s8",  fuente: "cne",   concepto: "Alimentación",      categoria: "alimentacion", monto: 13500 },
    { id: "s9",  fuente: "cne",   concepto: "Mantenimiento apto",categoria: "vivienda",     monto: 17045 },
    { id: "s10", fuente: "eted2", concepto: "Alimentación 1",    categoria: "alimentacion", monto: 18500 },
    { id: "s11", fuente: "eted2", concepto: "Electricidad",      categoria: "servicios",    monto: 12000 },
    { id: "s12", fuente: "eted2", concepto: "Alimentación 2",    categoria: "alimentacion", monto: 8000  },
    { id: "s13", fuente: "eted2", concepto: "Yeli",              categoria: "hogar",        monto: 17000 },
    { id: "s14", fuente: "eted2", concepto: "Valentina",         categoria: "hogar",        monto: 6000  },
    { id: "s15", fuente: "eted2", concepto: "LUMURI Recrea",     categoria: "social",       monto: 10000 },
  ],
  tarjetas: [
    { id: "edesur",    nombre: "EDESUR BHD Master",   color: "#EF4444", saldo: 0,     presup: 12000, cashback: 0.05 },
    { id: "visapremia",nombre: "Visa Premia BHD",     color: "#F97316", saldo: 88421, presup: 21500, cashback: 0.05 },
    { id: "bravo",     nombre: "Bravo BSC Visa",      color: "#A78BFA", saldo: 45323, presup: 46000, cashback: 0.07 },
    { id: "banres",    nombre: "Banreservas MC",       color: "#60A5FA", saldo: 64203, presup: 30500, cashback: 0 },
    { id: "promerica", nombre: "Promerica Visa Gold", color: "#34D399", saldo: 0,     presup: 0,     cashback: 0 },
  ],
  extracredito: { saldo: 45077, abono: 2500 },
};

const CATS = {
  vivienda:     { icon: "🏠", label: "Vivienda",       color: "#EF4444" },
  educacion:    { icon: "📚", label: "Educación",       color: "#8B5CF6" },
  alimentacion: { icon: "🍽️",  label: "Alimentación",   color: "#10B981" },
  hogar:        { icon: "🏡", label: "Hogar",           color: "#F59E0B" },
  servicios:    { icon: "🔌", label: "Servicios",       color: "#6366F1" },
  salud:        { icon: "💊", label: "Salud",           color: "#EC4899" },
  social:       { icon: "🎉", label: "Social",          color: "#14B8A6" },
  deuda:        { icon: "💳", label: "Deuda",           color: "#EF4444" },
  ahorro:       { icon: "💰", label: "Ahorro",          color: "#22C55E" },
};

const MESES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

const T = { bg: "#09090B", surf: "#18181B", bord: "#27272A", text: "#FAFAFA", muted: "#71717A", sub: "#3F3F46" };

const Bar = ({ v, max, color, h = 6 }) => (
  <div style={{ background: T.sub, borderRadius: 99, height: h, overflow: "hidden" }}>
    <div style={{ width: `${pct(v, max)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .4s" }} />
  </div>
);

const Chip = ({ color, children, sm }) => (
  <span style={{ background: color + "22", color, border: `1px solid ${color}44`, borderRadius: 6, padding: sm ? "1px 7px" : "3px 10px", fontSize: sm ? 10 : 11, fontWeight: 600, whiteSpace: "nowrap" }}>{children}</span>
);

const Card = ({ children, style = {}, accent }) => (
  <div style={{ background: T.surf, border: `1px solid ${T.bord}`, borderRadius: 14, padding: 16, borderLeft: accent ? `3px solid ${accent}` : undefined, ...style }}>{children}</div>
);

// ── Modal registro de gasto ──────────────────────────────────────────
function ModalGasto({ sobre, fuente, onSave, onClose }) {
  const [desc, setDesc] = useState("");
  const [monto, setMonto] = useState("");
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  const guardar = async () => {
    if (!monto || !desc) return;
    setSaving(true);
    await onSave({ sobre_id: sobre.id, descripcion: desc, monto: parseFloat(monto), fecha, fuente: fuente.id, categoria: sobre.categoria });
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "#000D", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 1000 }}>
      <div style={{ background: T.surf, borderRadius: "20px 20px 0 0", borderTop: `3px solid ${fuente.color}`, padding: "24px 20px 40px", width: "100%", maxWidth: 520 }}>
        <div style={{ width: 36, height: 3, background: T.sub, borderRadius: 99, margin: "0 auto 20px" }} />
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{sobre.concepto}</div>
        <div style={{ fontSize: 11, color: T.muted, marginBottom: 20 }}>
          Disponible: <span style={{ color: "#22C55E", fontWeight: 700 }}>{D(sobre.monto - (sobre.ejecutado || 0))}</span>
        </div>

        {/* Monto */}
        <div style={{ background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 14, padding: "16px", marginBottom: 14, textAlign: "center" }}>
          <div style={{ fontSize: 10, color: T.muted, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>Monto (DOP)</div>
          <input type="number" inputMode="numeric" value={monto} onChange={e => setMonto(e.target.value)} placeholder="0" autoFocus
            style={{ background: "transparent", border: "none", fontFamily: "monospace", fontSize: 40, fontWeight: 700, color: fuente.color, textAlign: "center", width: "100%", outline: "none" }} />
        </div>

        {/* Descripción */}
        <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="¿En qué? (supermercado, farmacia, gasolina...)"
          style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 12, padding: "12px 14px", color: T.text, fontSize: 14, marginBottom: 12, outline: "none" }} />

        {/* Fecha */}
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)}
          style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 12, padding: "10px 14px", color: T.muted, fontSize: 13, marginBottom: 18, outline: "none" }} />

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={guardar} disabled={saving} style={{ flex: 2, background: fuente.color, border: "none", borderRadius: 12, color: "#000", fontWeight: 700, padding: 14, cursor: "pointer", fontSize: 16 }}>
            {saving ? "Guardando..." : "✓ Registrar gasto"}
          </button>
          <button onClick={onClose} style={{ flex: 1, background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 12, color: T.muted, padding: 14, cursor: "pointer", fontSize: 14 }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sobre card expandible ────────────────────────────────────────────
function SobreCard({ sobre, fuente, gastos, onRegistrar, onEliminarGasto }) {
  const [expandido, setExpandido] = useState(false);
  const cat = CATS[sobre.categoria];
  const ejecutado = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const disponible = sobre.monto - ejecutado;
  const agotado = disponible <= 0;
  const pctUso = pct(ejecutado, sobre.monto);
  const colorBarra = pctUso >= 100 ? "#EF4444" : pctUso >= 80 ? "#F97316" : pctUso >= 50 ? "#F59E0B" : fuente.color;

  return (
    <div style={{ background: agotado ? "#EF444408" : T.surf, border: `1px solid ${agotado ? "#EF444433" : T.bord}`, borderRadius: 14, marginBottom: 10, overflow: "hidden" }}>
      {/* Header del sobre */}
      <div style={{ padding: "14px 16px", cursor: "pointer" }} onClick={() => setExpandido(!expandido)}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 4, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 700 }}>{sobre.concepto}</span>
              <Chip color={cat?.color || "#888"} sm>{cat?.icon} {cat?.label}</Chip>
            </div>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Chip color={fuente.color} sm>{fuente.nombre}</Chip>
              {gastos.length > 0 && <Chip color={T.muted} sm>{gastos.length} movs.</Chip>}
            </div>
          </div>
          <div style={{ textAlign: "right", marginLeft: 12 }}>
            <div style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 700, color: agotado ? "#EF4444" : "#22C55E" }}>
              {agotado ? "AGOTADO" : D(disponible)}
            </div>
            <div style={{ fontSize: 10, color: T.muted }}>de {D(sobre.monto)}</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <Bar v={ejecutado} max={sobre.monto} color={colorBarra} h={7} />
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5, fontSize: 10, color: T.muted }}>
          <span>Gastado: {D(ejecutado)} ({pctUso.toFixed(0)}%)</span>
          <span style={{ color: expandido ? T.text : T.muted }}>{expandido ? "▲ cerrar" : "▼ ver detalle"}</span>
        </div>
      </div>

      {/* Detalle expandido */}
      {expandido && (
        <div style={{ borderTop: `1px solid ${T.bord}` }}>
          {/* Lista de gastos */}
          {gastos.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: T.muted, fontSize: 13 }}>
              Sin gastos registrados en este sobre
            </div>
          ) : (
            <div style={{ padding: "8px 16px" }}>
              {gastos.map(g => (
                <div key={g.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${T.bord}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{g.descripcion}</div>
                    <div style={{ fontSize: 10, color: T.muted, marginTop: 2 }}>
                      {new Date(g.fecha).toLocaleDateString("es-DO", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#EF4444" }}>{D(Number(g.monto))}</span>
                    <button onClick={() => onEliminarGasto(g.id)} style={{ background: "transparent", border: "none", color: T.muted, cursor: "pointer", fontSize: 16, padding: "0 4px" }}>×</button>
                  </div>
                </div>
              ))}
              {/* Total del sobre */}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", fontWeight: 700 }}>
                <span style={{ fontSize: 13 }}>Total gastado</span>
                <span style={{ fontFamily: "monospace", fontSize: 14, color: colorBarra }}>{D(ejecutado)}</span>
              </div>
            </div>
          )}

          {/* Botón registrar */}
          <div style={{ padding: "12px 16px", borderTop: `1px solid ${T.bord}` }}>
            <button onClick={() => onRegistrar(sobre)} style={{
              width: "100%", background: agotado ? "#EF444422" : fuente.color + "22",
              border: `1px solid ${agotado ? "#EF444455" : fuente.color + "55"}`,
              borderRadius: 10, color: agotado ? "#EF4444" : fuente.color,
              padding: "11px", cursor: "pointer", fontSize: 13, fontWeight: 600,
            }}>
              {agotado ? "⚠️ Sobre agotado — registrar igualmente" : "+ Registrar gasto en este sobre"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── APP PRINCIPAL ────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(INIT);
  const [tab, setTab] = useState("sobres");
  const [gastos, setGastos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [modalSobre, setModalSobre] = useState(null);

  const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const cargar = useCallback(async () => {
    setLoading(true);
    const [cfg, gs] = await Promise.all([
      api.get("panel_raniero", "order=id.desc&limit=1"),
      api.get("gastos_raniero", "order=fecha.desc"),
    ]);
    if (cfg && cfg.length > 0 && cfg[0].datos) {
      try { setData(JSON.parse(cfg[0].datos)); } catch {}
    }
    setGastos(gs || []);
    setLoading(false);
  }, []);

  useEffect(() => { cargar(); }, [cargar]);

  const guardarConfig = async (newData) => {
    setData(newData);
    await api.post("panel_raniero", { datos: JSON.stringify(newData), updated_at: new Date().toISOString() });
    flash();
  };

  const registrarGasto = async (gasto) => {
    const creado = await api.post("gastos_raniero", gasto);
    if (creado) setGastos(prev => [creado, ...prev]);
    else setGastos(prev => [{ ...gasto, id: Date.now() }, ...prev]);
    setModalSobre(null);
    flash();
  };

  const eliminarGasto = async (id) => {
    await api.del("gastos_raniero", `id=eq.${id}`);
    setGastos(prev => prev.filter(g => g.id !== id));
    flash();
  };

  const updSobre = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const s = clone.sobres.find(s => s.id === id);
    if (s) { s[field] = val; guardarConfig(clone); }
  };

  const updFuente = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const f = clone.fuentes.find(f => f.id === id);
    if (f) { f[field] = val; guardarConfig(clone); }
  };

  const updTarjeta = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const t = clone.tarjetas.find(t => t.id === id);
    if (t) { t[field] = val; guardarConfig(clone); }
  };

  // Calcular ejecutado por sobre
  const sobreConEjecutado = data.sobres.map(s => ({
    ...s,
    ejecutado: gastos.filter(g => g.sobre_id === s.id).reduce((a, g) => a + Number(g.monto), 0),
    gastos: gastos.filter(g => g.sobre_id === s.id),
  }));

  const ingresoFijo = data.fuentes.filter(f => f.id !== "fs").reduce((s, f) => s + f.monto + f.credito, 0);
  const ingresoTotal = data.fuentes.reduce((s, f) => s + f.monto + f.credito, 0);
  const totalPresup = data.sobres.reduce((s, x) => s + x.monto, 0);
  const totalEjecutado = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const balanceFijo = ingresoFijo - totalPresup;
  const totalDeuda = data.tarjetas.reduce((s, t) => s + t.saldo, 0);
  const totalCB = data.tarjetas.reduce((s, t) => s + t.saldo * t.cashback, 0);

  // Por categoría ejecutado
  const porCat = Object.entries(CATS).map(([id, meta]) => ({
    id, ...meta,
    presup: sobreConEjecutado.filter(s => s.categoria === id).reduce((a, s) => a + s.monto, 0),
    ejec: sobreConEjecutado.filter(s => s.categoria === id).reduce((a, s) => a + s.ejecutado, 0),
  })).filter(c => c.presup > 0).sort((a, b) => b.presup - a.presup);

  const TABS = [
    { id: "sobres",   l: "💼 Sobres"   },
    { id: "resumen",  l: "📊 Resumen"  },
    { id: "tarjetas", l: "💳 Tarjetas" },
    { id: "config",   l: "⚙️ Config"   },
  ];

  const fuenteDelSobre = (s) => data.fuentes.find(f => f.id === s.fuente) || data.fuentes[0];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.text, maxWidth: 600, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{outline:none}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${T.sub};border-radius:2px}button:active{opacity:.85;transform:scale(.98)}`}</style>

      {/* Header */}
      <div style={{ background: T.surf, borderBottom: `1px solid ${T.bord}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Raniero Cassoni</div>
            <div style={{ fontSize: 11, color: T.muted }}>{data.mes} 2026</div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && <Chip color="#22C55E">✓ Guardado</Chip>}
            {loading && <Chip color="#F59E0B">⟳</Chip>}
            <button onClick={cargar} style={{ background: T.sub, border: "none", borderRadius: 8, color: T.muted, padding: "5px 10px", cursor: "pointer", fontSize: 12 }}>↻</button>
          </div>
        </div>
        {/* KPI strip */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[
            { l: "Presupuesto", v: D(totalPresup), c: "#F97316" },
            { l: "Ejecutado", v: D(totalEjecutado), c: totalEjecutado > totalPresup ? "#EF4444" : "#60A5FA" },
            { l: "Balance", v: D(Math.abs(ingresoFijo - totalPresup)), c: balanceFijo >= 0 ? "#22C55E" : "#EF4444" },
          ].map((k, i) => (
            <div key={i} style={{ background: T.bg, borderRadius: 10, padding: "8px 10px" }}>
              <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.08em" }}>{k.l}</div>
              <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: k.c, marginTop: 2 }}>{k.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: T.surf, borderBottom: `1px solid ${T.bord}`, display: "flex" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #fff" : "2px solid transparent", color: tab === t.id ? T.text : T.muted, padding: "10px 4px", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 600 : 400 }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ═══ SOBRES ════════════════════════════════════════════════ */}
        {tab === "sobres" && (
          <div>
            {data.fuentes.map(fuente => {
              const sobre_f = sobreConEjecutado.filter(s => s.fuente === fuente.id);
              if (sobre_f.length === 0) return null;
              const ing_f = fuente.monto + fuente.credito;
              const pres_f = sobre_f.reduce((a, s) => a + s.monto, 0);
              const ejec_f = sobre_f.reduce((a, s) => a + s.ejecutado, 0);
              return (
                <div key={fuente.id} style={{ marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: fuente.color + "15", borderRadius: 10, border: `1px solid ${fuente.color}33`, marginBottom: 10 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: fuente.color, fontSize: 14 }}>{fuente.nombre}</span>
                      {fuente.credito > 0 && <span style={{ fontSize: 10, color: T.muted, marginLeft: 8 }}>+crédito</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: fuente.color }}>{D(ing_f)}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>ejec: {D(ejec_f)} / pres: {D(pres_f)}</div>
                    </div>
                  </div>
                  {sobre_f.map(s => (
                    <SobreCard key={s.id} sobre={s} fuente={fuente}
                      gastos={s.gastos}
                      onRegistrar={setModalSobre}
                      onEliminarGasto={eliminarGasto} />
                  ))}
                </div>
              );
            })}
          </div>
        )}

        {/* ═══ RESUMEN ═══════════════════════════════════════════════ */}
        {tab === "resumen" && (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Presupuesto vs Ejecutado</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                {[
                  { l: "Ing. fijo", v: D(ingresoFijo), c: "#22C55E" },
                  { l: "Presup.", v: D(totalPresup), c: "#F97316" },
                  { l: "Ejecutado", v: D(totalEjecutado), c: "#60A5FA" },
                  { l: "Disponible", v: D(ingresoFijo - totalEjecutado), c: ingresoFijo - totalEjecutado >= 0 ? "#22C55E" : "#EF4444" },
                ].map((k, i) => (
                  <div key={i} style={{ textAlign: "center", background: T.bg, borderRadius: 10, padding: "10px 4px" }}>
                    <div style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{k.l}</div>
                    <div style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: k.c }}>{k.v}</div>
                  </div>
                ))}
              </div>
              <Bar v={totalEjecutado} max={ingresoFijo} color={totalEjecutado > ingresoFijo ? "#EF4444" : "#22C55E"} h={10} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: T.muted }}>
                <span>{pct(totalEjecutado, ingresoFijo).toFixed(0)}% ejecutado</span>
                <span>{pct(totalPresup, ingresoFijo).toFixed(0)}% presupuestado</span>
              </div>
            </Card>

            {/* Por categoría pres vs ejec */}
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Por categoría</div>
              {porCat.map(cat => (
                <div key={cat.id} style={{ marginBottom: 14 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{cat.icon} {cat.label}</span>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: cat.ejec > cat.presup ? "#EF4444" : cat.color }}>{D(cat.ejec)}</span>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: T.muted }}> / {D(cat.presup)}</span>
                    </div>
                  </div>
                  {/* Doble barra: presup gris, ejec color */}
                  <div style={{ position: "relative", height: 8 }}>
                    <div style={{ position: "absolute", inset: 0, background: T.sub, borderRadius: 99 }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct(cat.presup, totalPresup)}%`, background: cat.color + "44", borderRadius: 99 }} />
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct(cat.ejec, totalPresup)}%`, background: cat.color, borderRadius: 99 }} />
                  </div>
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ═══ TARJETAS ══════════════════════════════════════════════ */}
        {tab === "tarjetas" && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Deuda total</div>
                <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#EF4444" }}>{D(totalDeuda)}</div>
              </Card>
              <Card style={{ padding: "14px 16px" }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>Cashback total</div>
                <div style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#22C55E" }}>{D(totalCB)}</div>
              </Card>
            </div>
            {data.tarjetas.map(t => (
              <Card key={t.id} style={{ marginBottom: 10 }} accent={t.color}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: t.color }}>{t.nombre}</div>
                    {t.cashback > 0 && <div style={{ fontSize: 11, color: T.muted }}>{(t.cashback * 100).toFixed(0)}% cashback · est. {D(t.saldo * t.cashback)}</div>}
                  </div>
                  {t.saldo === 0 && <Chip color="#22C55E">Liquidada ✅</Chip>}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 10, color: T.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Saldo</div>
                    <input type="number" defaultValue={t.saldo}
                      onBlur={e => updTarjeta(t.id, "saldo", parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "7px 10px", color: "#EF4444", fontFamily: "monospace", fontSize: 14, fontWeight: 700 }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: T.muted, marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.06em" }}>Presupuesto mes</div>
                    <input type="number" defaultValue={t.presup}
                      onBlur={e => updTarjeta(t.id, "presup", parseFloat(e.target.value) || 0)}
                      style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "7px 10px", color: t.color, fontFamily: "monospace", fontSize: 14, fontWeight: 700 }} />
                  </div>
                </div>
                {t.saldo > 0 && <Bar v={t.saldo} max={t.saldo + t.presup} color={t.color} h={5} />}
              </Card>
            ))}
            <Card accent="#6366F1">
              <div style={{ fontWeight: 700, color: "#6366F1", marginBottom: 10 }}>Extracredito</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>Saldo</div>
                  <input type="number" defaultValue={data.extracredito.saldo}
                    onBlur={e => { const c = JSON.parse(JSON.stringify(data)); c.extracredito.saldo = parseFloat(e.target.value)||0; guardarConfig(c); }}
                    style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "7px 10px", color: "#EF4444", fontFamily: "monospace", fontSize: 14 }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, color: T.muted, marginBottom: 3 }}>Abono/mes</div>
                  <input type="number" defaultValue={data.extracredito.abono}
                    onBlur={e => { const c = JSON.parse(JSON.stringify(data)); c.extracredito.abono = parseFloat(e.target.value)||0; guardarConfig(c); }}
                    style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "7px 10px", color: "#6366F1", fontFamily: "monospace", fontSize: 14 }} />
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: T.muted }}>
                ~{Math.ceil(data.extracredito.saldo / Math.max(data.extracredito.abono, 1))} meses restantes
              </div>
            </Card>
          </div>
        )}

        {/* ═══ CONFIG ════════════════════════════════════════════════ */}
        {tab === "config" && (
          <div>
            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Ingresos fijos</div>
              {data.fuentes.map(f => (
                <div key={f.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${T.bord}` }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <div style={{ width: 10, height: 10, borderRadius: 99, background: f.color }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{f.nombre}</span>
                    {f.id === "fs" && <Chip color={f.color} sm>irregular</Chip>}
                  </div>
                  <input type="number" defaultValue={f.monto}
                    onBlur={e => updFuente(f.id, "monto", parseFloat(e.target.value) || 0)}
                    style={{ width: 120, background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "6px 10px", color: f.color, fontFamily: "monospace", fontSize: 13, textAlign: "right" }} />
                </div>
              ))}
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Montos de sobres</div>
              {data.sobres.map(s => {
                const cat = CATS[s.categoria];
                const fu = data.fuentes.find(f => f.id === s.fuente);
                return (
                  <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: `1px solid ${T.bord}` }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 500 }}>{s.concepto}</div>
                      <div style={{ fontSize: 10, color: T.muted }}>{cat?.icon} {cat?.label} · {fu?.nombre}</div>
                    </div>
                    <input type="number" defaultValue={s.monto}
                      onBlur={e => updSobre(s.id, "monto", parseFloat(e.target.value) || 0)}
                      style={{ width: 110, background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 8, padding: "5px 8px", color: fu?.color || T.text, fontFamily: "monospace", fontSize: 12, textAlign: "right" }} />
                  </div>
                );
              })}
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Configuración general</div>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Mes actual</div>
                <select value={data.mes} onChange={e => { const c = JSON.parse(JSON.stringify(data)); c.mes = e.target.value; guardarConfig(c); }}
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 13 }}>
                  {MESES_L.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <div style={{ fontSize: 10, color: T.muted, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.08em" }}>Tipo de cambio DOP/USD</div>
                <input type="number" defaultValue={data.tc}
                  onBlur={e => { const c = JSON.parse(JSON.stringify(data)); c.tc = parseFloat(e.target.value) || 61.4; guardarConfig(c); }}
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 10, padding: "9px 12px", color: "#F59E0B", fontFamily: "monospace", fontSize: 14 }} />
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Modal gasto */}
      {modalSobre && (
        <ModalGasto sobre={modalSobre} fuente={fuenteDelSobre(modalSobre)}
          onSave={registrarGasto} onClose={() => setModalSobre(null)} />
      )}
    </div>
  );
}
