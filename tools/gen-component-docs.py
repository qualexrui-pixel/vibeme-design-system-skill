#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VibeMe 设计系统 · 文档生成器
====================================================================
把 Figma 导出的事实渲染成 markdown：

  1) 每个组件：references/components/<slug>.md
     —— GEN 标记之间是事实（本脚本生成），标记之后是人工讲解（保留不动，可刷新）
  2) 索引：references/components.md
  3) 桶文件：components/index.ts

用法：
  python3 tools/gen-component-docs.py --slug button     # 单个组件（刷新事实段，保留讲解）
  python3 tools/gen-component-docs.py --index           # 刷新 references/components.md
  python3 tools/gen-component-docs.py --barrel          # 刷新 components/index.ts
  python3 tools/gen-component-docs.py --all             # 全部刷新
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "vibeme-design-system"
INDEX = SKILL / "data" / "components-index.json"
TOKENS = SKILL / "data" / "tokens.json"
EXPORT = SKILL / "data" / "figma-export" / "components"
DOCS = SKILL / "references" / "components"
DOC_INDEX = SKILL / "references" / "components.md"
BARREL = SKILL / "components" / "index.ts"

GEN_BEGIN = "<!-- GEN:BEGIN 本段由 tools/gen-component-docs.py 依据 Figma 导出生成，勿手改；改 Figma 后重新生成 -->"
GEN_END = "<!-- GEN:END -->"

CATEGORY_NAMES = {
    "form": "表单控件", "display": "展示类", "feedback": "反馈类", "navigation": "导航类",
    "data": "数据展示类", "layout": "布局类", "vibe-ai": "VibeMe AI（另一套 token）",
}


def pascal(slug):
    return "".join(p[:1].upper() + p[1:] for p in slug.split("-"))


def load_tokens():
    d = json.loads(TOKENS.read_text(encoding="utf-8"))
    by_name = {}
    for t in d["tokens"]:
        by_name[t["figmaName"]] = t
    return by_name


def load_json(p):
    try:
        return json.loads(Path(p).read_text(encoding="utf-8"))
    except Exception:
        return None


def vname(doc, idx):
    """把导出文件里的变量下标还原成 Figma 变量名。"""
    if idx is None:
        return None
    try:
        return doc["variablesUsed"][idx]["name"]
    except Exception:
        return "#%s" % idx


def paint(doc, p, toks):
    """一条 paint → '变量名 值' 文本。"""
    if not isinstance(p, dict):
        return "—"
    if p.get("type") != "SOLID":
        return p.get("type", "?")
    alpha = p.get("alpha", 1)
    hexv = (p.get("hex") or "").upper()
    val = hexv if alpha >= 1 else "%s %d%%" % (hexv, round(alpha * 100))
    var = vname(doc, p.get("v"))
    if var:
        tok = toks.get(var)
        css = (" `%s`" % tok["cssVar"]) if tok else " ⚠无cssVar"
        return "`%s` %s%s" % (var, val, css)
    return val


def paint_stack(doc, paints, toks):
    if not paints:
        return "—"
    if isinstance(paints, str):
        return paints
    parts = [paint(doc, p, toks) for p in paints]
    return " ＋ ".join(parts)


def pad_str(auto):
    if not auto:
        return "—"
    p = auto.get("pad") or [None] * 4
    if all(x is None for x in p):
        return "—"
    return "/".join("?" if x is None else ("%g" % x) for x in p)


def radius_str(v):
    if v is None:
        return "—"
    if isinstance(v, dict):
        vals = [v.get(k) for k in ("tl", "tr", "br", "bl")]
        return "/".join("?" if x is None else ("%g" % x) for x in vals)
    return "%g" % v


def var_notes(doc, node, toks, keys=("radiusVar", "vars")):
    out = []
    for k in keys:
        m = node.get(k)
        if not isinstance(m, dict):
            continue
        for kk, vv in m.items():
            if kk == "pad":
                for item in vv or []:
                    if item is not None:
                        out.append(vname(doc, item))
            elif isinstance(vv, list):
                for item in vv:
                    if item is not None:
                        out.append(vname(doc, item))
            elif vv is not None:
                out.append(vname(doc, vv))
    return [x for x in out if x]


def text_line(node):
    t = node.get("text") or {}
    if not t:
        return ""
    style = t.get("textStyle") or "-"
    bits = []
    if t.get("size") is not None:
        bits.append("%g" % t["size"])
    if t.get("weight"):
        bits.append(str(t["weight"]))
    lh = t.get("lineHeight")
    if lh is not None:
        bits.append("/%g" % lh if isinstance(lh, (int, float)) else "/%s" % lh)
    return "`%s`（%s）" % (style, " ".join(bits)) if bits else "`%s`" % style


def render_tree(node, doc, toks, depth=0, budget=None):
    """把树渲染成代码块里的缩进行；budget 控制最多输出多少个节点。"""
    if budget is None:
        budget = {"n": 60, "skipped": 0}
    lines = []
    if budget["n"] <= 0:
        budget["skipped"] += 1
        return lines
    budget["n"] -= 1
    prefix = ""
    if depth > 0:
        prefix = "  " * (depth - 1) + "└─ "
    seg = ['%s`%s` %s' % (prefix, node.get("type", "?"), node.get("name", ""))]
    if node.get("w") and node.get("h"):
        seg.append("%g×%g" % (node["w"], node["h"]))
    auto = node.get("auto")
    if auto:
        layout = "%s gap %s" % (auto.get("mode"), auto.get("gap"))
        pad = pad_str(auto)
        if pad != "—":
            layout += " pad %s" % pad
        seg.append(layout)
    if node.get("fills"):
        seg.append("填充 " + paint_stack(doc, node["fills"], toks))
    if node.get("strokes"):
        seg.append("描边 " + paint_stack(doc, node["strokes"], toks))
    if node.get("radius") is not None:
        seg.append("圆角 %s" % radius_str(node["radius"]))
    if node.get("opacity") not in (None, 1):
        seg.append("不透明度 %s" % node["opacity"])
    if node.get("main"):
        seg.append("实例=%s" % node["main"])
    if node.get("hidden"):
        seg.append("隐藏")
    if node.get("type") == "TEXT":
        tl = text_line(node)
        if tl:
            seg.append("文字样式 %s" % tl)
        if node.get("text", {}).get("chars"):
            seg.append("内容 %r" % node["text"]["chars"])
    lines.append(" ".join(seg))
    for c in node.get("children") or []:
        lines.extend(render_tree(c, doc, toks, depth + 1, budget))
    return lines


def variant_row(doc, v, toks):
    cells = [
        "`%s`" % v.get("name"),
        "%g×%g" % (v.get("w") or 0, v.get("h") or 0),
        paint_stack(doc, v.get("fills"), toks),
        paint_stack(doc, v.get("strokes"), toks),
        radius_str(v.get("radius")),
        pad_str(v.get("auto")),
        ("%s" % v["opacity"]) if v.get("opacity") not in (None, 1) else "—",
    ]
    return "| " + " | ".join(cells) + " |"


def prop_table(comp):
    rows = []
    for p in comp["props"]:
        if p["t"] == "text":
            rows.append("| `%s` | TEXT（内容插槽） | — | %s | %s |"
                        % (p["n"], p.get("default", "—"), p.get("p") or "`children`"))
        else:
            vals = " / ".join("`%s`" % v for v in p.get("v", []))
            rows.append("| `%s` | VARIANT | %s | `%s` | `%s` |"
                        % (p["n"], vals, p.get("default", "—"), p.get("p", "—")))
    return rows


def gen_doc(comp, toks):
    slug = comp["slug"]
    tspath = EXPORT / ("%s.variants.json" % slug)
    variants = load_json(tspath)
    trees = []
    # 默认变体的树（<slug>.tree.json）永远排第一，其余对比变体按文件名排序
    paths = sorted(EXPORT.glob("%s.tree*.json" % slug),
                   key=lambda p: (p.name != "%s.tree.json" % slug, p.name))
    for p in paths:
        d = load_json(p)
        if d:
            trees.append((p.name, d))

    L = []
    A = L.append
    A(GEN_BEGIN)
    A("")
    A("## 概览")
    A("")
    A("| 项 | 值 |")
    A("|---|---|")
    A("| Figma 组件集 | `%s`（node `%s`） |" % (comp["name"], comp["id"]))
    A("| 分类 | %s |" % CATEGORY_NAMES.get(comp["cat"], comp["cat"]))
    A("| 变体数 | %d |" % comp["variants"])
    A("| 默认变体 | %s |" % (("`%s`" % variants["defaultVariant"]) if variants else "—"))
    A("| 参考尺寸 | %g×%g px（默认变体） |" % tuple(comp["defaultSize"]))
    theme = "主库（深色中性 + 品牌砂色）" if comp["theme"] == "main" else "**VibeMe AI 主题（紫粉，另一套 token，不要与主库混用）**"
    A("| 主题 | %s |" % theme)
    A("| 预览图 | [assets/previews/%s.png](../../assets/previews/%s.png) |" % (slug, slug))
    A("| 代码实现 | [`components/%s/%s.tsx`](../../components/%s/%s.tsx) |" % (pascal(slug), pascal(slug), pascal(slug), pascal(slug)))
    A("| Figma 链接 | [在 Figma 打开](https://www.figma.com/design/%s/VibeMe-App---Web-Design-%%E5%%A4%%87%%E4%%BB%%BD?node-id=%s) |"
      % ("ZO4WH3sbVCj7lZIFMpiwV9", comp["id"].replace(":", "-")))
    A("")
    A("![%s 预览](../../assets/previews/%s.png)" % (comp["name"], slug))
    A("")

    A("## 变体与属性")
    A("")
    A("| Figma 属性 | 类型 | 取值 | 默认 | 代码 prop |")
    A("|---|---|---|---|---|")
    for r in prop_table(comp):
        A(r)
    A("")
    if variants:
        vdefs = [p for p in comp["props"] if p["t"] == "variant"]
        dims = " × ".join(str(len(p.get("v", []))) for p in vdefs)
        A("变体是属性轴的笛卡尔积：**%d = %s**（%s）。"
          % (comp["variants"], dims, " × ".join("`%s`" % p["n"] for p in vdefs)))
        if variants.get("instances"):
            A("")
            A("内嵌组件：" + "、".join("`%s`×%d" % (k, v) for k, v in variants["instances"].items()))
    A("")

    if variants and variants.get("variants"):
        A("## 各变体的事实")
        A("")
        A("> 填充栈按 Figma 图层顺序排列（**靠右的是上层**，hover/pressed 的叠加层在最后）。")
        A("> `⚠无cssVar` 表示该组件引用了历史遗留变量，代码里不要照抄，按 `foundations.md` 的规则换成语义 token。")
        A("")
        A("| 变体 | 尺寸 | 填充栈 | 描边 | 圆角 | 内边距 上/右/下/左 | 不透明度 |")
        A("|---|---|---|---|---|---|---|")
        for v in variants["variants"]:
            A(variant_row(variants, v, toks))
        A("")

    A("## 结构（默认变体）")
    A("")
    if not trees:
        A("_尚未导出结构树（跑 `tools/figma-extract.js` 的 `MODE=tree`）。_")
    for fname, doc in trees:
        A("### %s" % doc.get("variant", "?"))
        A("")
        A("```text")
        budget = {"n": 70, "skipped": 0}
        for line in render_tree(doc["tree"], doc, toks, 0, budget):
            A(line)
        if budget["skipped"]:
            A("… 另有 %d 个节点未展开，完整结构见 data/figma-export/components/%s" % (budget["skipped"], fname))
        A("```")
        A("")
    A("")

    A("## 设计 token")
    A("")
    used = []
    seen = set()
    for doc in ([variants] if variants else []) + [d for _, d in trees]:
        for u in doc.get("variablesUsed") or []:
            nm = u.get("name")
            if nm and nm not in seen:
                seen.add(nm)
                used.append((nm, doc))
    if not used:
        A("_未记录到变量绑定。_")
    else:
        A("| Figma 变量 | CSS 变量 | 值 |")
        A("|---|---|---|")
        for nm, _doc in sorted(used):
            tok = toks.get(nm)
            if tok:
                A("| `%s` | `%s` | `%s` |" % (nm, tok["cssVar"], tok["cssValue"]))
            else:
                A("| `%s` | ⚠ 无对应 CSS 变量（历史遗留变量，不要引用） | — |" % nm)
        missing = [nm for nm, _ in used if nm not in toks]
        if missing:
            A("")
            A("> ⚠ 本组件在 Figma 里引用了 %d 个**历史遗留变量**：%s。"
              "实现时**不要**照搬，按 `references/foundations.md` 的第 2 节换成语义 token。"
              % (len(missing), "、".join("`%s`" % m for m in missing)))
    A("")
    A(GEN_END)
    return "\n".join(L) + "\n"


def write_doc(comp, toks):
    slug = comp["slug"]
    DOCS.mkdir(parents=True, exist_ok=True)
    path = DOCS / ("%s.md" % slug)
    facts = gen_doc(comp, toks)
    if path.exists():
        old = path.read_text(encoding="utf-8")
        tail = old.split(GEN_END, 1)[1] if GEN_END in old else ""
        if not tail.strip():
            tail = default_prose(comp, slug)
    else:
        tail = default_prose(comp, slug)
    path.write_text(facts + tail, encoding="utf-8")
    return path


def default_prose(comp, slug):
    name = comp["name"]
    return """
## 交互与状态

<!-- 待补充：逐个状态说明「代码里由什么触发 + 视觉上变了什么」，要具体到 token 名。 -->

## 代码用法

<!-- 待补充：一段可运行的 TSX 示例，必须与 components/%s/%s.tsx 的真实 props 一致。 -->

## 可访问性

<!-- 待补充：语义元素/角色、键盘行为、ARIA 属性、焦点管理。 -->

## 不要这样做

<!-- 待补充：至少 3 条具体坑，包含 Figma 里的历史遗留与易错点。 -->

## 相关组件

<!-- 待补充：与哪些组件组合使用、谁内嵌谁。 -->
""" % (pascal(slug), pascal(slug))


def instances_of(slug):
    """从该组件的 variants 导出里读「内嵌了哪些组件的实例」。"""
    d = load_json(EXPORT / ("%s.variants.json" % slug))
    if d and d.get("instances"):
        return "、".join("`%s`" % k for k in sorted(d["instances"]))
    return "—"


def gen_index():
    comps = json.loads(INDEX.read_text(encoding="utf-8"))
    total = sum(c["variants"] for c in comps["components"])
    L = []
    A = L.append
    A("# 组件索引")
    A("")
    A("VibeMe 总组件库共 **%d 个组件集 / %d 个变体**，全部来自 Figma 页面"
      " [`56054:5521`「全局」总组件库](%s)。本文件由 `tools/gen-component-docs.py --index` 生成。"
      % (len(comps["components"]), total, comps["source"]["url"]))
    A("")
    A("## 怎么用")
    A("")
    A("1. 在下表找到组件 → 打开它的**规格文档**（含全部变体、绑定 token、结构树、代码用法）。")
    A("2. Figma 的 **VARIANT 属性 = 代码里的 prop**，属性值小写后就是枚举值。")
    A("3. **交互态**（`hover` / `pressed` / `focus`）不做成 prop，用 CSS 伪类；"
      "**应用态**（`disabled` / `error` / `open` / `checked` / `selected`）才是 prop。")
    A("4. 未知组件先看 [foundations.md](foundations.md) 的硬规则，再动手。")
    A("")
    A("> 表里「内嵌」列表示该组件内部已经放了其他组件的实例 —— 代码里对应组合关系，不要重复实现。")
    A("")
    cats = []
    for c in comps["components"]:
        if c["cat"] not in [x[0] for x in cats]:
            cats.append((c["cat"], []))
        cats[-1][1].append(c)
    for cid, items in cats:
        n = sum(i["variants"] for i in items)
        A("## %s（%d 个组件集 / %d 变体）" % (CATEGORY_NAMES.get(cid, cid), len(items), n))
        A("")
        A("| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |")
        A("|---|---|---|---|---|---|---|")
        for c in items:
            axes = []
            for p in c["props"]:
                if p["t"] == "text":
                    axes.append("`%s`(TEXT)" % p["n"])
                else:
                    axes.append("`%s`: %s" % (p.get("p", p["n"]), "/".join(p.get("v", []))))
            A("| **%s** | %d | %s | %g×%g | %s | [%s.md](components/%s.md) | [图](../assets/previews/%s.png) |"
              % (c["name"], c["variants"], "　".join(axes), c["defaultSize"][0], c["defaultSize"][1],
                 instances_of(c["slug"]), c["slug"], c["slug"], c["slug"]))
        A("")
    DOC_INDEX.write_text("\n".join(L) + "\n", encoding="utf-8")
    return DOC_INDEX


def gen_barrel():
    comps = json.loads(INDEX.read_text(encoding="utf-8"))
    lines = ["// 本文件由 tools/gen-component-docs.py --barrel 生成，勿手改",
             "// 先加载 token（CSS 变量 + 文字样式类），再导出全部组件",
             "import './tokens.css';",
             ""]
    for c in comps["components"]:
        lines.append("export * from './%s';" % pascal(c["slug"]))
    lines.append("")
    BARREL.write_text("\n".join(lines), encoding="utf-8")
    return BARREL


def main():
    args = sys.argv[1:]
    toks = load_tokens()
    comps = json.loads(INDEX.read_text(encoding="utf-8"))["components"]
    by_slug = {c["slug"]: c for c in comps}
    done = []
    if "--all" in args or "--index" in args:
        done.append(gen_index())
    if "--all" in args or "--barrel" in args:
        done.append(gen_barrel())
    if "--slug" in args:
        slug = args[args.index("--slug") + 1]
        if slug not in by_slug:
            print("✗ 未知 slug：%s" % slug)
            sys.exit(1)
        done.append(write_doc(by_slug[slug], toks))
    elif "--all" in args:
        for c in comps:
            done.append(write_doc(c, toks))
    for p in done:
        print("✓ 写入 %s" % p.relative_to(ROOT))
    if not done:
        print(__doc__)


if __name__ == "__main__":
    main()
