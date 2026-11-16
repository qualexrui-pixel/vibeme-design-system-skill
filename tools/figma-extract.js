/* ============================================================================
 * VibeMe 设计系统 · Figma 组件提取器 —— 冻结版 v2
 * ----------------------------------------------------------------------------
 * 用法：把本文件**全文**粘进 mcp__figma__use_figma 的 code 参数，
 *      替换下面第 0 节的 4 个参数（SLUG / SET_ID / MODE / VARIANT）后执行，
 *      返回一段 JSON 字符串（该组件集的原始事实）。
 *      调用模板与文件名约定见 tools/figma-extract.md。
 *
 * 两种 MODE
 *   variants —— 导出该组件集**全部变体**的「浅层但完整」事实（depth 0，不展开子节点）。
 *               用途：变体矩阵、状态差异（哪个变体在顶层改了颜色/变量/尺寸/内边距）。
 *   tree     —— 只导出 VARIANT 指定的**那一个变体**的深树（MAX_DEPTH=6，带 children）。
 *               用途：结构、内嵌关系（INSTANCE.main）、文字与排版事实。
 *
 * 与 v1 的关键差异（务必照此理解产出）
 *   1) 变体**不再递归展开子节点**（v1 展开导致 Button 66KB 直接超限）。
 *   2) 变量绑定改为**优先读每个 paint / effect 自身的 boundVariables**，
 *      node 级 boundVariables 只作兜底。v1 只读 node 级数组，而 Figma 返回的
 *      `boundVariables.fills` 顺序有时与 `fills` 数组**相反**，会把 #202020 标成
 *      White/White-7（Button secondary hover 实测踩坑）。
 *   3) 所有变量引用一律走下标 `variablesUsed[i]`，不再重复写变量名。
 *   4) out.bytes 自报体积 + 逐级自动降级，绝不把 48000B 硬上限撞崩。
 *
 * 体积（use_figma 返回值硬上限 48000B，超限整次运行作废）
 *   预算 MAX_BYTES=46000，按 out.bytes（UTF-8 字节）与 out.chars（字符数）双控。
 *   降级顺序：tree 层数 6→1 → variants 的 fills 只留第一层 paint（变量下标保留）
 *            → text.chars 截断到 24。每一步都记进 out.trimmed。
 *   ★ 任何降级都不允许丢掉「这个变体绑了哪些变量」——v/fills[].v 永远保留。
 *
 * 字段说明见 tools/figma-extract.md
 * ========================================================================== */

/* ---------------------------------------------------------------- 0. 参数 */
const SLUG = "__SLUG__";
const SET_ID = "__SET_ID__";
const MODE = "__MODE__";          // "variants" | "tree"
const VARIANT = "__VARIANT__";    // MODE="tree" 时的变体全名；"" = defaultVariant
const MAX_DEPTH = 6;              // tree 模式最大层数
const MAX_TEXT = 80;              // TEXT.chars 截断长度
const MAX_BYTES = 46000;          // v2 预算（UTF-8 字节）
const HARD_BYTES = 47800;         // 绝对不能碰的线：最终 JSON 必须低于它

// DEBUG=true 时额外返回 raw（node 级 boundVariables 原始数组 + paint 级 color.id），
// 用来核验「node 级 vs paint 级」的顺序差异；正式导出请保持 false（省体积）。
const DEBUG = false;
const DEBUG_NODE = "";            // DEBUG=true 时只看这个 node id / 变体名；"" = 第一个变体

/* ------------------------------------------------------- 1. 基础工具函数 */
let IDX = null;                   // Map<variableId, index>
const VC = new Map();             // Map<variableId, name|null>

async function vname(id) {
  if (!id) return null;
  if (VC.has(id)) return VC.get(id);
  let nm = null;
  try { const v = await figma.variables.getVariableByIdAsync(id); nm = v ? v.name : null; } catch (e) { nm = null; }
  VC.set(id, nm);
  return nm;
}
function vindex(id) {             // 变量 id → 下标（0 合法，null 表示没有变量表可用）
  if (!id || !IDX) return null;
  if (!IDX.has(id)) IDX.set(id, -1);   // 占位，collect() 里补名
  return IDX.get(id);
}
function vref(id) {               // 优先下标；IDX 未就绪时退回变量名
  if (!id) return null;
  return IDX ? vindex(id) : null;
}
function paintVid(p) {            // ★ v2 核心：paint 自身的绑定
  const b = p && p.boundVariables;
  return (b && b.color && b.color.id) ? b.color.id : null;
}

// 数值是 figma.mixed（symbol）时返回 "mixed"，绝不把 symbol 带进 JSON
const num = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : v === figma.mixed ? "mixed" : null);
const nn = (v) => (typeof v === "number" && isFinite(v) ? Math.round(v * 100) / 100 : null);   // 非数值直接 null
function bool(v) { return typeof v === "boolean" ? v : null; }                                 // figma.mixed → null
function str(v) { return typeof v === "string" ? v : null; }

function hexOf(c) {
  if (!c || typeof c.r !== "number") return null;
  const h = (x) => Math.max(0, Math.min(255, Math.round(x * 255))).toString(16).toUpperCase().padStart(2, "0");
  return "#" + h(c.r) + h(c.g) + h(c.b);
}
const alphaOf = (c) => (c && typeof c.a === "number" ? Math.round(c.a * 1000) / 1000 : 1);

/* ---------------------------------------------------- 2. paint / effects */
// 每个 paint 的事实：type / hex / alpha(含 paint opacity) / opacity / v(变量下标) / visible
async function paintInfo(p) {
  if (!p || typeof p !== "object") return null;
  const o = { type: String(p.type) };
  if (p.type === "SOLID") {
    o.hex = hexOf(p.color);
    const a = alphaOf(p.color);
    const op = typeof p.opacity === "number" ? Math.round(p.opacity * 1000) / 1000 : 1;
    o.alpha = Math.round(a * op * 1000) / 1000;
    if (op !== 1) o.opacity = op;
  } else if (String(p.type).indexOf("GRADIENT") === 0) {
    o.stops = (p.gradientStops || []).map((s) => ({ pos: Math.round(s.position * 100) / 100, hex: hexOf(s.color), alpha: alphaOf(s.color) }));
  } else if (p.type === "IMAGE") {
    o.image = true;
    if (p.scaleMode) o.scaleMode = String(p.scaleMode);
  }
  const vid = paintVid(p);
  if (vid) { const i = vref(vid); if (i !== null && i !== undefined) o.v = i; }
  if (p.visible === false) o.visible = false;
  return o;
}

async function paintList(ps, node, prop) {
  if (!ps || ps === figma.mixed) return null;
  if (!Array.isArray(ps)) return null;
  const arr = [];
  for (const p of ps) { const o = await paintInfo(p); if (o) arr.push(o); }
  // 兜底：仅当 paint 级**一个**绑定都没读到、且 node 级数组长度与 paints 完全一致时才用。
  // 顺序不可信 —— 读出来的绑定信息依然保留，但顺序按 node 级数组（v1 的错位来源）。
  const fallback = node && node.boundVariables ? node.boundVariables[prop] : null;
  if (Array.isArray(fallback) && fallback.length === arr.length && arr.length > 0) {
    const anyPaintLevel = ps.some((p) => paintVid(p));
    if (!anyPaintLevel) {
      for (let i = 0; i < arr.length; i++) {
        const id = fallback[i] && fallback[i].id;
        if (id && arr[i].v === undefined) { const ix = vref(id); if (ix !== null) arr[i].v = ix; }
      }
    }
  }
  return arr.length ? arr : null;
}

async function effectList(es, node) {
  if (!es || es === figma.mixed || !Array.isArray(es) || !es.length) return null;
  const arr = [];
  for (const e of es) {
    const o = { type: String(e.type) };
    o.hex = hexOf(e.color);
    if (e.color) {
      const a = alphaOf(e.color);
      if (a !== 1) o.alpha = a;
    }
    if (e.offset) o.offset = { x: Math.round(e.offset.x * 100) / 100, y: Math.round(e.offset.y * 100) / 100 };
    if (typeof e.radius === "number") o.radius = Math.round(e.radius * 100) / 100;
    if (typeof e.spread === "number" && e.spread !== 0) o.spread = Math.round(e.spread * 100) / 100;
    const vid = e.boundVariables && e.boundVariables.color && e.boundVariables.color.id ? e.boundVariables.color.id : null;
    if (vid) { const i = vref(vid); if (i !== null) o.v = i; }
    if (e.visible === false) o.visible = false;
    arr.push(o);
  }
  // 兜底：node 级 effects 数组（同样只在长度一致且 paint 级全空时使用）
  const fb = node && node.boundVariables ? node.boundVariables.effects : null;
  if (Array.isArray(fb) && fb.length === arr.length) {
    const anyLevel = es.some((e) => e.boundVariables && e.boundVariables.color && e.boundVariables.color.id);
    if (!anyLevel) {
      for (let i = 0; i < arr.length; i++) {
        const id = fb[i] && fb[i].id;
        if (id && arr[i].v === undefined) { const ix = vref(id); if (ix !== null) arr[i].v = ix; }
      }
    }
  }
  return arr.length ? arr : null;
}
async function effectStyleName(id) {
  if (!id) return null;
  try { const s = await figma.getStyleByIdAsync(id); return s ? s.name : String(id); } catch (e) { return null; }
}

/* --------------------------------------------------------- 3. auto layout */
async function autoInfo(n) {
  if (!n.layoutMode || n.layoutMode === "NONE") return null;
  const o = {
    mode: String(n.layoutMode),
    gap: nn(n.itemSpacing),
    pad: [nn(n.paddingTop), nn(n.paddingRight), nn(n.paddingBottom), nn(n.paddingLeft)],
    hAlign: str(n.primaryAxisAlignItems),
    vAlign: str(n.counterAxisAlignItems),
    wSizing: str(n.layoutSizingHorizontal),
    hSizing: str(n.layoutSizingVertical)
  };
  if (n.layoutWrap === "WRAP") o.wrap = true;
  // auto layout 上的变量绑定（数值型变量，按数值本身解释）
  const b = n.boundVariables || {};
  const vars = {};
  if (b.itemSpacing && b.itemSpacing.id) { const i = vref(b.itemSpacing.id); if (i !== null) vars.gap = i; }
  const padKeys = ["paddingTop", "paddingRight", "paddingBottom", "paddingLeft"];
  if (padKeys.some((k) => b[k] && b[k].id)) {
    vars.pad = padKeys.map((k) => { const id = b[k] && b[k].id; return id ? vref(id) : null; });
  }
  if (b.primaryAxisAlignItems && b.primaryAxisAlignItems.id) { const i = vref(b.primaryAxisAlignItems.id); if (i !== null) vars.hAlign = i; }
  if (b.counterAxisAlignItems && b.counterAxisAlignItems.id) { const i = vref(b.counterAxisAlignItems.id); if (i !== null) vars.vAlign = i; }
  if (Object.keys(vars).length) o.vars = vars;
  return o;
}

/* -------------------------------------------------------- 4. TEXT 事实块 */
function lineHeightOf(x) {
  if (!x || x === figma.mixed) return null;
  if (typeof x === "number") return x;
  if (x.unit === "PIXELS") return Math.round(x.value * 100) / 100;
  if (x.unit === "PERCENT") return Math.round(x.value) + "%";
  if (x.unit === "AUTO") return "auto";
  return null;
}
function letterSpacingOf(x) {
  if (!x || x === figma.mixed) return null;
  if (x.unit === "PIXELS") return Math.round(x.value * 100) / 100;
  if (x.unit === "PERCENT") return Math.round(x.value * 1000) / 1000;
  return null;
}
async function textInfo(n) {
  const fn = n.fontName;                                   // 可能是 figma.mixed
  const fname = fn && fn !== figma.mixed && typeof fn === "object" ? fn : null;
  const size = n.fontSize;                                 // 可能是 figma.mixed
  const lh = n.lineHeight;
  const ls = n.letterSpacing;
  const t = {
    chars: typeof n.characters === "string" ? n.characters.slice(0, MAX_TEXT) : "mixed",
    size: size === figma.mixed ? "mixed" : nn(size),
    weight: fname ? str(fname.style) : (fn === figma.mixed ? "mixed" : null),
    family: fname ? str(fname.family) : (fn === figma.mixed ? "mixed" : null),
    lineHeight: lh === figma.mixed ? "mixed" : lineHeightOf(lh),
    letterSpacing: ls === figma.mixed ? "mixed" : letterSpacingOf(ls),
    textCase: str(n.textCase),
    decoration: str(n.textDecoration),
    align: str(n.textAlignHorizontal),
    vAlign: str(n.textAlignVertical)
  };
  try {
    if (n.textStyleId && n.textStyleId !== figma.mixed) {
      const s = await figma.getStyleByIdAsync(n.textStyleId);
      t.textStyle = s ? s.name : String(n.textStyleId);
    }
  } catch (e) { /* ignore */ }
  // 文字上的变量绑定（fontSize 可能是 Symbol 类型，按百分比解释）
  const b = n.boundVariables || {};
  const vars = {};
  const KEYS = ["fontSize", "fontFamily", "fontStyle", "fontWeight", "lineHeight", "letterSpacing", "paragraphSpacing", "paragraphIndent", "textCase", "textDecoration"];
  for (const k of KEYS) if (b[k] && b[k].id) { const i = vref(b[k].id); if (i !== null) vars[k] = i; }
  if (Object.keys(vars).length) t.var = vars;
  const fl = await paintList(n.fills, n, "fills");
  if (fl) { t.v = fl; }                                     // 文字颜色的变量下标挂在 text.v 里
  return t;
}

/* --------------------------------------------------- 5. 单个节点的序列化 */
async function nodeInfo(n, depth, maxDepth, ctx) {
  const o = { id: n.id, type: String(n.type), name: n.name };
  const lim = typeof maxDepth === "number" ? maxDepth : MAX_DEPTH;

  if (typeof n.width === "number") o.w = nn(n.width);
  if (typeof n.height === "number") o.h = nn(n.height);
  const b = n.boundVariables || {};
  if (b.width && b.width.id) { const i = vref(b.width.id); if (i !== null) o.wVar = i; }
  if (b.height && b.height.id) { const i = vref(b.height.id); if (i !== null) o.hVar = i; }

  if (n.type === "INSTANCE") {
    try { const mc = await n.getMainComponentAsync(); if (mc) o.main = mc.name; } catch (e) { /* ignore */ }
  }

  const auto = await autoInfo(n);
  if (auto) o.auto = auto;

  const fl = await paintList(n.fills, n, "fills");
  if (fl) o.fills = fl;
  const st = await paintList(n.strokes, n, "strokes");
  if (st) o.strokes = st;
  if (b.strokes && typeof n.strokeWeight === "number") {
    const keys = ["strokeTopWeight", "strokeRightWeight", "strokeBottomWeight", "strokeLeftWeight"];
    const v = {};
    for (const k of keys) if (b[k] && b[k].id) { const i = vref(b[k].id); if (i !== null) v[k] = i; }
    if (Object.keys(v).length) o.strokeWeightVar = v;
  }
  if (typeof n.strokeWeight === "number") o.strokeWeight = nn(n.strokeWeight);
  else if (n.strokeWeight === figma.mixed) o.strokeWeight = "mixed";
  if (n.dashPattern && n.dashPattern.length) o.dashPattern = n.dashPattern;

  // 圆角：数值 or 四角；同时记录四角变量下标
  const cr = n.cornerRadius;
  if (cr === figma.mixed) {
    o.radius = { tl: nn(n.topLeftRadius), tr: nn(n.topRightRadius), br: nn(n.bottomRightRadius), bl: nn(n.bottomLeftRadius) };
  } else if (typeof cr === "number" && cr !== 0) o.radius = Math.round(cr * 100) / 100;
  const rk = ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"];
  if (rk.some((k) => b[k] && b[k].id)) {
    const v = {};
    for (const k of rk) { if (b[k] && b[k].id) { const i = vref(b[k].id); v[k] = i; } }
    o.radiusVar = v;
  }

  if (n.type === "TEXT") o.text = await textInfo(n);

  const ef = await effectList(n.effects, n);
  if (ef) o.effects = ef;
  const esn = await effectStyleName(n.effectStyleId);
  if (esn) o.effectStyle = esn;

  if (typeof n.opacity === "number" && Math.round(n.opacity * 1000) / 1000 !== 1) o.opacity = Math.round(n.opacity * 1000) / 1000;
  if (b.opacity && b.opacity.id) { const i = vref(b.opacity.id); if (i !== null) o.opVar = i; }
  if (b.visible && b.visible.id) { const i = vref(b.visible.id); if (i !== null) o.visibleVar = i; }
  if (n.visible === false) o.hidden = true;
  if (n.clipsContent === true) o.clip = true;

  if (ctx && ctx.collect) ctx.collect(n);          // 预扫描变量时只收绑定，不产出结构

  const VEC = n.type === "VECTOR" || n.type === "BOOLEAN_OPERATION" || n.type === "STAR" || n.type === "LINE" || n.type === "ELLIPSE" || n.type === "POLYGON";
  if (depth < lim && n.children && n.children.length && !VEC) {
    o.children = [];
    for (const c of n.children) {
      const cio = await nodeInfo(c, depth + 1, lim, ctx);
      if (cio) o.children.push(cio);
    }
    if (!o.children.length) delete o.children;
  }
  return o;
}

/* --------------------------------------------------- 6. 变量表（预扫描） */
function scanVars(n, add) {
  const b = n.boundVariables;
  if (b) for (const k of Object.keys(b)) {
    const v = b[k];
    const arr = Array.isArray(v) ? v : [v];
    for (const x of arr) if (x && x.id) add(x.id);
  }
  if (Array.isArray(n.fills)) for (const p of n.fills) { const id = paintVid(p); if (id) add(id); }
  if (Array.isArray(n.strokes)) for (const p of n.strokes) { const id = paintVid(p); if (id) add(id); }
  if (Array.isArray(n.effects)) for (const e of n.effects) {
    const id = e.boundVariables && e.boundVariables.color && e.boundVariables.color.id ? e.boundVariables.color.id : null;
    if (id) add(id);
  }
}
async function collectVars(root) {
  const seen = new Set();
  const walk = (n) => {
    if (!n || typeof n !== "object") return;
    scanVars(n, (id) => seen.add(id));
    if (n.children) for (const c of n.children) walk(c);
  };
  walk(root);
  const out = [];
  IDX = new Map();
  for (const id of seen) {
    if (IDX.has(id)) continue;
    IDX.set(id, out.length);
    out.push({ id, name: await vname(id) });
  }
  return out;
}

/* --------------------------------------------------- 7. 组件集与变体读取 */
const set = await figma.getNodeByIdAsync(SET_ID);
if (!set) return JSON.stringify({ ok: false, error: "component set not found", slug: SLUG, setId: SET_ID, mode: MODE });

const defs = {};
for (const k of Object.keys(set.componentPropertyDefinitions || {})) {
  const d = set.componentPropertyDefinitions[k] || {};
  defs[k] = {
    type: d.type,
    values: d.variantOptions || null,
    default: d.defaultValue !== undefined ? d.defaultValue : null
  };
}

const children = (set.children || []).slice();
const defVariant = set.defaultVariant || children[0] || null;

function propsOf(v) { return v.variantProperties ? Object.assign({}, v.variantProperties) : null; }
function pickVariant(name) {
  const target = String(name || "").trim();
  if (!target) return defVariant;
  for (const v of children) if (v.name === target) return v;
  const norm = (s) => String(s).replace(/\s+/g, "").toLowerCase();
  for (const v of children) if (norm(v.name) === norm(target)) return v;
  return null;
}

/* ----------------------------------- 8. 变体（浅层）：一个变体的顶层事实 */
async function variantFacts(v) {
  const o = { name: v.name };
  const p = propsOf(v);
  if (p) {
    const q = {};
    for (const k of Object.keys(p)) q[k] = str(p[k]);
    o.props = q;
  }
  await withNodeFields(v, o, 0, 0);
  return o;
}

// 与 nodeInfo 共享同一套字段逻辑，但**不展开 children**（浅层导出）
async function withNodeFields(n, o, depth, lim, ctx) {
  if (typeof n.width === "number") o.w = nn(n.width);
  if (typeof n.height === "number") o.h = nn(n.height);
  const b = n.boundVariables || {};
  if (b.width && b.width.id) { const i = vref(b.width.id); if (i !== null) o.wVar = i; }
  if (b.height && b.height.id) { const i = vref(b.height.id); if (i !== null) o.hVar = i; }
  const auto = await autoInfo(n);
  if (auto) o.auto = auto;
  const fl = await paintList(n.fills, n, "fills");
  if (fl) o.fills = fl;
  const st = await paintList(n.strokes, n, "strokes");
  if (st) o.strokes = st;
  if (typeof n.strokeWeight === "number") o.strokeWeight = nn(n.strokeWeight);
  if (n.dashPattern && n.dashPattern.length) o.dashPattern = n.dashPattern;
  const cr = n.cornerRadius;
  if (cr === figma.mixed) o.radius = { tl: nn(n.topLeftRadius), tr: nn(n.topRightRadius), br: nn(n.bottomRightRadius), bl: nn(n.bottomLeftRadius) };
  else if (typeof cr === "number" && cr !== 0) o.radius = Math.round(cr * 100) / 100;
  const rk = ["topLeftRadius", "topRightRadius", "bottomRightRadius", "bottomLeftRadius"];
  if (rk.some((k) => b[k] && b[k].id)) {
    const v = {};
    for (const k of rk) if (b[k] && b[k].id) v[k] = vref(b[k].id);
    o.radiusVar = v;
  }
  if (n.type === "TEXT") o.text = await textInfo(n);
  const ef = await effectList(n.effects, n);
  if (ef) o.effects = ef;
  if (typeof n.opacity === "number" && Math.round(n.opacity * 1000) / 1000 !== 1) o.opacity = Math.round(n.opacity * 1000) / 1000;
  if (b.opacity && b.opacity.id) { const i = vref(b.opacity.id); if (i !== null) o.opVar = i; }
  if (n.visible === false) o.hidden = true;
  if (n.clipsContent === true) o.clip = true;
  if (ctx && ctx.collect) ctx.collect(n);
  if (depth < lim && n.children && n.children.length) {
    o.children = [];
    for (const c of n.children) {
      const cio = { id: c.id, type: String(c.type), name: c.name };
      await withNodeFields(c, cio, depth + 1, lim, ctx);
      o.children.push(cio);
    }
  }
  return o;
}

/* --------------------------------------------------- 9. instances 统计 */
async function instanceCounts() {
  const out = {};
  const list = set.findAllWithCriteria ? set.findAllWithCriteria({ types: ["INSTANCE"] }) : [];
  for (const node of list) {
    let nm = "?";
    try { const mc = await node.getMainComponentAsync(); if (mc) nm = mc.name; } catch (e) { /* ignore */ }
    out[nm] = (out[nm] || 0) + 1;
  }
  const keys = Object.keys(out).sort();
  const sorted = {};
  for (const k of keys) sorted[k] = out[k];
  return sorted;
}

/* ------------------------------------ 10. 体积：字节数 + 裁剪降级工具 */
function utf8Len(s) {
  let n = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s.charCodeAt(i);
    if (c < 0x80) n += 1;
    else if (c < 0x800) n += 2;
    else if (c < 0xd800 || c >= 0xe000) n += 3;
    else { i++; n += 4; }
  }
  return n;
}
function json(o) { return JSON.stringify(o); }

// ★ 精确字节数：逐字段累计（不经长整串切片，避免运行时对整串 length 的不一致）。
//   key 的引号/冒号/逗号等 ASCII 结构字符按 1B 计，字符串值按真实 UTF-8 计。
function exactBytes(v) {
  if (v === null) return 4;                                     // null
  const t = typeof v;
  if (t === "number") return String(v).length;
  if (t === "boolean") return v ? 4 : 5;
  if (t === "string") {
    let n = 2;                                                  // 两侧引号
    for (let i = 0; i < v.length; i++) {
      const c = v.charCodeAt(i);
      if (c === 34 || c === 92) n += 2;                         // " \ 需要转义
      else if (c < 0x20) n += 2;                                // 控制字符转义
      else if (c < 0x80) n += 1;
      else if (c < 0x800) n += 2;
      else if (c < 0xd800 || c >= 0xe000) n += 3;
      else { i++; n += 4; }                                     // 代理对
    }
    return n;
  }
  if (Array.isArray(v)) {
    if (!v.length) return 2;
    let n = 2;                                                  // [ ]
    for (let i = 0; i < v.length; i++) n += exactBytes(v[i]) + (i ? 1 : 0);
    return n;
  }
  const keys = Object.keys(v);
  if (!keys.length) return 2;
  let n = 2;                                                    // { }
  for (let i = 0; i < keys.length; i++) {
    n += exactBytes(keys[i]) + 1 + exactBytes(v[keys[i]]) + (i ? 1 : 0);
  }
  return n;
}

function sizeOf(o) { const s = json(o); return { chars: s.length, utf8: exactBytes(o) }; }

// 按层数裁剪 tree 的 children
function trimTree(node, keep) {
  if (!node || typeof node !== "object") return;
  if (!node.children) return;
  if (keep <= 0) { delete node.children; return; }
  for (const c of node.children) trimTree(c, keep - 1);
}
// 变体降级：fills/strokes/effects 只留第一项（paint.v 等变量下标**保留**）
function thinPaintList(node) {
  if (!node || typeof node !== "object") return;
  for (const k of ["fills", "strokes", "effects"]) {
    if (Array.isArray(node[k]) && node[k].length > 1) node[k] = [node[k][0]];
  }
  if (node.children) for (const c of node.children) thinPaintList(c);
}
function thinText(node) {
  if (!node || typeof node !== "object") return;
  if (node.text && typeof node.text.chars === "string" && node.text.chars.length > 24) node.text.chars = node.text.chars.slice(0, 24);
  if (node.children) for (const c of node.children) thinText(c);
}
// text.v 与 node.fills 重复承载同一份文字颜色；降级时只保留变量下标 v（变量绑定绝不丢）
function thinTextPaint(node) {
  if (!node || typeof node !== "object") return;
  if (node.text && Array.isArray(node.text.v)) {
    node.text.v = node.text.v.map((p) => {
      const o = {};
      if (p && p.v !== undefined) o.v = p.v;
      if (p && p.visible === false) o.visible = false;
      return o;
    });
  }
  if (node.children) for (const c of node.children) thinTextPaint(c);
}
function thinVariants(list) {
  for (const v of list) {
    if (Array.isArray(v.fills) && v.fills.length > 1) v.fills = [v.fills[0]];
    if (Array.isArray(v.strokes) && v.strokes.length > 1) v.strokes = [v.strokes[0]];
    if (Array.isArray(v.effects) && v.effects.length > 1) v.effects = [v.effects[0]];
  }
}
function thinVariantsText(list) {
  if (!Array.isArray(list)) return;
  for (const v of list) {
    if (v.text && typeof v.text.chars === "string" && v.text.chars.length > 24) v.text.chars = v.text.chars.slice(0, 24);
  }
}

/* ------------------------------------------------------------ 11. 主流程 */
const trimmed = [];
const variantList = children.map((v) => ({ node: v }));

// 预扫描变量：变体模式只扫全部变体自身；tree 模式扫指定变体整棵子树
const scanRoots = (MODE === "tree") ? [pickVariant(VARIANT) || defVariant] : children;
let variablesUsed = [];
{
  const seen = new Set();
  for (const r of scanRoots) {
    if (!r) continue;
    scanVars(r, (id) => seen.add(id));
    if (MODE === "tree" && r.children) {
      const walk = (n) => { if (n.children) for (const c of n.children) { scanVars(c, (id) => seen.add(id)); walk(c); } };
      walk(r);
    }
  }
  IDX = new Map();
  for (const id of seen) { if (IDX.has(id)) continue; IDX.set(id, variablesUsed.length); variablesUsed.push({ id, name: await vname(id) }); }
}

const instanceMap = await instanceCounts();
let depth = MAX_DEPTH;
let thin = 0;                                  // 0 无 / 1 paint 已瘦身 / 2 text 已截断
let variantsOut = null;
let treeOut = null;

async function buildAll() {
  variantsOut = null;
  treeOut = null;
  if (MODE === "variants") {
    variantsOut = [];
    for (const v of variantList) variantsOut.push(await variantFacts(v.node));
  } else {
    const target = pickVariant(VARIANT);
    if (!target) return false;
    treeOut = await nodeInfo(target, 0, depth, null);
  }
  return true;
}

const targetVariant = (MODE === "tree") ? pickVariant(VARIANT) : null;
if (MODE === "tree" && !targetVariant) {
  return JSON.stringify({
    ok: false, error: "variant not found", slug: SLUG, setId: SET_ID, mode: MODE, variant: VARIANT,
    available: children.map((c) => c.name)
  });
}

function assemble() {
  const out = { scriptVersion: "2", slug: SLUG, setId: SET_ID, setName: set.name, description: set.description || null };
  out.mode = MODE;
  out.variant = (MODE === "tree" && targetVariant) ? targetVariant.name : (defVariant ? defVariant.name : null);
  out.variantCount = children.length;
  out.defaultVariant = defVariant ? defVariant.name : null;
  out.defs = defs;
  out.variablesUsed = variablesUsed;
  out.instances = instanceMap;
  if (variantsOut) out.variants = variantsOut;
  if (treeOut) out.tree = treeOut;
  out.trimmed = trimmed.slice();
  return out;
}

let ok = await buildAll();
if (!ok) return JSON.stringify({ ok: false, error: "build failed", slug: SLUG, setId: SET_ID, mode: MODE });

let out = assemble();
let s = sizeOf(out);

// 降级循环：tree 层数 → 变体 paint 瘦身 → 文字截断；变量下标在任何一步都不丢
while (s.utf8 > MAX_BYTES) {
  if (treeOut && depth > 1) {
    depth -= 1; trimmed.push("treeDepth=" + depth);
    treeOut = await nodeInfo(targetVariant, 0, depth, null);
    if (MODE === "variants" && variantsOut) { /* 变体浅层不受影响 */ }
    out = assemble(); s = sizeOf(out); continue;
  }
  if (thin < 1) {
    thin = 1; trimmed.push("thinPaints");
    if (variantsOut) thinVariants(variantsOut);
    if (treeOut) { thinPaintList(treeOut); thinTextPaint(treeOut); }
    out = assemble(); s = sizeOf(out); continue;
  }
  if (thin < 2) {
    thin = 2; trimmed.push("textChars<=24");
    if (treeOut) thinText(treeOut);
    thinVariantsText(variantsOut);
    out = assemble(); s = sizeOf(out); continue;
  }
  trimmed.push("overBudget:" + s.utf8);
  break;
}

// 自报体积：bytes = 字符数（规范口径），bytesUtf8 = 真实 UTF-8 字节数（用于 48KB 判断）
out.bytes = null; out.bytesUtf8 = null; out.chars = null;
let final = assemble();
let m = sizeOf(final);
final.bytes = m.chars;
final.bytesUtf8 = m.utf8;
final.chars = m.chars;
final.ok = m.utf8 < HARD_BYTES;

// DEBUG：把 node 级 boundVariables 的原始数组和 paint 级绑定都吐出来，供核验顺序差异
if (DEBUG) {
  const dn = DEBUG_NODE ? pickVariant(DEBUG_NODE) : (MODE === "tree" ? targetVariant : children[0]);
  if (dn) {
    const fl = Array.isArray(dn.fills) ? dn.fills : [];
    final.raw = {
      node: dn.name,
      nodeLevelFills: (dn.boundVariables && Array.isArray(dn.boundVariables.fills))
        ? dn.boundVariables.fills.map((x) => (x && x.id ? x.id : null)) : null,
      nodeLevelStrokes: (dn.boundVariables && Array.isArray(dn.boundVariables.strokes))
        ? dn.boundVariables.strokes.map((x) => (x && x.id ? x.id : null)) : null,
      paints: fl.map((p) => ({ type: String(p.type), hex: hexOf(p.color), opacity: p.opacity === undefined ? 1 : p.opacity, paintLevelColorId: paintVid(p) }))
    };
  }
  final.bytes = null; final.bytesUtf8 = null; final.chars = null;
  const m2 = sizeOf(final);
  final.bytes = m2.chars; final.bytesUtf8 = m2.utf8; final.chars = m2.chars;
  final.ok = m2.utf8 < HARD_BYTES;
}

return json(final);
