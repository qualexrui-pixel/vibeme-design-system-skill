#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
VibeMe 设计系统 skill · 一致性校验
====================================================================
检查 48 个组件在「索引 / 文档 / 代码 / 预览图 / Figma 导出」五处是否齐全一致，
文档章节是否写全，CSS 是否只用 token，TSX 是否符合实现规范。

用法：
  python3 tools/validate.py                 # 全量
  python3 tools/validate.py --slug button   # 只校验一个组件
  python3 tools/validate.py --strict-gen    # 同时要求生成物与真源一致（等价于 gen-tokens.py --check）
"""
import json
import os
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SKILL = ROOT / "vibeme-design-system"
INDEX = SKILL / "data" / "components-index.json"
TOKENS_JSON = SKILL / "data" / "tokens.json"
TOKENS_CSS = SKILL / "components" / "tokens.css"

REQUIRED_SECTIONS = ["## 交互与状态", "## 代码用法", "## 可访问性", "## 不要这样做", "## 相关组件"]
GEN_SECTIONS = ["## 概览", "## 变体与属性", "## 各变体的事实", "## 结构（默认变体）", "## 设计 token"]
PLACEHOLDERS = ["待补充", "TODO", "TBD", "占位"]
CSS_LITERAL_COLOR = re.compile(r"(#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\()")

errors = []
warnings = []
checked = 0


def err(slug, msg):
    errors.append(("[%s] " % slug if slug else "") + msg)


def warn(slug, msg):
    warnings.append(("[%s] " % slug if slug else "") + msg)


def pascal(slug):
    return "".join(p[:1].upper() + p[1:] for p in slug.split("-"))


def load_tokens():
    if not TOKENS_JSON.exists():
        err(None, "缺少 %s（先跑 tools/gen-tokens.py）" % TOKENS_JSON.relative_to(ROOT))
        return None, set()
    data = json.loads(TOKENS_JSON.read_text(encoding="utf-8"))
    defined = set()
    for t in data["tokens"]:
        defined.add(t["cssVar"])
    for e in data["elevations"]:
        defined.add(e["cssVar"])
    for t in data["typography"]:
        base = t["cssClass"].replace("vm-type-", "--vm-type-")
        for suffix in ("-size", "-weight", "-line-height", "-letter-spacing"):
            defined.add(base + suffix)
    defined.add("--vm-font-family")
    css_text = TOKENS_CSS.read_text(encoding="utf-8") if TOKENS_CSS.exists() else ""
    css_defined = set(re.findall(r"(--vm-[a-z0-9-]+)\s*:", css_text))
    missing_in_css = defined - css_defined
    extra_in_css = css_defined - defined
    if missing_in_css:
        err(None, "tokens.css 缺少 tokens.json 里声明的变量：%s" % ", ".join(sorted(missing_in_css)[:8]))
    if extra_in_css:
        err(None, "tokens.css 里有 tokens.json 未声明的变量：%s" % ", ".join(sorted(extra_in_css)[:8]))
    return data, defined


def check_md(slug, defined):
    path = SKILL / "references" / "components" / (slug + ".md")
    if not path.exists():
        err(slug, "缺少文档 %s" % path.relative_to(ROOT))
        return
    text = path.read_text(encoding="utf-8")
    for sec in GEN_SECTIONS:
        if sec not in text:
            err(slug, "文档缺少生成章节 %s（跑 tools/gen-component-docs.py）" % sec)
    if text.count("<!-- GEN:BEGIN") != 1 or text.count("<!-- GEN:END -->") != 1:
        err(slug, "文档的 GEN 标记不成对")
    body_after_gen = text.split("<!-- GEN:END -->")[-1]
    for sec in REQUIRED_SECTIONS:
        if sec not in body_after_gen:
            err(slug, "文档缺少必填章节 %s" % sec)
            continue
        chunk = body_after_gen.split(sec, 1)[1]
        nxt = re.search(r"\n## ", chunk)
        chunk = chunk[: nxt.start()] if nxt else chunk
        stripped = re.sub(r"<!--.*?-->", "", chunk, flags=re.S).strip()
        if len(stripped) < 80:
            err(slug, "章节 %s 内容过短（%d 字），需要具体讲解" % (sec, len(stripped)))
        for ph in PLACEHOLDERS:
            if ph in stripped:
                err(slug, "章节 %s 仍有占位符 %r" % (sec, ph))
    for t in re.findall(r"\(\.\./\.\./([^)]+)\)", text):
        if not (SKILL / t).exists():
            err(slug, "文档里的相对链接不存在：%s" % t)
    for v in set(re.findall(r"var\((--vm-[a-z0-9-]+)", text)):
        if v not in defined:
            err(slug, "文档引用了未定义的 token %s" % v)


def check_code(slug, defined):
    name = pascal(slug)
    base = SKILL / "components" / name
    tsx, css, idx = base / (name + ".tsx"), base / (name + ".css"), base / "index.ts"
    for p in (tsx, css, idx):
        if not p.exists():
            err(slug, "缺少实现文件 %s" % p.relative_to(ROOT))
    if not (tsx.exists() and css.exists()):
        return
    t = tsx.read_text(encoding="utf-8")
    c = css.read_text(encoding="utf-8")
    if "export interface %sProps" % name not in t:
        err(slug, "TSX 未导出 props 接口 %sProps" % name)
    if "export const %s" % name not in t:
        err(slug, "TSX 未具名导出 %s" % name)
    for m in re.finditer(r"from\s+['\"]([^'\"]+)['\"]", t):
        spec = m.group(1)
        if spec == "react" or spec.startswith("."):
            continue
        err(slug, "TSX 引入了外部依赖 %r（只允许 react 与相对路径）" % spec)
    for m in re.finditer(r"var\((--vm-[a-z0-9-]+)", c):
        if m.group(1) not in defined:
            err(slug, "CSS 引用了未定义的 token %s" % m.group(1))
    for i, line in enumerate(c.splitlines(), 1):
        if line.strip().startswith(("/*", "*", "//")):
            continue
        m = CSS_LITERAL_COLOR.search(line)
        if m and "var(--vm" not in line:
            err(slug, "CSS 第 %d 行出现字面量颜色 %r：%s" % (i, m.group(0), line.strip()[:80]))
    if "!important" in c:
        warn(slug, "CSS 里出现了 !important")
    for m in re.finditer(r"className=\{?['\"`]([a-z0-9- ]+)", t):
        for cls in m.group(1).split():
            if not cls.startswith("vm-"):
                warn(slug, "TSX 里出现非 vm- 前缀的类名 %r" % cls)
    if "%s.css" % name not in t and "'.%s.css'" % name not in t:
        warn(slug, "TSX 里没看到 import './%s.css'" % name)


def check_files(slug):
    prev = SKILL / "assets" / "previews" / (slug + ".png")
    if not prev.exists():
        err(slug, "缺少预览图 %s" % prev.relative_to(ROOT))
    elif prev.stat().st_size < 300:
        err(slug, "预览图异常小（%d 字节）" % prev.stat().st_size)
    for mode in ("variants", "tree"):
        p = SKILL / "data" / "figma-export" / "components" / ("%s.%s.json" % (slug, mode))
        if not p.exists():
            err(slug, "缺少 Figma 导出 %s" % p.relative_to(ROOT))
            continue
        try:
            json.loads(p.read_text(encoding="utf-8"))
        except Exception as e:
            err(slug, "Figma 导出不是合法 JSON：%s（%s）" % (p.name, e))


def check_index_and_docs(index):
    comps = index["components"]
    slugs = [c["slug"] for c in comps]
    if len(slugs) != len(set(slugs)):
        err(None, "components-index.json 里有重复 slug")
    for extra in ("main", "vibe-ai"):
        n = len([c for c in comps if c.get("theme") == extra])
        if n == 0:
            warn(None, "没有 theme=%s 的组件" % extra)
    total_variants = sum(c["variants"] for c in comps)
    if total_variants != index["totals"]["variants"]:
        err(None, "变体总数对不上：索引算出 %d，totals 写的是 %d"
            % (total_variants, index["totals"]["variants"]))
    # 桶文件
    barrel = SKILL / "components" / "index.ts"
    if not barrel.exists():
        err(None, "缺少 components/index.ts（跑 tools/gen-component-docs.py --barrel）")
    else:
        b = barrel.read_text(encoding="utf-8")
        for s in slugs:
            if "components/%s" % pascal(s) not in b and "./%s'" % pascal(s) not in b:
                err(s, "桶文件 components/index.ts 未导出 %s" % pascal(s))
    # 组件索引文档
    cm = SKILL / "references" / "components.md"
    if not cm.exists():
        err(None, "缺少 references/components.md")
    else:
        text = cm.read_text(encoding="utf-8")
        for s in slugs:
            if ("(components/%s.md)" % s) not in text:
                err(s, "references/components.md 里没有指向 components/%s.md 的链接" % s)


def check_skill_frontmatter():
    """校验 SKILL.md 的 frontmatter 同时满足 DSH 与 Codex 的规范。"""
    path = SKILL / "SKILL.md"
    if not path.exists():
        err(None, "缺少 SKILL.md")
        return
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        err(None, "SKILL.md 必须以 `---` 开头")
        return
    end = text.find("\n---", 4)
    if end < 0:
        err(None, "SKILL.md 的 frontmatter 没有结束标记 `---`")
        return
    fm_raw = text[4:end]
    top = {}
    for line in fm_raw.splitlines():
        if not line.strip() or line.startswith(" ") or line.startswith("\t"):
            continue
        if ":" not in line:
            err(None, "frontmatter 行无法解析：%r" % line)
            continue
        k, v = line.split(":", 1)
        top[k.strip()] = v.strip()

    # Codex 官方校验脚本只允许这几个 key
    allowed = {"name", "description", "license", "allowed-tools", "metadata"}
    for k in top:
        if k not in allowed:
            err(None, "frontmatter 出现 Codex 不接受的 key %r（DSH 专属键会污染 Codex 校验）" % k)
    name = top.get("name", "").strip('"\'')
    desc = top.get("description", "").strip('"\'')
    if not name:
        err(None, "frontmatter 缺 name")
    elif not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", name):
        err(None, "name %r 不是 kebab-case（DSH 会直接忽略该 skill）" % name)
    elif len(name) > 64:
        err(None, "name 超过 64 字符（Codex 上限）")
    if not desc:
        err(None, "frontmatter 缺 description")
    else:
        if len(desc) > 1024:
            err(None, "description 超过 1024 字符（Codex 上限）：%d" % len(desc))
        if "<" in desc or ">" in desc:
            err(None, "description 不能含尖括号 < >（Codex 校验脚本会拒绝）")
        if "[" in desc and "TODO" in desc:
            err(None, "description 里疑似未完成的 TODO 占位")
        if len(desc) > 500:
            warn(None, "description 超过 500 字符，DSH 目录里会被截断（前 500 字符要能独立表达用途）")
    # agents/openai.yaml（可选，但存在就校验）
    oy = SKILL / "agents" / "openai.yaml"
    if oy.exists():
        y = oy.read_text(encoding="utf-8")
        m = re.search(r"short_description:\s*[\"']?(.+?)[\"']?\s*$", y, re.M)
        if not m:
            err(None, "agents/openai.yaml 缺 short_description")
        else:
            sd = m.group(1).strip().strip('"\'')
            if not (25 <= len(sd) <= 64):
                err(None, "openai.yaml 的 short_description 必须 25–64 字符，现在是 %d" % len(sd))
        m2 = re.search(r"default_prompt:\s*[\"']?(.+?)[\"']?\s*$", y, re.M)
        if m2 and ("$%s" % name) not in m2.group(1):
            err(None, "openai.yaml 的 default_prompt 必须显式写 `$%s`" % name)
    # SKILL.md 里引用的相对链接必须存在
    for target in re.findall(r"\]\(([^)#][^)]*)\)", text[text.find("\n---", 4) + 4:]):
        if target.startswith("http"):
            continue
        t = target.split("#")[0]
        if t and not (SKILL / t).exists():
            err(None, "SKILL.md 里的相对链接不存在：%s" % t)


def main():
    args = sys.argv[1:]
    only = None
    if "--slug" in args:
        only = args[args.index("--slug") + 1]
    index = json.loads(INDEX.read_text(encoding="utf-8"))
    _, defined = load_tokens()
    comps = index["components"]
    if only:
        comps = [c for c in comps if c["slug"] == only]
        if not comps:
            print("✗ 索引里没有 slug=%s" % only)
            sys.exit(1)
    global checked
    for c in comps:
        slug = c["slug"]
        check_files(slug)
        check_md(slug, defined)
        check_code(slug, defined)
        checked += 1
    if not only:
        check_index_and_docs(index)
        check_skill_frontmatter()
    print("校验了 %d 个组件；错误 %d 条，警告 %d 条" % (checked, len(errors), len(warnings)))
    for w in warnings:
        print("  ⚠ " + w)
    for e in errors:
        print("  ✗ " + e)
    if errors:
        sys.exit(1)
    print("✓ 全部通过")


if __name__ == "__main__":
    main()
