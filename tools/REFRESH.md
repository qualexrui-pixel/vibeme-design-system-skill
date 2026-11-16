# Figma 改动同步操作手册（刷新快照）

Figma 是唯一真源（文件 `ZO4WH3sbVCj7lZIFMpiwV9`、页面 `56054:5521`「全局」总组件库，索引板 `56066:6408`）。
本手册讲**Figma 改了之后怎么把它同步进这个 skill**：命令 → 期望输出 → 出错怎么办。

涉及的生成物（**一律不要手改**，改了下次生成会被覆盖）：

| 生成物 | 由谁生成 | 读取的真源 |
|---|---|---|
| `vibeme-design-system/components/tokens.css` | `tools/gen-tokens.py` | `data/figma-export/variables.json`、`styles.json` |
| `vibeme-design-system/data/tokens.json` | `tools/gen-tokens.py` | 同上 |
| `vibeme-design-system/references/tokens.md` | `tools/gen-tokens.py` | 同上 |
| `references/components.md` | `tools/gen-component-docs.py --index` | `data/components-index.json` |
| `components/index.ts` | `tools/gen-component-docs.py --barrel` | `data/components-index.json` |
| `references/components/<slug>.md` 里 `<!-- GEN:BEGIN -->…<!-- GEN:END -->` 之间 | `tools/gen-component-docs.py --slug <slug>` | `data/figma-export/components/<slug>.*.json` |

命名规则集中在 `tools/token-map.json`，写作规范见 `tools/AUTHORING-CONVENTIONS.md`，导出器字段与坑见 `tools/figma-extract.md`。

---

## ① 触发时机

出现下面任一情况就该跑本手册，而不是手改文档里的数字：

1. **Figma 侧有改动**：新增/删除组件集、改变体或属性轴、改变量绑定、改 token 取值、改文字样式。
2. **发现文档与 Figma 不一致**：先确认 Figma 是唯一真源（判定优先级：**Figma 实时数据 > 仓库快照**），再刷新。
3. **例行体检报错**：
   - `python3 tools/gen-tokens.py --check` 报 `✗ 生成物与实际不一致：…`
   - `python3 tools/validate.py` 报缺文件、变体总数对不上、章节过短等。
4. **新增组件**（走 ⑥，不要跳过登记直接写文档）。

> 反向禁令：**不要为了让文档好看而改数字**；要改的是 Figma 或 `tools/token-map.json`，然后重新生成。

---

## ② 前置条件

1. 有 **Figma MCP**（没有就退回仓库快照，本手册不适用）。
2. 每次任务先建会话，后续每个 Figma 文件类调用都带上返回的 `sessionId`：

   ```text
   mcp__figma__create_session(
     fileKey="ZO4WH3sbVCj7lZIFMpiwV9",
     description="刷新 VibeMe 组件库快照"
   )
   ```

3. 读一遍：`tools/figma-extract.md`（导出器用法）、`tools/AUTHORING-CONVENTIONS.md`（规范）、
   `vibeme-design-system/references/foundations.md`（设计不变量）。
4. 记住 **48000 字节上限**：`mcp__figma__use_figma` 单次返回值上限约 **48000 字节**，超了**整次运行作废**。
   `tools/figma-extract.js` 内置预算 `MAX_BYTES=46000`、硬线 `HARD_BYTES=47800`，超预算会自动降级
   （截断文本 → 降 tree 层数 → variants 的 fills 只留第一层），每一步记进 `trimmed`。
   - `trimmed` **非空不是错误**，但要在报告里写明，必要时用「一个变体一次调用」把细节补齐。
   - `tools/figma-extract.js` 是**冻结版**，不要修改它；它报错时改的是调用参数。详见 `tools/figma-extract.md` 的「硬约束：48 KB 上限」。

---

## ③ 刷新 token（变量 / 样式）

### 3.1 导出变量与样式，覆盖两份真源 JSON

目标文件（`gen-tokens.py` 的只读输入，见其文件头与 `load()`）：

- `vibeme-design-system/data/figma-export/variables.json`
- `vibeme-design-system/data/figma-export/styles.json`

⚠️ 仓库里**目前没有**变量/样式的导出脚本：`tools/figma-extract.js` 按 `tools/figma-extract.md` 只处理**单个组件集**。
这一步要用 `mcp__figma__use_figma` 跑一段**只读**脚本导出，**结构必须与现有文件一致**，否则 `gen-tokens.py` 直接失败。
按实际文件核对字段：

- `variables.json`：顶层 `fileKey` / `exportedAt` / `collections[]` / `boundVariableIdsNotLocal`；
  每个 collection 有 `name`、`modes[]{modeId, name}`、`variables[]`；
  每个变量有 `name`、`resolvedType`（`COLOR` / `FLOAT` / …）、`valuesByMode{ "<modeId>": { value, alias, aliasId, percentHint } }`。
  `COLOR` 的 `value` 是 `{hex, alpha}`，`FLOAT` 是数字，别名字段 `alias` / `aliasId`。
- `styles.json`：顶层 `paintStyles` / `textStyles` / `effectStyles` / `gridStyles` 四个数组
  （`gen-tokens.py` 只读这四个键；文字样式的 `lineHeight` / `letterSpacing` 是 `{unit, value}`）。

**两个必须注意的点**（否则导出结果不可用）：

1. `fontSize` / `fontName` / `lineHeight` / `letterSpacing` 可能是 `figma.mixed`（symbol），直接拼字符串会抛错，先判类型。
2. 数值型变量用于**不透明度**时按**百分数**存：`opacity/disabled` 是 `38` + `percentHint: true`，
   落地成 CSS 才是 `0.38`；漏掉 `percentHint` 会被当成 `38px`。

### 3.2 命名变化 → 改 `tools/token-map.json`

- 单个变量要指定 CSS 名 → 写进 `overrides`（如 `"状态色/Error": "status-error"`）。
- 确认是历史遗留、不该进代码 → 写进 `legacy`（清单与理由见该文件 `legacyReason`）。
- 新集合 → 在 `collections` 补 `{mode, prefix}` 规则。

**不要手改生成物**（`tokens.css` / `tokens.json` / `tokens.md` 头部都写着「请勿手改」）。

### 3.3 生成 + 校验

```bash
python3 tools/gen-tokens.py
```

期望输出（exit 0）：

```text
✓ 写入 vibeme-design-system/components/tokens.css（N 字节）
✓ 写入 vibeme-design-system/data/tokens.json（N 字节）
✓ 写入 vibeme-design-system/references/tokens.md（N 字节）

统计：{"tokens": 169, "legacy": 22, "elevations": 4, "textStyles": 19, "paintStyles": 15, "gridStyles": 4}
```

统计里的 `tokens` / `legacy` / `textStyles` / `elevations` 和上一次不同时，先确认是真源确实变了（对比 `variables.json` / `styles.json` 的 `exportedAt`），再继续。

```bash
python3 tools/gen-tokens.py --check
```

期望输出（exit 0）：三行 `✓ … 一致` + 同样的统计行。

出错怎么办：

| 报错 | 含义 | 处理 |
|---|---|---|
| `✗ 有变量无法自动命名（中文/特殊名需要写进 tools/token-map.json 的 overrides 或 legacy）：` 后跟 `- 集合 'X' 的变量 'Y'` | 新变量按规则生成不出合法 CSS 名 | 把每个变量写进 `overrides`（给 CSS 名）或 `legacy`；新集合还要补 `collections`。重跑 |
| `✗ CSS 变量名冲突：--vm-xxx ← 'A' 与 'B'（请在 tools/token-map.json 的 overrides 里显式命名）` | 两个 Figma 变量生成到同一个 CSS 名（报错里已指出这两个来源） | 在 `overrides` 里给其中一个显式命名，重跑；**不要**手改生成物 |
| `✗ 缺少真源文件 …（先跑 tools/figma-extract.js 导出）` | `data/figma-export/{variables,styles}.json` 没写或写坏 | 回到 3.1，确认 JSON 能 `json.load` |

---

## ④ 刷新单个组件

逐条按 `tools/COMPONENT-AGENT-PROMPT.md` 执行，命令化如下。

1. **定位**：在 `vibeme-design-system/data/components-index.json` 的 `components[]` 找 `slug` / `id`（Figma node）/ `cat` / `props` / `defaultSize`。
2. **导出 Figma 事实**（每次调用后**立刻**把返回的 JSON 字符串原样写盘）：

   | # | 调用 | 写到 |
   |---|---|---|
   | 1 | `MODE=variants`，`VARIANT=""` | `data/figma-export/components/<slug>.variants.json` |
   | 2 | `MODE=tree`，`VARIANT=""` | `data/figma-export/components/<slug>.tree.json` |
   | 3 | `MODE=tree`，`VARIANT=<对比变体全名>` | `data/figma-export/components/<slug>.tree.<短标签>.json` |

   第 3 次只在**确实有值得对比的第二态**时做：尺寸最大的一档，或 `checked` / `selected` / `error` / `open` / `loading` / `dragover`
   这类会让子元素变化的变体；只有顶层颜色差异可以不做。
   调用方式：`read` 出 `tools/figma-extract.js` **全文** → 替换 `__SLUG__` / `__SET_ID__` / `__MODE__` / `__VARIANT__`
   → `mcp__figma__use_figma`（带 `sessionId`）→ 把返回的 JSON 字符串**原样** `write` 到目标文件（不要再包引号或代码块）。

   期望输出：返回的 JSON 顶层含 `"scriptVersion":"2"`、`"slug"`、`"mode"`、`"ok":true`、`"trimmed":[]`；
   文件本身的 `bytes` / `bytesUtf8` 与真实字节数接近。例（`button.variants.json`）：`variantCount: 48`、`bytes: 25586`。
   写盘后用 python 校验：能 `json.load`、`ok == true`、`trimmed` 为空（非空要在报告里说明）。

3. **生成事实文档**：

   ```bash
   python3 tools/gen-component-docs.py --slug <slug>
   ```

   期望输出：`✓ 写入 vibeme-design-system/references/components/<slug>.md`
   （只重写 `<!-- GEN:BEGIN -->…<!-- GEN:END -->` 之间的事实段，`GEN:END` 之后的人工讲解原样保留）。

4. **补写讲解**：只改 `<!-- GEN:END -->` 之后，写全 5 节 —— `## 交互与状态`、`## 代码用法`、`## 可访问性`、
   `## 不要这样做`、`## 相关组件`，**每节 ≥80 字**，不要留「待补充」。
5. **更新实现**：`vibeme-design-system/components/<Pascal>/` 下 `<Pascal>.tsx` / `<Pascal>.css` / `index.ts`；
   规则见 `tools/AUTHORING-CONVENTIONS.md` 第 3–6 节（props 只来自 Figma 属性 / 原生透传 / 受控与可访问性；
   样式只允许 `var(--vm-*)`；图标优先用 `mcp__figma__download_assets` 取真实矢量）。
6. **自检**：

   ```bash
   python3 tools/validate.py --slug <slug>
   ```

   期望输出（exit 0）：

   ```text
   校验了 1 个组件；错误 0 条，警告 0 条
   ✓ 全部通过
   ```

   报 `✗ 索引里没有 slug=<slug>` 说明还没在索引里登记，先走 ⑥。其余报错见 ⑨。

---

## ⑤ 刷新全部组件（必须分批）

**硬约束：每批 3 个组件，最多 8 个 agent 并发。** 48 个组件 → 16 批 → 按 8 并发分成 2 波。
不要把所有组件塞进一条提示词（上下文过长），也不要只起 1 个 agent 串行刷。

**批量提示词模板**（可直接复制；把三行 `slug / node / PASCAL` 换成目标组件，其余照抄）：

```text
按 tools/COMPONENT-AGENT-PROMPT.md 刷新下面 3 个组件。一次只做一个，前一个 validate 通过后再做下一个。

  1) slug=<slug1>  node=<id1>  PASCAL=<Pascal1>
  2) slug=<slug2>  node=<id2>  PASCAL=<Pascal2>
  3) slug=<slug3>  node=<id3>  PASCAL=<Pascal3>

对每个组件严格执行：
（1）读 tools/AUTHORING-CONVENTIONS.md、tools/figma-extract.md、vibeme-design-system/references/foundations.md，
     以及 data/components-index.json 里该组件的条目；
（2）用 tools/figma-extract.js（不改脚本）导出 MODE=variants 与 MODE=tree（默认变体），必要时再加一个对比变体 tree；
     返回值原样写入 vibeme-design-system/data/figma-export/components/，校验 json.load 可解析、ok==true、trimmed 为空或已说明；
（3）python3 tools/gen-component-docs.py --slug <slug>；
（4）补写 GEN 段之后的 5 个章节，每节 ≥80 字、不留「待补充」；
（5）更新 vibeme-design-system/components/<Pascal>/ 三个文件（.tsx / .css / index.ts）；
（6）python3 tools/validate.py --slug <slug> 修到 0 error；
（7）报告写/改的文件清单、用到的 token、Figma 里的历史遗留变量、对比变体选择及原因、validate 结果（≤20 行）。

只改本组件自己的文件，不要动 tools/**、components/tokens.css、data/tokens.json、
references/{tokens.md,foundations.md,components.md}、components/index.ts、SKILL.md 以及其他组件的任何文件。
不要修改 tools/figma-extract.js。
```

- 每波结束后先收齐各 agent 的报告与 `validate.py --slug` 结果，再进下一波；**不要边刷边跑全量校验**。
- 全部组件都有导出与实现之后，收尾刷新索引与桶文件：

  ```bash
  python3 tools/gen-component-docs.py --all
  ```

  期望输出：一行 `✓ 写入 vibeme-design-system/references/components.md`、一行 `✓ 写入 vibeme-design-system/components/index.ts`，
  以及每个组件一行 `✓ 写入 …/references/components/<slug>.md`
  （`--all` = `--index --barrel` + 全部组件文档；只想刷新索引用 `--index --barrel`）。

---

## ⑥ 新增组件

顺序不能颠倒：**先登记，再 `--index --barrel`，最后才生成文档与实现**。

1. 在 `vibeme-design-system/data/components-index.json` 的 `components[]` 新增一条：
   `slug` / `name` / `id`（Figma node）/ `cat` / `variants` / `defaultSize` / `theme`（`main` 或 `vibe-ai`）/ `desc` / `props[]`
   （每个 prop：`n` Figma 属性名、`t` = `variant`|`text`|`boolean`、`v` 值域、`p` 代码 prop 名、`default` 默认值）。
   命名规则见 `tools/AUTHORING-CONVENTIONS.md` 第 2 节（`VibeMe AI / X` → slug `vibe-ai-x`，React 名 `VibeAiX`）。
2. 同步同一文件里的 `totals`（`componentSets` / `variants` / `mainLibrary` / `vibeAi`）与 `categories`（各 `sets` / `variants`）。
3. 刷新索引与桶文件：

   ```bash
   python3 tools/gen-component-docs.py --index --barrel
   ```

   期望输出：`✓ 写入 vibeme-design-system/references/components.md` + `✓ 写入 vibeme-design-system/components/index.ts`
   （`validate.py` 会检查这两个文件里都有新组件，缺一个就报错）。
4. 再按 ④ 走：导出 → `--slug <slug>` → 补讲解 → 写实现 → `validate.py --slug <slug>`；预览图别忘 ⑧ 第一条。

---

## ⑦ 验收

```bash
python3 tools/validate.py
```

期望输出（exit 0，48 个组件齐全时）：

```text
校验了 48 个组件；错误 0 条，警告 0 条
✓ 全部通过
```

```bash
python3 tools/gen-tokens.py --check
```

期望输出：三行 `✓ … 一致` + 统计行，exit 0。
（`python3 tools/validate.py --strict-gen` 等价于额外跑一遍生成物一致性。）

- **抽查 2~3 个组件**：打开 `vibeme-design-system/assets/previews/<slug>.png` 与
  `vibeme-design-system/references/components/<slug>.md`，确认预览图与组件集对得上、GEN 段的事实
  （变体数 / 尺寸 / 绑定 token）与讲解段不冲突。
- `validate.py` 检查的正是**五处一一对应**：`data/components-index.json`、`references/components/*.md`、
  `components/*/`、`assets/previews/*.png`、`data/figma-export/components/*.{variants,tree}.json`，
  外加 CSS 不许出现字面量颜色、`var(--vm-*)` 必须有定义、SKILL.md frontmatter 与相对链接。
- 注：`validate.py` 把 SKILL.md 里的相对链接按 **skill 目录**解析，而 `tools/REFRESH.md`（本文件，也见 README）
  指的是**仓库根**的 `tools/`；若它报 `SKILL.md 里的相对链接不存在：tools/REFRESH.md`，
  先确认本文件在仓库根 `tools/` 下、skill 目录里没有第二份。这条是脚本路径口径问题，不是缺少本手册。

---

## ⑧ 提交前 checklist

- [ ] **预览图**用 `mcp__figma__get_screenshot(maxDimension=2400)` 重新导出到 `assets/previews/<slug>.png`
      （细条组件 Progress / Divider / Breadcrumb / Loading 出图很小是正常的，不要为了体积补白；`validate.py` 只在 <300 字节时报错）。
- [ ] **没有把历史遗留变量带进代码**：Figma 里 22 个遗留变量（`Color`、`Color 3`、`Color 4`、`button`、`按钮`、`分割线`、
      `绿色`、`标注色-1`、`标注用色`、`100%`、`100`、`后台主色`、`主色/Main Orange`、`Text/灰/*` 等）清单见
      `tools/token-map.json` 的 `legacy` 与 `references/tokens.md` 末尾；生成文档里出现 `⚠无cssVar` / `⚠ 无对应 CSS 变量`
      时，按 `references/foundations.md` 第 2 节换成语义 token。
- [ ] **数字自洽**：48 个组件集 / 334 个变体 / 169 个 token（另有 22 个遗留变量、19 个文字样式、4 组海拔阴影）
      必须与 data 文件一致 —— `SKILL.md` frontmatter、`data/components-index.json` 的 `totals`、`data/tokens.json` 的 `counts`
      以及 `references/components.md`、README、CHANGELOG 里的说法互相对得上。
- [ ] **CHANGELOG.md 记一条**（语义化版本：新增组件/章节 = 次版本；事实修正、补漏、预览图更新 = 修订号）。
- [ ] 生成物未被手改：改动只落在「Figma 导出 / `tools/token-map.json` / `data/components-index.json` / 人写的讲解与实现」上。

---

## ⑨ 常见故障表

| 现象 | 原因 | 处理 |
|---|---|---|
| `gen-tokens.py` 报「有变量无法自动命名」 | 新变量名是中文/特殊字符，或新集合没配 `collections` | 写进 `tools/token-map.json` 的 `overrides`（给 CSS 名）或 `legacy`；新集合补 `collections`。重跑，别改生成物 |
| `gen-tokens.py` 报「CSS 变量名冲突：--vm-x ← 'A' 与 'B'」 | 两个 Figma 变量生成到同一 CSS 名（报错已指出这两个来源） | 在 `overrides` 里给其中一个显式命名，重跑 |
| `use_figma` 单次导出超 48000 字节 / 返回 `ok:false` | 组件集太大或树太深 | 先看 `trimmed` 是否已自动降级；仍超就拆调用（variants 与 tree 分开、tree 一个变体一次）。**不要改 `figma-extract.js` 的字节常量** |
| 预览图是细条、很小 | Progress（320×6）、Divider（320×1）、Breadcrumb、Loading 本来就是细条 | **正常，不修**；只有 <300 字节才说明导出失败或文件损坏 |
| `validate.py` 报「章节 ## XXX 内容过短（N 字），需要具体讲解」 | `GEN:END` 之后的 5 节为空、太短，或仍有占位符 | 补写 ≥80 字（HTML 注释不计入长度）；去掉「待补充 / TODO / TBD / 占位」；重跑 `--slug` 校验 |
| `validate.py` 报「缺少 Figma 导出 `<slug>.variants.json`」 | 只导了 tree，或文件名/后缀写错 | 按 ④ 补导；文件名严格是 `<slug>.variants.json`、`<slug>.tree.json`（对比变体是 `<slug>.tree.<短标签>.json`） |
| `validate.py` 报「变体总数对不上：索引算出 X，totals 写的是 Y」 | 新增/删除组件后没同步 `totals` | 改 `data/components-index.json` 的 `totals.variants`（= 各组件 `variants` 之和），顺带同步 `categories` 与 `SKILL.md` frontmatter |
| `validate.py` 报「文档里的相对链接不存在」 | 预览图或实现文件缺失，或链接路径写错 | 先确认 `assets/previews/<slug>.png`、`components/<Pascal>/<Pascal>.tsx` 确实存在，再修正文档链接 |
| `validate.py` 报 CSS 字面量颜色 / 引用了未定义的 token | 写了 `#rrggbb`、`rgb()`，或用了他处定义的 `--vm-*` | 换成 `components/tokens.css` 里已定义的语义 token；**不要**往生成物里加变量 |
| `validate.py` 报「SKILL.md 里的相对链接不存在：tools/REFRESH.md」 | 脚本按 skill 目录解析 SKILL.md 的链接，而本手册在仓库根 `tools/` | 见 ⑦ 末尾说明；确认本文件位置即可，不要为此把手册复制进 skill 目录 |
