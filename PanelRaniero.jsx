import { useState, useEffect, useCallback } from "react";

const SB = "https://gxhdxbabjqmyldbctwoy.supabase.co";
const SK = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aGR4YmFianFteWxkYmN0d295Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNTcyOTMsImV4cCI6MjA5NTYzMzI5M30.xq_HSa1s1qjECPvC9lpH0ikjGnkZFoJeYzF4i_epr6Y";
const H = { "apikey": SK, "Authorization": `Bearer ${SK}`, "Content-Type": "application/json", "Prefer": "return=representation" };

const db = {
  get: async (t, q = "") => { try { const r = await fetch(`${SB}/rest/v1/${t}?${q}`, { headers: H }); if (!r.ok) return []; return r.json(); } catch { return []; } },
  post: async (t, b) => { try { const r = await fetch(`${SB}/rest/v1/${t}`, { method: "POST", headers: H, body: JSON.stringify(b) }); if (!r.ok) return null; return r.json(); } catch { return null; } },
  patch: async (t, f, b) => { try { const r = await fetch(`${SB}/rest/v1/${t}?${f}`, { method: "PATCH", headers: H, body: JSON.stringify(b) }); if (!r.ok) return null; return r.json(); } catch { return null; } },
};

// ── Formatters ─────────────────────────────────────────────────────────
const D = n => `RD$${new Intl.NumberFormat("es-DO").format(Math.round(Math.abs(n || 0)))}`;
const U = n => `$${Math.abs(n || 0).toFixed(2)}`;
const pct = (a, b) => b > 0 ? Math.min(100, (a / b) * 100) : 0;
const TC = 61.4;

// ── Estado inicial ─────────────────────────────────────────────────────
const INIT = {
  tc: 61.4,
  mes: "Septiembre",
  // Fuentes de ingreso
  fuentes: [
    { id: "eted1", nombre: "ETED 1°", color: "#2DD4BF", monto: 110000, credito: 15335, nota: "Crédito COOPETED incluido" },
    { id: "mem",   nombre: "MEM",    color: "#60A5FA", monto: 61200,  credito: 0,     nota: "" },
    { id: "cne",   nombre: "CNE",    color: "#F97316", monto: 140000, credito: 0,     nota: "" },
    { id: "eted2", nombre: "ETED 2°",color: "#A78BFA", monto: 90000,  credito: 0,     nota: "" },
    { id: "fs",    nombre: "Cliente FS", color: "#34D399", monto: 120000, credito: 0, nota: "Irregular — separado del balance fijo" },
  ],
  // Sobres por fuente
  sobres: [
    // ETED 1° — 94,665
    { id: "s1",  fuente: "eted1", concepto: "Colegio",          categoria: "educacion", monto: 27500 },
    { id: "s2",  fuente: "eted1", concepto: "Extra (alquiler)", categoria: "vivienda",  monto: 36600 },
    { id: "s3",  fuente: "eted1", concepto: "Social",           categoria: "social",    monto: 8000  },
    { id: "s4",  fuente: "eted1", concepto: "Salud",            categoria: "salud",     monto: 10000 },
    { id: "s5",  fuente: "eted1", concepto: "Extracredito",     categoria: "deuda",     monto: 2500  },
    { id: "s6",  fuente: "eted1", concepto: "Reservas",         categoria: "ahorro",    monto: 10000 },
    // ETED 1° + COOPETED → Hipoteca
    { id: "s7",  fuente: "eted1", concepto: "Pago hipotecario", categoria: "vivienda",  monto: 170465 },
    // MEM + CNE → resto hogar
    { id: "s8",  fuente: "cne",   concepto: "Alimentación",     categoria: "alimentacion", monto: 13500 },
    { id: "s9",  fuente: "cne",   concepto: "Mantenimiento apto",categoria: "vivienda",  monto: 17045 },
    // ETED 2°
    { id: "s10", fuente: "eted2", concepto: "Alimentación 1",   categoria: "alimentacion", monto: 18500 },
    { id: "s11", fuente: "eted2", concepto: "Electricidad",     categoria: "servicios", monto: 12000 },
    { id: "s12", fuente: "eted2", concepto: "Alimentación 2",   categoria: "alimentacion", monto: 8000  },
    { id: "s13", fuente: "eted2", concepto: "Yeli",             categoria: "hogar",     monto: 17000 },
    { id: "s14", fuente: "eted2", concepto: "Valentina",        categoria: "hogar",     monto: 6000  },
    { id: "s15", fuente: "eted2", concepto: "LUMURI Recrea",    categoria: "social",    monto: 10000 },
  ],
  // Tarjetas
  tarjetas: [
    { id: "edesur",     nombre: "EDESUR BHD Master",  color: "#EF4444", saldo: 0,     presup: 12000, cashback: 0.05, notas: "Cashback electricidad" },
    { id: "visapremia", nombre: "Visa Premia BHD",    color: "#F97316", saldo: 88421, presup: 21500, cashback: 0.05, notas: "Cashback mercado" },
    { id: "bravo",      nombre: "Bravo BSC Visa",     color: "#A78BFA", saldo: 45323, presup: 46000, cashback: 0.07, notas: "Cashback Bravo/Uber/UberEats" },
    { id: "banres",     nombre: "Banreservas MC",     color: "#60A5FA", saldo: 64203, presup: 30500, cashback: 0,    notas: "Float corriente" },
    { id: "promerica",  nombre: "Promerica Visa Gold",color: "#34D399", saldo: 0,     presup: 0,     cashback: 0,    notas: "Liquidada ✅" },
  ],
  extracredito: { saldo: 45077, abono: 2500 },
  // USD
  usd: {
    ingresos: 1000,
    streaming: 24.97,
    netflix: 17.98,
    hbo: 0,
    appletv: 6.99,
    ia: 54.28,
    google: 4.99,
    chatgpt: 20,
    claude: 20,
    instagram: 9.29,
    subtotal_gastos: 79.25,
  },
};

const CATS = {
  vivienda:     { icon: "🏠", label: "Vivienda",      color: "#EF4444" },
  educacion:    { icon: "📚", label: "Educación",      color: "#8B5CF6" },
  alimentacion: { icon: "🍽️",  label: "Alimentación",  color: "#10B981" },
  hogar:        { icon: "🏡", label: "Personal hogar", color: "#F59E0B" },
  servicios:    { icon: "🔌", label: "Servicios",      color: "#6366F1" },
  salud:        { icon: "💊", label: "Salud",          color: "#EC4899" },
  social:       { icon: "🎉", label: "Social",         color: "#14B8A6" },
  deuda:        { icon: "💳", label: "Deuda",          color: "#EF4444" },
  ahorro:       { icon: "💰", label: "Ahorro",         color: "#22C55E" },
};

const MESES_L = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];

// ── Theme ──────────────────────────────────────────────────────────────
const T = { bg: "#09090B", surf: "#18181B", bord: "#27272A", text: "#FAFAFA", muted: "#71717A", sub: "#3F3F46" };

// ── Micro components ───────────────────────────────────────────────────
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
const Num = ({ children, style = {} }) => (
  <span style={{ fontFamily: "monospace", ...style }}>{children}</span>
);
const Label = ({ children }) => (
  <div style={{ fontSize: 10, color: T.muted, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.08em" }}>{children}</div>
);

// ── Edit field ─────────────────────────────────────────────────────────
const EditNum = ({ value, onChange, color = T.text, prefix = "RD$", style = {} }) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);
  if (editing) return (
    <input type="number" value={val} autoFocus
      onChange={e => setVal(e.target.value)}
      onBlur={() => { onChange(parseFloat(val) || 0); setEditing(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onChange(parseFloat(val) || 0); setEditing(false); } }}
      style={{ background: T.sub, border: `1px solid ${color}`, borderRadius: 6, padding: "3px 8px", color, fontFamily: "monospace", fontSize: 14, width: 120, outline: "none", ...style }} />
  );
  return (
    <span onClick={() => { setVal(value); setEditing(true); }} style={{ fontFamily: "monospace", color, cursor: "text", borderBottom: `1px dashed ${color}44`, ...style }}>
      {prefix}{new Intl.NumberFormat("es-DO").format(Math.round(value))}
    </span>
  );
};

// ── MAIN ───────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData] = useState(INIT);
  const [tab, setTab] = useState("resumen");
  const [saved, setSaved] = useState(false);

  // Cargar datos de Supabase al inicio
  useEffect(() => {
    db.get("panel_raniero", "order=id.desc&limit=1").then(rows => {
      if (rows && rows.length > 0 && rows[0].datos) {
        try { setData(JSON.parse(rows[0].datos)); } catch {}
      }
    });
  }, []);

  const save = useCallback(async (newData) => {
    setData(newData);
    await db.post("panel_raniero", { datos: JSON.stringify(newData), updated_at: new Date().toISOString() });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  }, []);

  const upd = (path, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const keys = path.split(".");
    let obj = clone;
    for (let i = 0; i < keys.length - 1; i++) obj = obj[keys[i]];
    obj[keys[keys.length - 1]] = val;
    save(clone);
  };

  const updSobre = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const s = clone.sobres.find(s => s.id === id);
    if (s) s[field] = val;
    save(clone);
  };

  const updTarjeta = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const t = clone.tarjetas.find(t => t.id === id);
    if (t) t[field] = val;
    save(clone);
  };

  const updFuente = (id, field, val) => {
    const clone = JSON.parse(JSON.stringify(data));
    const f = clone.fuentes.find(f => f.id === id);
    if (f) f[field] = val;
    save(clone);
  };

  // ── Cálculos derivados ───────────────────────────────────────────────
  const ingresoFijo = data.fuentes.filter(f => f.id !== "fs").reduce((s, f) => s + f.monto + f.credito, 0);
  const ingresoTotal = data.fuentes.reduce((s, f) => s + f.monto + f.credito, 0);
  const totalSobres = data.sobres.reduce((s, x) => s + x.monto, 0);
  const balanceFijo = ingresoFijo - totalSobres;
  const balanceTotal = ingresoTotal - totalSobres;

  // Por categoría
  const porCat = Object.entries(CATS).map(([id, meta]) => ({
    id, ...meta,
    total: data.sobres.filter(s => s.categoria === id).reduce((a, s) => a + s.monto, 0),
  })).filter(c => c.total > 0).sort((a, b) => b.total - a.total);

  // Por fuente
  const porFuente = data.fuentes.map(f => ({
    ...f,
    ingreso_neto: f.monto + f.credito,
    gastado: data.sobres.filter(s => s.fuente === f.id).reduce((a, s) => a + s.monto, 0),
  }));

  // Tarjetas
  const totalDeuda = data.tarjetas.reduce((s, t) => s + t.saldo, 0) + data.extracredito.saldo;
  const totalCashback = data.tarjetas.reduce((s, t) => s + (t.saldo * t.cashback), 0);

  // USD
  const saldoUSD = data.usd.ingresos - data.usd.subtotal_gastos;
  const saldoUSD_DOP = saldoUSD * data.tc;

  // Hipoteca %
  const hipotecaMonto = data.sobres.find(s => s.id === "s7")?.monto || 170465;
  const pctHipFijo = pct(hipotecaMonto, ingresoFijo);
  const pctHipTotal = pct(hipotecaMonto, ingresoTotal);

  const TABS = [
    { id: "resumen",  l: "📊 Resumen"  },
    { id: "sobres",   l: "💼 Sobres"   },
    { id: "tarjetas", l: "💳 Tarjetas" },
    { id: "usd",      l: "$ USD"       },
    { id: "editar",   l: "⚙️ Editar"   },
  ];

  return (
    <div style={{ minHeight: "100vh", background: T.bg, fontFamily: "'Inter',system-ui,sans-serif", color: T.text, maxWidth: 640, margin: "0 auto" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');*{box-sizing:border-box;margin:0;padding:0}input,select{outline:none}::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-thumb{background:${T.sub};border-radius:2px}button:active{opacity:.85;transform:scale(.98)}`}</style>

      {/* Header */}
      <div style={{ background: T.surf, borderBottom: `1px solid ${T.bord}`, padding: "14px 16px", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: "-0.02em" }}>Raniero Cassoni</div>
            <div style={{ fontSize: 11, color: T.muted, marginTop: 1, fontFamily: "monospace" }}>
              {data.mes} 2026 · TC RD${data.tc}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {saved && <Chip color="#22C55E">✓ Guardado</Chip>}
            <Chip color={balanceFijo >= 0 ? "#22C55E" : "#EF4444"}>
              {balanceFijo >= 0 ? "+" : ""}{D(balanceFijo)}
            </Chip>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background: T.surf, borderBottom: `1px solid ${T.bord}`, display: "flex", overflowX: "auto" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: "none", background: "transparent", border: "none", borderBottom: tab === t.id ? "2px solid #fff" : "2px solid transparent", color: tab === t.id ? T.text : T.muted, padding: "10px 14px", cursor: "pointer", fontSize: 12, fontWeight: tab === t.id ? 600 : 400, whiteSpace: "nowrap" }}>{t.l}</button>
        ))}
      </div>

      <div style={{ padding: 16 }}>

        {/* ══ RESUMEN ══════════════════════════════════════════════════ */}
        {tab === "resumen" && (
          <div>
            {/* KPIs */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { l: "Ingresos fijos", v: D(ingresoFijo), c: "#22C55E", sub: `+${D(data.fuentes.find(f=>f.id==="fs")?.monto||0)} FS` },
                { l: "Comprometido", v: D(totalSobres), c: "#F97316", sub: `${pct(totalSobres,ingresoFijo).toFixed(0)}% del fijo` },
                { l: "Balance fijo", v: D(Math.abs(balanceFijo)), c: balanceFijo >= 0 ? "#22C55E" : "#EF4444", sub: balanceFijo >= 0 ? "Positivo ✅" : "Déficit 🔴" },
                { l: "Con Cliente FS", v: D(Math.abs(balanceTotal)), c: balanceTotal >= 0 ? "#2DD4BF" : "#EF4444", sub: balanceTotal >= 0 ? "Holgado" : "En rojo" },
              ].map((k, i) => (
                <Card key={i} style={{ padding: "14px 16px" }}>
                  <Label>{k.l}</Label>
                  <Num style={{ fontSize: 18, fontWeight: 700, color: k.c, display: "block", lineHeight: 1 }}>{k.v}</Num>
                  <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>{k.sub}</div>
                </Card>
              ))}
            </div>

            {/* Barra presupuesto */}
            <Card style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Ejecución presupuesto</span>
                <Num style={{ fontSize: 13, color: T.muted }}>{pct(totalSobres, ingresoFijo).toFixed(0)}%</Num>
              </div>
              <Bar v={totalSobres} max={ingresoFijo} color={totalSobres > ingresoFijo ? "#EF4444" : "#22C55E"} h={10} />
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: T.muted }}>
                <span>Comprometido: {D(totalSobres)}</span>
                <span>Fijo: {D(ingresoFijo)}</span>
              </div>
            </Card>

            {/* Hipoteca % */}
            <Card style={{ marginBottom: 14, background: pctHipFijo > 40 ? "#EF444411" : T.surf, borderColor: pctHipFijo > 40 ? "#EF444444" : T.bord }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "center" }}>
                <span style={{ fontSize: 13, fontWeight: 600 }}>🏠 Hipoteca</span>
                <div style={{ display: "flex", gap: 6 }}>
                  <Chip color={pctHipFijo > 40 ? "#EF4444" : "#22C55E"}>{pctHipFijo.toFixed(1)}% fijo</Chip>
                  <Chip color="#2DD4BF">{pctHipTotal.toFixed(1)}% total</Chip>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <div>
                  <Label>Cuota mensual</Label>
                  <Num style={{ fontSize: 16, fontWeight: 700, color: "#EF4444" }}>{D(hipotecaMonto)}</Num>
                </div>
                <div>
                  <Label>Meta % (límite sano)</Label>
                  <Num style={{ fontSize: 16, fontWeight: 700, color: "#22C55E" }}>35%</Num>
                </div>
              </div>
              <div style={{ marginTop: 10, fontSize: 11, color: T.muted, fontStyle: "italic" }}>
                {pctHipFijo > 40 ? `🔴 ${(pctHipFijo - 35).toFixed(1)}pp por encima del límite — ok mientras deuda = 0` : "✅ Dentro del rango recomendado sobre ingreso total"}
              </div>
            </Card>

            {/* Por categoría */}
            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Distribución por categoría</div>
              {porCat.map(cat => (
                <div key={cat.id} style={{ marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, alignItems: "center" }}>
                    <span style={{ fontSize: 13 }}>{cat.icon} {cat.label}</span>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <Num style={{ fontSize: 13, fontWeight: 600, color: cat.color }}>{D(cat.total)}</Num>
                      <span style={{ fontSize: 11, color: T.muted }}>{pct(cat.total, totalSobres).toFixed(0)}%</span>
                    </div>
                  </div>
                  <Bar v={cat.total} max={totalSobres} color={cat.color} h={5} />
                </div>
              ))}
            </Card>
          </div>
        )}

        {/* ══ SOBRES ═══════════════════════════════════════════════════ */}
        {tab === "sobres" && (
          <div>
            {data.fuentes.map(fuente => {
              const sobre_f = data.sobres.filter(s => s.fuente === fuente.id);
              const total_f = sobre_f.reduce((a, s) => a + s.monto, 0);
              const ingreso_f = fuente.monto + fuente.credito;
              const balance_f = ingreso_f - total_f;
              return (
                <div key={fuente.id} style={{ marginBottom: 18 }}>
                  {/* Header fuente */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: fuente.color + "15", borderRadius: 10, border: `1px solid ${fuente.color}33`, marginBottom: 8 }}>
                    <div>
                      <span style={{ fontWeight: 700, color: fuente.color, fontSize: 14 }}>{fuente.nombre}</span>
                      {fuente.credito > 0 && <span style={{ fontSize: 10, color: T.muted, marginLeft: 8 }}>+{D(fuente.credito)} crédito</span>}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <Num style={{ fontSize: 14, fontWeight: 700, color: fuente.color }}>{D(ingreso_f)}</Num>
                      <div style={{ fontSize: 10, color: balance_f >= 0 ? "#22C55E" : "#EF4444" }}>saldo: {D(balance_f)}</div>
                    </div>
                  </div>

                  {sobre_f.length === 0 ? (
                    <div style={{ padding: "10px 12px", color: T.muted, fontSize: 12, fontStyle: "italic" }}>Sin sobres asignados</div>
                  ) : sobre_f.map(s => {
                    const cat = CATS[s.categoria];
                    return (
                      <div key={s.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", background: T.surf, border: `1px solid ${T.bord}`, borderRadius: 8, marginBottom: 6 }}>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flex: 1 }}>
                          <span style={{ fontSize: 14 }}>{cat?.icon}</span>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500 }}>{s.concepto}</div>
                            <Chip color={cat?.color || "#888"} sm>{cat?.label}</Chip>
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <EditNum value={s.monto} onChange={v => updSobre(s.id, "monto", v)} color={fuente.color} />
                          <div style={{ fontSize: 10, color: T.muted }}>{pct(s.monto, ingreso_f).toFixed(1)}%</div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Barra uso fuente */}
                  <div style={{ marginTop: 6 }}>
                    <Bar v={total_f} max={ingreso_f} color={total_f > ingreso_f ? "#EF4444" : fuente.color} h={4} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ TARJETAS ═════════════════════════════════════════════════ */}
        {tab === "tarjetas" && (
          <div>
            {/* KPI deuda */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <Card style={{ padding: "14px 16px" }}>
                <Label>Deuda total</Label>
                <Num style={{ fontSize: 20, fontWeight: 700, color: "#EF4444", display: "block" }}>{D(totalDeuda)}</Num>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>incl. Extracredito</div>
              </Card>
              <Card style={{ padding: "14px 16px" }}>
                <Label>Cashback estimado</Label>
                <Num style={{ fontSize: 20, fontWeight: 700, color: "#22C55E", display: "block" }}>{D(totalCashback)}</Num>
                <div style={{ fontSize: 10, color: T.muted, marginTop: 4 }}>sobre saldos actuales</div>
              </Card>
            </div>

            {data.tarjetas.map(t => {
              const cb = t.saldo * t.cashback;
              const usoP = pct(t.saldo, t.presup > 0 ? t.presup + t.saldo : t.saldo || 1);
              return (
                <Card key={t.id} style={{ marginBottom: 10 }} accent={t.color}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10, alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.color }}>{t.nombre}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>{t.notas}</div>
                    </div>
                    {t.cashback > 0 && <Chip color={t.color}>{(t.cashback * 100).toFixed(0)}% CB</Chip>}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 10 }}>
                    <div>
                      <Label>Saldo</Label>
                      <EditNum value={t.saldo} onChange={v => updTarjeta(t.id, "saldo", v)} color="#EF4444" />
                    </div>
                    <div>
                      <Label>Presupuesto</Label>
                      <EditNum value={t.presup} onChange={v => updTarjeta(t.id, "presup", v)} color={t.color} />
                    </div>
                    <div>
                      <Label>Cashback</Label>
                      <Num style={{ color: "#22C55E", fontSize: 14, fontWeight: 700 }}>{D(cb)}</Num>
                    </div>
                  </div>
                  {t.saldo > 0 && <Bar v={t.saldo} max={t.saldo + t.presup} color={t.color} h={5} />}
                </Card>
              );
            })}

            {/* Extracredito */}
            <Card accent="#6366F1">
              <div style={{ fontWeight: 700, fontSize: 14, color: "#6366F1", marginBottom: 10 }}>Extracredito</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <Label>Saldo</Label>
                  <EditNum value={data.extracredito.saldo} onChange={v => upd("extracredito.saldo", v)} color="#EF4444" />
                </div>
                <div>
                  <Label>Abono mensual</Label>
                  <EditNum value={data.extracredito.abono} onChange={v => upd("extracredito.abono", v)} color="#6366F1" />
                </div>
              </div>
              <div style={{ marginTop: 8, fontSize: 11, color: T.muted }}>
                Meses restantes: ~{Math.ceil(data.extracredito.saldo / data.extracredito.abono)}
              </div>
            </Card>
          </div>
        )}

        {/* ══ USD ══════════════════════════════════════════════════════ */}
        {tab === "usd" && (
          <div>
            <Card style={{ marginBottom: 14, borderTop: `2px solid #F59E0B` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 14, alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700 }}>Flujo en USD</div>
                  <div style={{ fontSize: 11, color: T.muted }}>TC: <EditNum value={data.tc} onChange={v => upd("tc", v)} color="#F59E0B" prefix="" /> DOP/USD</div>
                </div>
                <Chip color={saldoUSD >= 0 ? "#22C55E" : "#EF4444"}>
                  {saldoUSD >= 0 ? "+" : ""}{U(saldoUSD)} saldo
                </Chip>
              </div>

              <div style={{ marginBottom: 14 }}>
                <Label>Ingreso en USD</Label>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13 }}>Cliente / ingresos</span>
                  <EditNum value={data.usd.ingresos} onChange={v => upd("usd.ingresos", v)} color="#22C55E" prefix="$" />
                </div>
              </div>

              <div style={{ borderTop: `1px solid ${T.bord}`, paddingTop: 14 }}>
                <Label>Suscripciones y servicios</Label>
                {[
                  ["Streaming (total)", "streaming"],
                  ["Netflix", "netflix"],
                  ["HBO Max", "hbo"],
                  ["Apple TV", "appletv"],
                  ["Servicios IA", "ia"],
                  ["Google", "google"],
                  ["ChatGPT", "chatgpt"],
                  ["Claude", "claude"],
                  ["Instagram", "instagram"],
                ].map(([label, key]) => (
                  <div key={key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderBottom: `1px solid ${T.bord}` }}>
                    <span style={{ fontSize: 13, color: T.muted }}>{label}</span>
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <EditNum value={data.usd[key]} onChange={v => upd(`usd.${key}`, v)} color="#F97316" prefix="$" />
                      <span style={{ fontSize: 11, color: T.muted }}>{D(data.usd[key] * data.tc)}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                {[
                  { l: "Total gastos $", v: U(data.usd.subtotal_gastos), c: "#EF4444" },
                  { l: "Saldo USD", v: U(saldoUSD), c: saldoUSD >= 0 ? "#22C55E" : "#EF4444" },
                  { l: "Equiv. DOP", v: D(saldoUSD_DOP), c: "#2DD4BF" },
                ].map((x, i) => (
                  <div key={i} style={{ textAlign: "center", padding: "10px 8px", background: T.bg, borderRadius: 10 }}>
                    <Label>{x.l}</Label>
                    <Num style={{ fontSize: 14, fontWeight: 700, color: x.c }}>{x.v}</Num>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* ══ EDITAR ═══════════════════════════════════════════════════ */}
        {tab === "editar" && (
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
                  <EditNum value={f.monto} onChange={v => updFuente(f.id, "monto", v)} color={f.color} />
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", paddingTop: 12 }}>
                <span style={{ fontWeight: 700 }}>Total fijo</span>
                <Num style={{ fontSize: 16, fontWeight: 700, color: "#22C55E" }}>{D(ingresoFijo)}</Num>
              </div>
            </Card>

            <Card style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Mes y configuración</div>
              <div style={{ marginBottom: 12 }}>
                <Label>Mes actual</Label>
                <select value={data.mes} onChange={e => upd("mes", e.target.value)}
                  style={{ width: "100%", background: T.bg, border: `1px solid ${T.bord}`, borderRadius: 10, padding: "9px 12px", color: T.text, fontSize: 13 }}>
                  {MESES_L.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <Label>Tipo de cambio (DOP/USD)</Label>
                <EditNum value={data.tc} onChange={v => upd("tc", v)} color="#F59E0B" prefix="" />
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 14 }}>Resumen de cambios</div>
              {[
                { l: "Ingresos fijos", v: D(ingresoFijo), c: "#22C55E" },
                { l: "Total comprometido", v: D(totalSobres), c: "#F97316" },
                { l: "Balance fijo", v: D(Math.abs(balanceFijo)), c: balanceFijo >= 0 ? "#22C55E" : "#EF4444" },
                { l: "Con Cliente FS", v: D(Math.abs(balanceTotal)), c: balanceTotal >= 0 ? "#2DD4BF" : "#EF4444" },
                { l: "Deuda tarjetas", v: D(totalDeuda), c: "#EF4444" },
                { l: "Cashback total", v: D(totalCashback), c: "#22C55E" },
              ].map((x, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 5 ? `1px solid ${T.bord}` : "none" }}>
                  <span style={{ fontSize: 13, color: T.muted }}>{x.l}</span>
                  <Num style={{ fontSize: 14, fontWeight: 600, color: x.c }}>{x.v}</Num>
                </div>
              ))}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
