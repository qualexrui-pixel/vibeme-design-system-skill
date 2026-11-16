# 组件 agent 标准作业书（一个组件一份产出）

> 这是给 agent 的执行清单。把 `{{SLUG}}`、`{{SET_ID}}`、`{{PASCAL}}` 替换成目标组件后逐条执行。
> 规则细节一律以 [AUTHORING-CONVENTIONS.md](AUTHORING-CONVENTIONS.md) 为准，本文件只讲顺序与验收。

**目标组件**：slug `{{SLUG}}`、Figma node `{{SET_ID}}`、React 名 `{{PASCAL}}`

---

## 1. 先读（不读完不要动手）

- `tools/AUTHORING-CONVENTIONS.md` —— 命名、props 映射、文档模板、实现规范、校验项
- `tools/figma-extract.md` —— 导出器用法与字段含义
- `vibeme-design-system/references/foundations.md` —— 设计不变量与 token 使用规则
- `vibeme-design-system/references/tokens.md` —— 全部 token 的 `figmaName ↔ cssVar ↔ 值`
- `vibeme-design-system/data/components-index.json` —— 找到本组件的条目（props 轴、默认值、默认尺寸）
- 已有实现 `vibeme-design-system/components/Button/` 与文档 `references/components/button.md` —— 作为风格样板
- 若本组件已有文档/实现（刷新场景），先读现状再改，不要推倒重来

## 2. 导出 Figma 事实（每次调用后立刻写盘）

| 调用 | 参数 | 写到 |
|---|---|---|
| 1 | `MODE=variants`, `VARIANT=""` | `data/figma-export/components/{{SLUG}}.variants.json` |
| 2 | `MODE=tree`, `VARIANT=""` | `data/figma-export/components/{{SLUG}}.tree.json` |
| 3 | `MODE=tree`, `VARIANT=<对比变体全名>` | `data/figma-export/components/{{SLUG}}.tree.<短标签>.json` |

- 第 3 次只在**确实有值得对比的第二态**时做：尺寸最大的一档，或 `checked` / `selected` / `error` /
  `open` / `loading` / `dragover` 这类会让子元素变化的变体。变体只有一个（或差异只在顶层颜色）可以不做。
- 调用方式见 `tools/figma-extract.md`：读出脚本全文 → 替换占位符 → `mcp__figma__use_figma` →
  把返回的 JSON 字符串**原样** `write` 到目标文件。
- **绝对不要修改 `tools/figma-extract.js`**；它已被冻结。若它报错，改的是你的调用参数，不是脚本。
- 每次写盘后用 python 校验 `json.load` 能解析、`ok == true`、`bytes` 与真实字节数接近。
- `trimmed` 非空是允许的（48KB 上限触发降级），但要在报告里说明。

## 3. 生成事实文档

```
python3 tools/gen-component-docs.py --slug {{SLUG}}
```

它会在 `references/components/{{SLUG}}.md` 里写入 `<!-- GEN:BEGIN -->…<!-- GEN:END -->` 之间的
事实段（概览 / 变体与属性 / 各变体的事实 / 结构 / 设计 token）。

## 4. 补写讲解（只改 `<!-- GEN:END -->` 之后）

读一遍生成的事实，然后写这五节，**每节至少 80 字**，不要留「待补充」：

| 章节 | 要写成什么样 |
|---|---|
| `## 交互与状态` | 逐状态：代码里由**什么**触发（`:hover`？`disabled` prop？）＋视觉上**变了什么**（引到 CSS 变量名）。例如「hover 在底色之上叠 `--vm-white-7`，不是换一个实体色」 |
| `## 代码用法` | 一段可运行的 TSX，**必须与第 5 步的真实实现一致**（同一组 props、同一个 import 路径），含受控/非受控与典型组合写法 |
| `## 可访问性` | 语义元素与角色、键盘行为、ARIA 属性、焦点管理与可见焦点 |
| `## 不要这样做` | ≥3 条**具体**坑：Figma 里的历史遗留变量、旧版胶囊按钮、`State` 当 prop、硬编码色值、点击区域等 |
| `## 相关组件` | 与哪些组件组合、谁内嵌谁、互斥关系 |

## 5. 写实现

`vibeme-design-system/components/{{PASCAL}}/` 下三个文件：`{{PASCAL}}.tsx`、`{{PASCAL}}.css`、`index.ts`。

硬要求（`validate.py` 会卡）：

- **不要发明 Figma 里没有的 props 或状态**。props 只允许来自三类：① Figma 的变体属性；
  ② 原生属性透传（`...rest`）；③ 必要的受控/非受控与可访问性关联（`aria-*`、`id`、`errorMessage` 这类）。
  把别的组件集的能力塞进来（例如给 `Input` 加 `multiline` 代替 `Textarea`）属于越界，不要做。
- 只改本组件自己的文件。**不要动** `tools/**`、`components/tokens.css`、`data/tokens.json`、
  `references/tokens.md`、`references/foundations.md`、`references/components.md`、`components/index.ts`、
  `SKILL.md`，以及其他组件的任何文件（它们会在最后统一重新生成）。
- 只用 `react` 与相对路径 import，**不引入任何第三方依赖**；
- 具名导出 `{{PASCAL}}` + `export interface {{PASCAL}}Props`，props 有 JSDoc 说明对应哪个 Figma 属性；
- 有 DOM 根节点就用 `forwardRef` + `...rest` 透传，`className` 与内部类合并；
- 用真实语义元素（`button` / `input` / `textarea` / `select` / `dialog` / `table` …），不要 `div` 假按钮；
- 样式只允许 `var(--vm-*)`：**CSS 里不得出现 `#`、`rgb(`、`hsl(` 字面量**（除结构性的 `0`/`1px`/`100%`）；
- 交互态用 `:hover` / `:active` / `:focus-visible`，**不要**做成 `state` prop；`disabled` / `error` / `open` /
  `checked` / `selected` 才是 prop，并优先映射原生属性；
- 文字挂 `.vm-type-*` 类（不要手写 `font-size`）；禁用态用 `opacity: var(--vm-opacity-disabled)`；
- 图标用内联 SVG（`currentColor`、`aria-hidden="true"`），注释标出 Figma 图标名；
- 过渡用 `--vm-duration-*`，有位移/缩放的加 `prefers-reduced-motion` 兜底。

## 6. 自检

```
python3 tools/validate.py --slug {{SLUG}}
```

修到 **0 error**；warning 能清就清（`!important`、非 `vm-` 类名等）。
如果校验因为「事实与代码不一致」而失败，改代码或改文档，**不要改校验脚本**。

## 7. 报告（≤20 行）

必须包含：写/改的文件清单；用到的 token 列表；Figma 里发现的历史遗留变量或异常；
对比变体选的是哪个及原因；`validate.py` 结果；没做到或不确定的地方（如实说，不要粉饰）。
