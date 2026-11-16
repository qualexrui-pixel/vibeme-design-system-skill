#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VibeMe 设计系统 · token 生成器
====================================================================
真源（只读）：vibeme-design-system/data/figma-export/variables.json
              vibeme-design-system/data/figma-export/styles.json
命名规则（只读）：tools/token-map.json
生成物（勿手改）：
  vibeme-design-system/components/tokens.css      —— CSS 变量 + 文字样式工具类
  vibeme-design-system/data/tokens.json           —— 机器可读 token 表
  vibeme-design-system/references/tokens.md       —— 人读 token 真源文档

用法：
  python3 tools/gen-tokens.py            # 生成（覆盖）
  python3 tools/gen-tokens.py --check    # 只校验生成物是否与真源一致（CI 用）

只用 Python 标准库，Python 3.8+。
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "vibeme-design-system"
EXPORT = SKILL / "data" / "figma-export"
OUT_CSS = SKILL / "components" / "tokens.css"
OUT_JSON = SKILL / "data" / "tokens.json"
OUT_MD = SKILL / "references" / "tokens.md"

GENERATED_HEADER = "本文件由 tools/gen-tokens.py 自动生成，请勿手改；改 tools/token-map.json 后重新生成。"


def die(msg):
    print("✗ " + msg, file=sys.stderr)
    sys.exit(1)


def slug(text):
    s = text.replace("_", "-")
    s = re.sub(r"[^0-9A-Za-z]+", "-", s)
    s = re.sub(r"-+", "-", s).strip("-").lower()
    return s


def hex_to_rgb(h):
    h = h.lstrip("#")
    return int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16)


def css_color(hex_value, alpha):
    if alpha is None or abs(alpha - 1) < 1e-9:
        return hex_value.upper()
    r, g, b = hex_to_rgb(hex_value)
    return "rgba(%d, %d, %d, %s)" % (r, g, b, trim_num(alpha))


def trim_num(v):
    if isinstance(v, float):
        s = ("%.4f" % v).rstrip("0").rstrip(".")
        return s if s else "0"
    return str(v)


def load(path):
    if not path.exists():
        die("缺少真源文件 %s（先跑 tools/figma-extract.js 导出）" % path)
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def build():
    tmap = load(ROOT / "tools" / "token-map.json")
    variables = load(EXPORT / "variables.json")
    styles = load(EXPORT / "styles.json")

    prefix = tmap["cssVarPrefix"]
    legacy = set(tmap["legacy"])
    overrides = tmap["overrides"]
    coll_cfg = tmap["collections"]

    tokens = []
    legacy_tokens = []
    unknown = []
    seen = {}

    for coll in variables["collections"]:
        cname = coll["name"]
        cfg = coll_cfg.get(cname)
        mode_ids = [m["modeId"] for m in coll["modes"]]
        mode_name = coll["modes"][0]["name"] if coll["modes"] else "Value"
        for var in coll["variables"]:
            name = var["name"]
            vals = var.get("valuesByMode", {})
            first = vals.get(mode_ids[0]) if mode_ids else None
            if first is None:
                continue
            value = first.get("value")
            alias = first.get("alias")
            percent = bool(first.get("percentHint"))

            if name in legacy:
                legacy_tokens.append({"figmaName": name, "collection": cname, "value": normalize_value(var, first)})
                continue

            if cfg is None:
                unknown.append((cname, name))
                continue

            if name in overrides:
                leaf = overrides[name]
            else:
                seg = name if cfg["mode"] == "full" else name.split("/")[-1]
                leaf = slug(seg)
                if not leaf:
                    unknown.append((cname, name))
                    continue
            leaf = cfg["prefix"] + leaf
            css_var = prefix + leaf

            if css_var in seen:
                die("CSS 变量名冲突：%s ← %r 与 %r（请在 tools/token-map.json 的 overrides 里显式命名）"
                    % (css_var, name, seen[css_var]))
            seen[css_var] = name

            if var["resolvedType"] == "COLOR":
                type_id = "color"
                css_value = css_color(value["hex"], value.get("alpha", 1))
                hex8 = value["hex"].upper() + ("" if value.get("alpha", 1) >= 1
                                               else format(int(round(value["alpha"] * 255)), "02X"))
                raw = {"hex": value["hex"].upper(), "alpha": value.get("alpha", 1), "hex8": hex8}
            elif var["resolvedType"] == "FLOAT":
                if name.startswith("duration/"):
                    type_id = "duration"
                    css_value = "%gms" % value
                elif percent:
                    type_id = "opacity"
                    css_value = trim_num(round(value / 100.0, 4))
                else:
                    type_id = "dimension"
                    css_value = "%gpx" % value
                raw = {"number": value}
            else:
                type_id = "other"
                css_value = str(value)
                raw = {"value": value}

            tokens.append({
                "figmaName": name,
                "cssVar": css_var,
                "type": type_id,
                "cssValue": css_value,
                "collection": cname,
                "mode": mode_name,
                "alias": alias,
                "aliasId": first.get("aliasId"),
                "resolved": raw,
            })

    if unknown:
        lines = "\n".join("  - 集合 %r 的变量 %r" % (c, n) for c, n in unknown)
        die("有变量无法自动命名（中文/特殊名需要写进 tools/token-map.json 的 overrides 或 legacy）：\n" + lines)

    # ---- 分组 ----
    groups = [dict(g, tokens=[]) for g in tmap["groups"]]
    groups.append({"id": "other", "name": "其他 Other", "match": [], "tokens": []})
    by_id = {g["id"]: g for g in groups}
    for t in tokens:
        gid = None
        for g in tmap["groups"]:
            if "collections" in g and t["collection"] in g["collections"]:
                gid = g["id"]
                break
            for pat in g.get("match", []):
                if re.search(pat, t["figmaName"]):
                    gid = g["id"]
                    break
            if gid:
                break
        by_id[gid or "other"]["tokens"].append(t)
    groups = [g for g in groups if g["tokens"]]

    # ---- 海拔阴影（Effect styles，不是变量，但同样是 token）----
    elevations = []
    for eff_style in styles.get("effectStyles", []):
        shadows = []
        for e in eff_style.get("effects", []):
            if e.get("visible") is False:
                continue
            inset = "inset " if e.get("type") == "INNER_SHADOW" else ""
            off = e.get("offset") or {"x": 0, "y": 0}
            col = css_color(e.get("hex", "#000000"), e.get("alpha", 1))
            shadows.append("%s%gpx %gpx %gpx %gpx %s" % (
                inset, off.get("x", 0), off.get("y", 0), e.get("radius", 0), e.get("spread", 0), col))
        if shadows:
            elevations.append({
                "figmaName": eff_style["name"],
                "cssVar": prefix + "elevation-" + slug(eff_style["name"].split("/")[-1]),
                "type": "shadow",
                "cssValue": ", ".join(shadows),
                "description": eff_style.get("description", ""),
            })

    # ---- 文字样式 ----
    weights = tmap["fontWeights"]
    typography = []
    for ts in styles.get("textStyles", []):
        style_name = (ts.get("fontName") or {}).get("style", "Regular")
        w = weights.get(style_name)
        warn = None
        if w is None:
            w = 400
            warn = "未识别的字重 %r，按 400 处理" % style_name
        # 样式名与真实字重不一致的检测（本库已知有 3 个这样的坑）
        last_seg = ts["name"].split("/")[-1]
        named_weight = weights.get(last_seg)
        if named_weight is not None and w != named_weight:
            warn = "样式名写着 %s（%d），实际字体是 %s（%d）" % (last_seg, named_weight, style_name, w)
        lh = ts.get("lineHeight") or {}
        if lh.get("unit") == "PIXELS":
            lh_css = "%gpx" % lh.get("value", 0)
        elif lh.get("unit") == "PERCENT":
            lh_css = "%g%%" % round(lh.get("value", 100))
        else:
            lh_css = "normal"
        ls = ts.get("letterSpacing") or {}
        if ls.get("unit") == "PIXELS":
            ls_css = "%gpx" % ls.get("value", 0)
        elif ls.get("unit") == "PERCENT":
            ls_css = "%gem" % round(ls.get("value", 0) / 100.0, 4)
        else:
            ls_css = "0"
        typography.append({
            "figmaName": ts["name"],
            "cssClass": "vm-type-" + slug(ts["name"]),
            "family": (ts.get("fontName") or {}).get("family", "Poppins"),
            "weightName": style_name,
            "fontWeight": w,
            "fontSize": ts.get("fontSize"),
            "lineHeight": lh_css,
            "letterSpacing": ls_css,
            "textCase": ts.get("textCase", "ORIGINAL"),
            "warning": warn,
        })

    meta = {
        "schema": "vibeme.tokens/v1",
        "generatedBy": "tools/gen-tokens.py",
        "source": {
            "fileKey": variables.get("fileKey"),
            "exportedAt": variables.get("exportedAt"),
            "url": "https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56054-5521",
        },
        "counts": {
            "tokens": len(tokens),
            "legacy": len(legacy_tokens),
            "elevations": len(elevations),
            "textStyles": len(typography),
            "paintStyles": len(styles.get("paintStyles", [])),
            "gridStyles": len(styles.get("gridStyles", [])),
        },
        "fontFamily": tmap["fontFamily"],
        "legacyReason": tmap.get("legacyReason", ""),
    }

    return {
        "meta": meta,
        "groups": [{"id": g["id"], "name": g["name"], "tokens": g["tokens"]} for g in groups],
        "tokens": tokens,
        "legacy": legacy_tokens,
        "elevations": elevations,
        "typography": typography,
        "paintStyles": styles.get("paintStyles", []),
        "gridStyles": styles.get("gridStyles", []),
    }


def render_css(d):
    m = d["meta"]
    out = []
    out.append("/* ==========================================================================\n"
               " *  VibeMe 设计系统 · Design Tokens\n"
               " *  %s\n"
               " *  真源：Figma %s（页面 56054:5521「全局」总组件库）\n"
               " *  规模：%d 个 token · %d 个文字样式 · %d 组海拔阴影\n"
               " *  深色单一模式（文件里的变量都只有一个 mode，没有 light/dark 切换）\n"
               " * ========================================================================== */\n"
               % (GENERATED_HEADER, m["source"]["fileKey"], m["counts"]["tokens"],
                  m["counts"]["textStyles"], m["counts"]["elevations"]))
    out.append(":root {\n")
    out.append("  /* 字体：Poppins 为主，中文回退系统字体 */\n")
    out.append("  --vm-font-family: %s;\n" % m["fontFamily"])
    for g in d["groups"]:
        out.append("\n  /* ── %s ───────────────────────────────────────── */\n" % g["name"])
        for t in g["tokens"]:
            note = t["figmaName"] + (("  → " + t["alias"]) if t["alias"] else "")
            out.append("  %s: %s; /* %s */\n" % (t["cssVar"], t["cssValue"], note))
    if d["elevations"]:
        out.append("\n  /* ── 海拔阴影 Elevation（Figma Effect Styles）───────────── */\n")
        for e in d["elevations"]:
            out.append("  %s: %s; /* %s */\n" % (e["cssVar"], e["cssValue"], e["figmaName"]))
    out.append("\n  /* ── 文字样式数值（配合 .vm-type-* 工具类使用）────────────── */\n")
    for t in d["typography"]:
        base = t["cssClass"].replace("vm-type-", "--vm-type-")
        out.append("  %s-size: %s; %s-weight: %d; %s-line-height: %s; %s-letter-spacing: %s; /* %s */\n"
                   % (base, fmt_px(t["fontSize"]), base, t["fontWeight"], base, t["lineHeight"],
                      base, t["letterSpacing"], t["figmaName"]))
    out.append("}\n")

    out.append("\n/* ==========================================================================\n"
               " *  文字样式工具类（对应 Figma 19 个 Text Styles）\n"
               " *  用法：<span class=\"vm-type-heading-body-m-regular\">正文</span>\n"
               " *  或在自己的 CSS 里 @extend 这三行属性；不要手写 font-size/line-height。\n"
               " * ========================================================================== */\n")
    for t in d["typography"]:
        out.append("\n.%s {\n  font-family: var(--vm-font-family);\n  font-size: %s;\n  font-weight: %d;\n  line-height: %s;\n  letter-spacing: %s;\n}\n"
                   % (t["cssClass"], fmt_px(t["fontSize"]), t["fontWeight"], t["lineHeight"], t["letterSpacing"]))
        if t["warning"]:
            out.append("/* ⚠ %s：%s */\n" % (t["figmaName"], t["warning"]))
    return "".join(out)


def fmt_px(v):
    if v is None:
        return "inherit"
    return ("%gpx" % v) if not isinstance(v, str) else v


def render_md(d):
    m = d["meta"]
    L = []
    A = L.append
    A("# VibeMe 设计 token 真源\n")
    A("> %s\n" % GENERATED_HEADER)
    A("> 真源：Figma [`%s`](%s) 的变量与样式；本文件是它的完整快照。\n"
      % (m["source"]["fileKey"], m["source"]["url"]))
    A("规模：**%d 个 token**（另有 %d 个历史遗留变量不纳入）· **%d 个文字样式** · **%d 组海拔阴影** · "
      "%d 个颜色样式 · %d 组栅格样式。\n"
      % (m["counts"]["tokens"], m["counts"]["legacy"], m["counts"]["textStyles"],
         m["counts"]["elevations"], m["counts"]["paintStyles"], m["counts"]["gridStyles"]))
    A("\n## 怎么用\n")
    A("- **CSS**：引 `components/tokens.css`，然后一律用 `var(--vm-xxx)`，不要硬编码色值/间距/圆角/字号。")
    A("- **TS/JS**：读 `data/tokens.json`（含 `figmaName` ↔ `cssVar` ↔ 解析值的完整映射，可做主题或校验）。")
    A("- **命名规则**：`--vm-` + 变量名（`Brand/Brand` → `--vm-brand`，`Background/bg-card` → `--vm-bg-card`）；"
      "少数需要消歧的写在 `tools/token-map.json` 的 `overrides` 里。中文集合名映射：`状态色/*` → `--vm-status-*`，"
      "`VibeMe AI / *` → `--vm-ai-*`。")
    A("- **别名**：表里 `→ 目标` 表示该 token 是别名（Figma VARIABLE_ALIAS），值已按同一 mode 解析成最终值。")
    A("- **百分比语义**：`opacity/*` 在 Figma 里是 `38`、`60`、`100`（百分数），落地成 CSS 是 `0.38`、`0.6`、`1`。\n")

    A("## 字体 Typography\n")
    A("`font-family`：`%s`\n" % m["fontFamily"])
    A("\n| 文字样式 | CSS 类 | 字号 | 字重 | 行高 | 字距 |")
    A("|---|---|---|---|---|---|")
    for t in d["typography"]:
        A("| `%s` | `.%s` | %s | %d %s | %s | %s |"
          % (t["figmaName"], t["cssClass"], fmt_px(t["fontSize"]), t["fontWeight"],
             t["weightName"], t["lineHeight"], t["letterSpacing"]))
    warns = [t for t in d["typography"] if t["warning"]]
    if warns:
        A("\n**⚠ 命名与字体不一致（照抄前先看这里）**：")
        for t in warns:
            A("- `%s`：%s" % (t["figmaName"], t["warning"]))
    A("")

    for g in d["groups"]:
        A("\n## %s\n" % g["name"])
        A("| Figma 变量 | CSS 变量 | 值 |")
        A("|---|---|---|")
        for t in g["tokens"]:
            val = t["cssValue"] + (("　→ `%s`" % t["alias"]) if t["alias"] else "")
            A("| `%s` | `%s` | `%s` |" % (t["figmaName"], t["cssVar"], val))
        A("")

    if d["elevations"]:
        A("\n## 海拔阴影 Elevation\n")
        A("| Figma 效果样式 | CSS 变量 | 值 |")
        A("|---|---|---|")
        for e in d["elevations"]:
            A("| `%s` | `%s` | `%s` |" % (e["figmaName"], e["cssVar"], e["cssValue"]))
        A("")

    if d["gridStyles"]:
        A("\n## 栅格样式（页面布局参考，非 CSS 变量）\n")
        for gs in d["gridStyles"]:
            parts = []
            for lg in gs.get("layoutGrids", []):
                if lg.get("pattern") == "COLUMNS":
                    parts.append("%d 列 · 列间距 %s · 边距 %s" % (lg.get("count"), lg.get("gutterSize"), lg.get("offset")))
                elif lg.get("pattern") == "ROWS":
                    parts.append("行 · 间距 %s" % lg.get("gutterSize"))
            A("- `%s`：%s" % (gs["name"], "；".join(parts)))
        A("")

    if d["paintStyles"]:
        A("\n## Figma 颜色样式（旧机制，仅供对照，不要在新代码里用）\n")
        A("| 样式名 | 颜色 |")
        A("|---|---|")
        for ps in d["paintStyles"]:
            paints = ps.get("paints", [])
            if not paints:
                desc = "—"
            elif paints[0].get("type") == "SOLID":
                desc = css_color(paints[0].get("hex", "#000000"),
                                 paints[0].get("alpha", paints[0].get("opacity", 1)))
            else:
                desc = "%s（%d 个色标）" % (paints[0].get("type"), len(paints[0].get("gradientStops", [])))
            A("| `%s` | `%s` |" % (ps["name"], desc))
        A("")

    A("\n## 历史遗留变量（不要引用）\n")
    A(m["legacyReason"] + "\n")
    A("\n| 变量 | 集合 | 值 |")
    A("|---|---|---|")
    for t in d["legacy"]:
        val = t["value"]
        if isinstance(val, dict) and "hex" in val:
            v = val["hex"] + ("" if val.get("alpha", 1) >= 1 else " @%d%%" % round(val["alpha"] * 100))
        elif isinstance(val, dict) and "number" in val:
            v = str(val["number"])
        else:
            v = json.dumps(val, ensure_ascii=False)
        A("| `%s` | %s | `%s` |" % (t["figmaName"], t["collection"], v))
    A("")
    return "\n".join(L) + "\n"


def normalize_value(var, val):
    v = val.get("value")
    if isinstance(v, dict) and "hex" in v:
        return {"hex": v["hex"], "alpha": v.get("alpha", 1)}
    if var["resolvedType"] == "FLOAT":
        return {"number": v}
    return {"value": v}


def write_or_check(path, content, check):
    old = path.read_text(encoding="utf-8") if path.exists() else None
    if check:
        if old != content:
            print("✗ 生成物与实际不一致：%s（跑 python3 tools/gen-tokens.py 重新生成）" % path.relative_to(ROOT))
            return False
        print("✓ %s 一致" % path.relative_to(ROOT))
        return True
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")
    print("✓ 写入 %s（%d 字节）" % (path.relative_to(ROOT), len(content.encode("utf-8"))))
    return True


def main():
    check = "--check" in sys.argv[1:]
    d = build()
    meta = d["meta"]
    payload = {
        "$schema": meta["schema"],
        "generatedBy": meta["generatedBy"],
        "source": meta["source"],
        "counts": meta["counts"],
        "fontFamily": meta["fontFamily"],
        "legacyReason": meta["legacyReason"],
        "groups": d["groups"],
        "tokens": d["tokens"],
        "elevations": d["elevations"],
        "typography": d["typography"],
        "legacy": d["legacy"],
        "paintStyles": [{"name": p["name"], "paints": p.get("paints", [])} for p in d["paintStyles"]],
        "gridStyles": [{"name": g["name"], "layoutGrids": g.get("layoutGrids", [])} for g in d["gridStyles"]],
    }
    ok = True
    ok &= write_or_check(OUT_CSS, render_css(d), check)
    ok &= write_or_check(OUT_JSON, json.dumps(payload, ensure_ascii=False, indent=2) + "\n", check)
    ok &= write_or_check(OUT_MD, render_md(d), check)
    print("\n统计：%s" % json.dumps(meta["counts"], ensure_ascii=False))
    if check and not ok:
        sys.exit(1)


if __name__ == "__main__":
    main()
