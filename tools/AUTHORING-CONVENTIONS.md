# 内容生产规范（维护者 / agent 必读）

这份文件是**写这个 skill 的规则**。任何人（或 agent）新增、刷新组件文档与代码实现，都必须按这里的约定来，
否则 `tools/validate.py` 会报错。

---

## 0. 真源与禁令

- **真源是 Figma**：文件 `ZO4WH3sbVCj7lZIFMpiwV9`，页面 `56054:5521`（「全局」总组件库）。
- 事实（尺寸、变体、绑定变量、文字样式）**必须来自 `tools/figma-extract.js` 的导出**，不许凭截图或印象编。
- `data/figma-export/` 下是原始事实，`data/components-index.json` 是索引，`data/tokens.json` 是 token 映射。
- **生成物不要手改**：`components/tokens.css`、`data/tokens.json`、`references/tokens.md`、`references/components.md`
  以及各组件 md 里 `<!-- GEN:BEGIN -->…<!-- GEN:END -->` 之间的内容，都由脚本生成。
- 取值、变体、命名与 Figma 不一致时：**以 Figma 为准**，然后刷新快照，不要为了让文档好看而改数字。

## 1. 目录结构

```
vibeme-design-system/
├── SKILL.md                      # agent 入口（frontmatter + 路由）
├── agents/openai.yaml            # Codex 界面元数据（可选）
├── references/
│   ├── foundations.md            # 人写的设计规则（不变量）
│   ├── tokens.md                 # 生成：token 全量真源
│   ├── components.md             # 生成：48 个组件索引
│   ├── components/<slug>.md      # 生成事实 + 人工讲解（每组件一份）
│   ├── patterns.md               # 人写：页面级组合模式
│   ├── figma-design.md           # 人写：在 Figma 里做设计的工作流
│   └── implementation.md         # 人写：写代码 / 评审的通用规范
├── components/                   # 代码参考实现
│   ├── tokens.css                # 生成：CSS 变量 + 文字样式类
│   ├── index.ts                  # 生成：桶文件
│   └── <Pascal>/<Pascal>.tsx | .css | index.ts
├── assets/previews/<slug>.png    # 每个组件集一张预览图
└── data/                         # 机器可读事实与 token
```

## 2. 命名映射（机械规则，不许发挥）

| 目标 | 规则 | 例子 |
|---|---|---|
| slug | 小写连字符；`VibeMe AI / X` → `vibe-ai-x` | `MenuItem` → `menu-item`；`VibeMe AI / Response Card` → `vibe-ai-response-card` |
| React 名 | slug 各段首字母大写 | `menu-item` → `MenuItem`；`vibe-ai-response-card` → `VibeAiResponseCard` |
| 目录/文件 | React 名同名 | `components/MenuItem/MenuItem.tsx` |
| CSS 类 | `vm-` + slug，BEM-lite：`__元素`、`--修饰符` | `.vm-menu-item`、`.vm-menu-item__label`、`.vm-menu-item--selected` |
| CSS 变量 | 见 `data/tokens.json` 的 `cssVar`（生成，勿猜） | `--vm-radius-button`、`--vm-bg-card` |
| 文字样式类 | `vm-type-` + Figma 样式名 slug | `Heading/Body/S/Medium` → `.vm-type-heading-body-s-medium` |

## 3. Figma 属性 → props 的映射规则

1. **VARIANT 属性 → prop**，属性值小写后做枚举。
   `Type=primary` → `type="primary"`，`Placement=bottom-start` → `placement="bottom-start"`。
   `VibeMe AI / *` 的属性值是首字母大写（`State=Default`），代码里仍用小写 `default`。
2. **TEXT 属性 → 内容插槽**，不是枚举：`label` / `placeholder` / `value` / `initial` / `count`
   → 优先 `children`，其次同名 prop（如 `placeholder`），两者都给时以 `children` 为准。
3. **`State` 变体拆成两类**（关键规则）：
   - **交互态**（`default` / `hover` / `pressed` / `focus`）→ **不做 prop**，用 CSS `:hover` / `:active` / `:focus-visible` 实现；
   - **应用态**（`disabled` / `error` / `open` / `dragover` / `selected` / `empty` / `loading`）→ 做成 prop，
     且优先映射到原生属性（`disabled`、`aria-invalid`、`open`）。
4. **布尔语义的变体**：`Checked` → `checked?: boolean | 'indeterminate'`；`Selected` → `selected?: boolean`；
   组内互斥的（Radio）用原生 `name` 分组，不要自己维护全局状态。
5. **数值语义的变体**（`Value`、`Current`、`Columns`）→ 接收**真实数值**，不要只接受 Figma 示例里的
   `25/50/75/100`、`0/50/100`、`1/2`、`2/3/4`；Figma 的示例值只是视觉样本，要在文档里写清合法范围与钳制规则。
6. **每个 prop 都要有默认值**，默认值与 Figma 的 `defaultVariant` 一致（见 `data/components-index.json` 的 `default`）。
7. prop 名一律小驼峰；不要暴露 `State` 这种 Figma 专用词。

## 4. 逐组件文档模板（`references/components/<slug>.md`）

结构固定，`<!-- GEN:… -->` 之间是脚本生成的事实，**只允许改标记之外的部分**：

```md
# <Figma 名>（<中文名>）

<!-- GEN:BEGIN 由 tools/gen-component-docs.py 生成；改动请改 Figma 或生成器，勿手改本段 -->
## 概览
## 变体与属性
## 各变体的事实
## 结构（默认变体）
## 设计 token
<!-- GEN:END -->

## 交互与状态      ← 必填：每个状态在代码里由什么触发、视觉上变了什么
## 代码用法        ← 必填：可运行的 TSX 示例 + CSS 导入方式
## 可访问性        ← 必填：语义角色、键盘、ARIA、焦点管理
## 不要这样做      ← 必填：至少 3 条具体的坑（含 Figma 里的历史遗留与易错点）
## 相关组件        ← 必填：组合关系（谁内嵌谁、谁和谁一起用）
```

写作要求：

- **具体**，不要写「支持多种状态」这类空话；要写「`disabled` 时整卡 `opacity: 0.38`，文字与描边一起变淡，**不要**换成灰色」。
- 引用 token 用 CSS 变量名（`--vm-*`）+ Figma 变量名（`Brand/Brand`）成对出现，方便两边对照。
- 代码示例必须与 `components/<Pascal>/` 里的真实实现一致（同一组 props、同一个 import 路径）。
- 中文为主，代码与 token 名保持英文原文。

## 5. 代码实现规范（`components/<Pascal>/`）

**文件**：`<Pascal>.tsx`、`<Pascal>.css`、`index.ts`（`export * from './<Pascal>'`）。

**TSX**

- 只用 `react`，**不引入任何第三方依赖**（不要 icon 库、不要 `clsx`、不要 `classnames`、不要 UI 框架）。
- 具名导出 + `forwardRef`（有 DOM 根节点的组件）+ 展开原生属性（`...rest`）。
- `className` 必须与内部类合并，不要覆盖。
- props 接口导出（`export interface <Pascal>Props`），每个 prop 写一行 JSDoc 说明对应的 Figma 属性。
- 用**真实语义元素**：`button` / `input` / `textarea` / `select` / `dialog` / `ul` / `table` …
  绝不把 `div` 样式化成按钮。
- 文字元素上挂 `.vm-type-*` 类（不要手写 `font-size`）。
- 图标用**内联 SVG**：`width`/`height` 跟随尺寸档位，`stroke="currentColor"`、`aria-hidden="true"`，
  并在注释里注明对应 Figma 图标名（如 `{/* Figma: search-line */}`）。

**CSS**

- 只写 `vm-` 前缀的类；所有取值走 `var(--vm-*)`（**出现字面量颜色/圆角/间距即为错误**，0、1px 边框、`100%` 等结构性值除外）。
- 交互态用伪类：`:hover`（叠加 `--vm-white-7`）、`:active`（`--vm-white-6`）、`:focus-visible`（`--vm-border-selected` + ring）。
- `disabled` 用 `opacity: var(--vm-opacity-disabled)` + `cursor: not-allowed`，不要另造灰色。
- 过渡统一 `transition: background-color var(--vm-duration-fast), border-color var(--vm-duration-fast), color var(--vm-duration-fast)`；
  有位移/缩放的地方加 `@media (prefers-reduced-motion: reduce)`。
- 不要写死宽度（除了 Figma 里明确的固定尺寸组件，如输入框参考宽 320）。
- 不要用 `!important`，不要用元素选择器影响宿主页面（`.vm-button *` 少用）。

## 6. 图标

- 图标属于 `Line icon` / `Filled icon` 两族。**先用 Figma 的 `download_assets` 取真实矢量**，
  拿不到时才用等义的简单几何图形，并在注释与文档里写明「示意，建议从 Figma 取原始矢量」。
- 已知语义映射：`search-line`（搜索）、`import-line`（上传）、`user-line`（头像占位）、
  `chevron-down_filled` / `chevron-right_filled`（展开/进入）、`folder` / `search` / `alert`（空状态）、
  `check`（选中/完成）、`close`（关闭）。
- 绝不写 emoji 当图标。

## 7. 预览图

- `assets/previews/<slug>.png`：一个组件集一张，由 `mcp__figma__get_screenshot`（`maxDimension=2400`）导出。
- 细条状组件（Progress、Divider、Breadcrumb、Loading）出图很小是正常的，不要为了体积去补白。
- 文档里用相对路径引用：`![Button 预览](../../assets/previews/button.png)`。

## 8. 校验（提交前必须通过）

```
python3 tools/validate.py            # 全量校验
python3 tools/gen-tokens.py --check  # 生成物是否与真源一致
```

`validate.py` 至少检查：

1. 48 个组件集在 `data/components-index.json`、`references/components/*.md`、`components/*/`、`assets/previews/*.png` 四处**齐全且一一对应**；
2. 每份组件 md 的 5 个必填章节存在且不是占位符；
3. `components/` 里的 CSS 不出现字面量色值（`#rrggbb`、`rgb(`）；
4. CSS 里用到的每个 `var(--vm-*)` 都在 `tokens.css` 里有定义；
5. TSX 里 import 的每个组件目录都存在；
6. JSON 全部可解析，`data/tokens.json` 与 `tokens.css` 的变量集合一致。

## 9. 组件 agent 的标准作业顺序

1. 读 `data/components-index.json` 找到目标组件的 `id` 与 props，读 `tools/figma-extract.md`；
2. 用 `tools/figma-extract.js` 跑 `MODE=variants`（全变体事实）与 `MODE=tree`（默认变体深树），
   必要时再跑一个关键状态变体的 tree；结果写入 `data/figma-export/components/`；
3. 跑 `python3 tools/gen-component-docs.py --slug <slug>` 生成事实段；
4. 补写 5 个自述章节；
5. 写 `components/<Pascal>/` 三个文件；
6. 跑 `python3 tools/validate.py --slug <slug>` 自检，通过后报告文件清单与用到的 token。
