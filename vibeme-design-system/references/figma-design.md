# 在 Figma 里用 VibeMe 组件库做设计

> **适用**：在 Figma 里把需求画成 VibeMe 的页面、屏幕、弹窗、抽屉、面板、表单、列表、仪表盘等**组合视图**。
> **不适用**：往库里**新增或修改**可复用组件集本体 —— 那条流水线见 [COMPONENT-AGENT-PROMPT.md](../../tools/COMPONENT-AGENT-PROMPT.md) 与 [AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md)。
> **配套阅读**：[foundations.md](foundations.md)（设计不变量）、[tokens.md](tokens.md)（取值真源）、[components.md](components.md)（组件清单）。
> **判定优先级**：**Figma 实时数据 > 本目录快照**（见 [SKILL.md](../SKILL.md) 第五节）。

---

## 1. 组件库在哪

| 项 | 值 | 出处 |
|---|---|---|
| Figma 文件 | `ZO4WH3sbVCj7lZIFMpiwV9`（VibeMe App - Web Design 备份） | `data/components-index.json` 的 `source.fileKey` |
| 页面 | 「全局」总组件库，node `56054:5521` | `source.pageId` |
| 索引板 | node `56066:6408` | `source.indexBoardId` |
| 规模 | 48 个组件集 / 334 变体 = 主库 43 集 / 316 变体 + `VibeMe AI / *` 5 集 / 18 变体 | `source` 同级 `totals`；[SKILL.md](../SKILL.md) |
| 刷新时间 | `source.exportedAt` | `data/components-index.json` |

- **索引板**是组件集的清单入口（node 见上表）。在 Figma 里从板上的组件名跳进对应组件集（Figma 文本超链接用 Cmd/Ctrl + 单击打开）；板上有多少行、是否覆盖 `VibeMe AI / *`，**以 Figma 实时数据为准**。
- **机器可读地址**：`data/components-index.json` 的 `components[]`，每条给出 `slug` / `name` / `id`（组件集 node id）/ `cat` / `variants` / `defaultSize` / `props`。人读清单是 [components.md](components.md)。
- `VibeMe AI / *` 这 5 个组件集**也属于本库**，但绑的是另一套 token（`VibeMe AI / *` 前缀，落地成 `--vm-ai-*`），**不要与主库的中性 + 砂色体系混用**（[SKILL.md](../SKILL.md) 硬规则 9、[tokens.md](tokens.md)「VibeMe AI 主题」）。
- 术语与代码的对照（变量 ↔ `var(--vm-*)`、文字样式 ↔ `.vm-type-*`、效果样式 ↔ `--vm-elevation-*`）见 [foundations.md](foundations.md) 第 9 节。

## 2. 页面上哪些东西不是组件库（别误用）

页面 `56054:5521` 上除了这 48 个组件集，还有团队成员自己的试验 frame：`Button`、`Input`、`PrimaryBtn`、`Modal_*`、`Home`、`CreateMV`、`VibeMe AI / Component Library` 等（[SKILL.md](../SKILL.md) 第五节明确点名 `Button` / `Home` / `CreateMV` / `Modal_*` 等；完整清单以 Figma 实时数据为准）。它们**不属于本组件库，不要当组件集引用**。

判断一个节点能不能用，三条同时成立才用：

1. 它本身是 `COMPONENT_SET`（组件集），不是普通 `FRAME` / `GROUP`；
2. 它能在索引板 `56066:6408` 上找到，或在 `data/components-index.json` 的 `components[]` 里有条目（即 48 个之一）；
3. 它的变体轴与 [components.md](components.md) 里对该组件的记录一致。

三条不满足 → 那是别人的试验稿，不要拿它的实例当组件用，更不要照它写代码。两处特别容易踩的历史遗留：

- 文件里另有一个**旧版胶囊按钮**（圆角 999、蓝底、MiSans），**它不是本库的 Button**（本库按钮圆角 12px）——见 [foundations.md](foundations.md) 第 5 节的警告。
- 名为 `VibeMe AI / Component Library` 的 frame **不等于** `VibeMe AI / Trigger Button`、`Prompt Field`、`Generation Status`、`Capability Chip`、`Response Card` 这 5 个组件集；后者才在 [components.md](components.md) 的「VibeMe AI」表里。

## 3. 硬规则（画的时候就得守，不能等交付再改）

1. **必须是真实组件实例**：从库里拖 `INSTANCE`、用组件属性切变体；**不要把 UI 拍平成图片，也不要画成相似但独立的 frame**（[SKILL.md](../SKILL.md) 第四节）。需要截图核对时，核对完就删掉，别让截图留在交付物里。
2. **不要 detach 实例、不要在实例内部改被保护的子图层**：detach 会连变量与样式绑定一起丢掉，直接违反第 4 条。要改文案就改暴露出来的属性。
3. **文字一律套 Text Style**（共 19 个，清单与取值见 [tokens.md](tokens.md)「字体 Typography」）：**不要手改 font-size / line-height / letter-spacing**。字体只有 Poppins（中文回退 PingFang SC / Microsoft YaHei）。
   ⚠️ 有 3 个样式名不副实：`Heading/Body/L/Medium`、`Heading/Body/M/Medium`、`Heading/Body/S/SemiBold` 名字写着 Medium/SemiBold，实际都是 Poppins Regular，照抄前先看 [tokens.md](tokens.md) 的警告段。
4. **颜色 / 间距 / 圆角 / 字号 / 阴影一律绑 Variables**（Fill、Stroke、Auto Layout 的 gap 与 padding、圆角都能绑变量），**不许手填十六进制或裸像素**。优先语义层（`Background/bg-card`、`Text/Text-Secondary`、`Semantic Radius/radius-button`、`Semantic Space/padding-*`），语义确实缺失时才用原始层（`Neutral/Neutral-750`、`space/space-4`），并在交付说明里写清理由——分层规则见 [foundations.md](foundations.md) 第 2 节。
5. **圆角按语义用**：按钮 / 输入框 / 卡片 / Toast 用 `Semantic Radius/radius-button`｜`radius-input`｜`radius-card`｜`radius-toast`（均为 12px）；标签用 `radius-badge`（4px）；头像、开关、进度条用 `radius-avatar`（999px）。完整表见 [tokens.md](tokens.md)「圆角 Radius」。
6. **图标用 `Line icon` / `Filled icon` 两个图标组件集的实例**，不要用矩形 + 线段拼，更不要用 emoji（[AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 6 节）。库里已内嵌出现过的值（见 `data/figma-export/`）：`search-line`、`import-line`、`user-line`、`alert-line`、`folder-line`、`cross_filled`、`chevron-up_filled` / `chevron-down_filled` / `chevron-left_filled` / `chevron-right_filled`、`circle-check-filled` / `circle-cross-filled` / `circle-alert-filled` / `circle-info-filled`。注意**同一个图标组件集里 `_filled` 与 `-filled` 两种写法并存**，请按 Figma 里实际列出的值选。
7. **只有深色一套主题**：页面底 `Background/bg-app`、面板 `bg-panel`、卡片 `bg-card`；文件里的变量只有一个 mode，**没有 light/dark 切换，不要自行发明浅色版本**（[foundations.md](foundations.md) 第 3 节）。
8. **状态直接用现成变体**：`State=hover` / `pressed` / `disabled` / `error` / `open` 库里都已经画好。**不要再手动叠一层 8% 白当 hover、也不要手动把整层调成 38% 当 disabled** —— `--vm-white-7` / `--vm-white-6` / `--vm-opacity-disabled` 是**代码里的实现手法**，设计侧照抄会造出库外状态（[foundations.md](foundations.md) 第 1 节）。
9. **品牌色只有 `Brand/Brand` = #FFCC90**（hover `Brand/Brand-Hover`、禁用 `Brand/Brand-Disable`），**禁止引入橙色系**；`tokens.md` 末尾列出的历史遗留变量一律不引用（[SKILL.md](../SKILL.md) 硬规则 2、[tokens.md](tokens.md) 末节）。

## 4. 手把手：用组件库搭一个页面

### 第 0 步：先列组件清单
把页面拆成区块 → 在 [components.md](components.md) 按类别找（表单控件 / 展示类 / 反馈类 / 导航类 / 数据展示类 / 布局类）→ 记下 slug 与属性轴。
**缺组件时不要自己画一个**：放一个临时 Frame 占位，并在交付说明里把它记为「库缺口」。

### 第 1 步：找组件
三种方式任选：
- 索引板 `56066:6408`：找到组件名那一行，跳进对应组件集；
- Figma 的 Assets 面板搜组件名（`Button`、`Input`、`Modal`…）；
- 从 `data/components-index.json` 取该组件的 `id`，用「跳转到节点」直接定位。

### 第 2 步：拖实例
从组件集里拖出**默认变体**的实例，先放进目标区块，只保证它是 `INSTANCE`，尺寸与状态之后再说。

### 第 3 步：切变体属性
在右侧面板改组件属性（`Type` / `Size` / `State` / `Tone` / `Placement`…）。**属性值一律小写，直接对应代码里的 prop 枚举值**：`Type=primary, Size=md, State=default` → `type="primary" size="md"`（[foundations.md](foundations.md) 第 9 节）。

- 变体是属性轴的**笛卡尔积**，没有隐藏例外（Button 的 48 = 4 Type × 3 Size × 4 State，见 [components/button.md](components/button.md)）。
- `VibeMe AI / *` 的属性值是首字母大写（`State=Default`），代码里仍写小写（[AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 3 节）。
- 某个组件到底有哪些轴、默认值是哪个、内嵌了什么，**以 [components/&lt;slug&gt;.md](components/) 为准**。

### 第 4 步：改 TEXT 插槽文案
`label` / `placeholder` / `value` / `initial` / `count` 是 TEXT 属性 = **内容插槽，不是枚举**，直接改字即可（[AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 3 节）。

- 写**真实内容**，不要留 `Button`、`请输入` 这类默认文案——[components.md](components.md) 里的默认文案只是样本。
- 改完回看一眼：文字样式还在（没被覆盖成手写字号），宽度没被撑破或裁切。

### 第 5 步：Auto Layout 组合
- 每个结构性行 / 列 / 工具栏 / 内容区 / 卡片组都用 Auto Layout，直接在大 Frame 里建，**不要先散放再拼贴、再重新挂父级**。
- **组件之间的外部间距**用 `space/space-*` 变量做 gap；**组件内部**的内边距用组件自己的 `Semantic Space/padding-*`，不要给组件实例另加内边距（[foundations.md](foundations.md) 第 4 节）。
- 页面级容器用 `Container`（`type`: narrow/default/wide/full = 720/1200/1440/1560），水平/垂直排布用 `Stack`（`direction` + `gap`），等分列用 `Grid`（`columns`: 2/3/4）——它们本身就是库里的组件集，属性轴见 [components.md](components.md)、宽度口径见 [foundations.md](foundations.md) 第 7 节。
- 响应式意图要显式：定宽用档位，弹性区域用 `FILL`，内容驱动用 `HUG`。
- 页面骨架可以套 4 套栅格样式之一，**取值以 [tokens.md](tokens.md)「栅格样式」为准**。

### 第 6 步：绑 Variables
逐个检查，该绑的都绑上：

| 位置 | 用哪个 token |
|---|---|
| 填充 | `Background/bg-app`｜`bg-page`｜`bg-panel`｜`bg-card`｜`bg-toast`｜`Surface-hover`/`Surface-selected`/`Surface-pressed`｜`Brand/Brand`｜`状态色/*` |
| 描边 | 默认 `Background/border-default`（12% 白）；聚焦 `Background/border-selected`（50% 白），线宽 `border/width/thin`｜`thick` |
| 文字 | `Text/Text-Primary`｜`Text-Secondary`｜`Text-Tertiary`（只用于非关键信息）｜`Text-Disable`｜`Text-Action` |
| 遮罩 | `Scrim/scrim-modal`（#000 @56%） |
| 圆角 | 见 §3 第 5 条的语义圆角 |
| 弹窗宽 | `Modal Size/modal-{sm\|md\|lg\|xl\|2xl}` = 400/520/720/880/1120 |

取值、别名关系、百分比语义一律以 [tokens.md](tokens.md) 为准。

### 第 7 步：加 Effect Style
阴影**只用 Effect Style** `Elevation/1` … `Elevation/4`，不要手拼 drop shadow：卡片 / 输入浮层用 1；通知、Popover 用 2–3；Modal、Drawer 用 4（[foundations.md](foundations.md) 第 6 节、[tokens.md](tokens.md)「海拔阴影 Elevation」）。

### 第 8 步：交付前自查
- [ ] 所有 UI 元素都是 `INSTANCE`，不是画出来的相似图形；
- [ ] 没有 detach、没有残留的临时发现用实例、没有库外自造组件；
- [ ] 交付物里没有整屏截图或图片化图层；
- [ ] 文字全部套 Text Style，字体是 Poppins；
- [ ] 颜色 / 描边 / 圆角 / gap / padding 全部是变量或样式，没有裸值；
- [ ] 圆角是语义圆角（按钮 12px，不是 999 胶囊）；
- [ ] 图标来自 `Line icon` / `Filled icon`；
- [ ] 状态是切变体切出来的，不是手叠图层；
- [ ] 文案与数据是真实内容，没有 `Button` / `请输入` 这类占位；
- [ ] 页面与顶层 frame 命名有意义；产品页面没有画进「全局」总组件库页面；
- [ ] 库缺口已记录在交付说明里。

## 5. 常见错误（交付前对一遍）

| # | 错误 | 为什么错 / 正确做法 |
|---|---|---|
| 1 | 把整屏**拍平成图片**，或画成相似但独立的 frame | 交付物必须可编辑、可交接；[SKILL.md](../SKILL.md) 第四节明确要求用真实组件实例搭页面 |
| 2 | 用矩形 + 文本**画一个像按钮/输入框的东西** | 等于在库外自造组件。拖 `Button` / `Input` 真实实例，用属性切变体 |
| 3 | 用了页面上的 `PrimaryBtn` / `Modal_*` / `Home` / `CreateMV` 这类**试验 frame** | 它们不属于组件库（§2）。判定标准：是不是索引板 / `components-index.json` 里的 48 个之一 |
| 4 | detach 实例后改内部图层 | 变量与样式绑定一起丢，后续无法交接，也违反 §3 第 4 条 |
| 5 | 手填十六进制颜色、手填 px 圆角/间距 | 一律绑 Variables；圆角按语义选（§3 第 4、5 条） |
| 6 | 手动叠一层 8% 白当 hover、手动整层 38% 当 disabled | 库里有现成 `State=hover` / `disabled` 变体，切变体即可；叠加是实现手法（§3 第 8 条） |
| 7 | 手改字号字重，不用 Text Style | 用 19 个 Text Style 之一；注意 3 个名不副实的样式（§3 第 3 条） |
| 8 | 用 emoji 或矩形拼图标 | 用 `Line icon` / `Filled icon` 实例（§3 第 6 条） |
| 9 | 按钮圆角画成 999 的胶囊 | 那是文件里的旧版胶囊按钮；本库按钮 = `Semantic Radius/radius-button` 12px |
| 10 | 引入橙色（如 #FF6E20），或做一套浅色稿 | 品牌色只有 #FFCC90，只有深色一套主题（§3 第 7、9 条） |
| 11 | 把 `VibeMe AI / *` 的紫/粉与主库的中性+砂色混在一张图里 | 两套 token 不通用（§1） |
| 12 | 拿 `VibeMe AI / Component Library` 之类的 frame 当组件源 | 它不是那 5 个 `VibeMe AI / *` 组件集，以 [components.md](components.md) 里的名字为准 |
| 13 | 交付说明只写「已完成」，不写用了哪些组件与 token | 交接信息缺失；见 §6.6 |

## 6. 交接到代码

本节是设计 → 代码的对照总表。**本节没写到的细节，一律以 [components/&lt;slug&gt;.md](components/) 为准。**

### 6.1 变体 → props

- VARIANT 属性 → prop，属性值**小写**当枚举：`Type=primary` → `type="primary"`；`Placement=bottom-start` → `placement="bottom-start"`（[AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 3 节）。
- prop 名一律小驼峰，不把 `Type` / `State` 这类 Figma 专用词暴露给调用方。
- 每个 prop 的默认值与 Figma 的 `defaultVariant` 一致，见 `data/components-index.json` 的 `default` 字段。
- ⚠️ `data/components-index.json` 的 `props[].p` 对 `State` 一律写成 `state`，那只是索引层的通用映射。**交互态（`default`/`hover`/`pressed`/`focus`）在代码里不是 prop**（见 6.2），所以别照着这个字段给交互态加 prop —— 以组件文档为准。

### 6.2 交互态：Figma 里是变体，代码里是伪类

| Figma 变体 | 代码 |
|---|---|
| `State=hover` | `:hover`（填充类：底色 + `--vm-white-7`；输入/导航类：描边换成 `--vm-white-4`） |
| `State=pressed` | `:active`（填充类：底色 + `--vm-white-6`） |
| `State=focus` | `:focus-visible`（`--vm-border-selected` + `--vm-focus-ring-width` 2px） |
| `State=disabled` | `disabled` prop → `opacity: var(--vm-opacity-disabled)`（0.38），**不换**底色 / 描边 / 文字色 |
| `State=error` / `open`、`Checked` / `Selected` | props：`error` / `open` / `checked` / `selected` |

- **同一体系里两种状态手法并存**：填充类用叠加、输入/导航类换描边。某个组件到底用哪种，**以 [components/&lt;slug&gt;.md](components/) 为准**，不要互相套用（[foundations.md](foundations.md) 第 1 节）。
- 设计侧的含义：**不要为 hover / pressed 另建画板或另存一个组件**，库里的变体已经表达完了，代码侧由伪类实现。

### 6.3 布尔 / 数值 / TEXT

- TEXT（`label` / `placeholder` / `value` / `initial` / `count`）→ 内容插槽，优先 `children`，其次同名 prop（如 `placeholder`）。
- 布尔语义：`Checked` → `checked?: boolean | 'indeterminate'`；`Selected` → `selected?: boolean`；组内互斥的（Radio）用原生 `name` 分组。
- 数值语义（`Value` / `Current` / `Columns`）→ 接**真实数值**，Figma 里的 `25/50/75/100`、`0/50/100`、`1/2`、`2/3/4` 只是视觉样本（[AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 3 节）。

### 6.4 内嵌关系：代码里直接用子组件，不要重造

组件集内部已经放了别的组件实例，[components.md](components.md) 的「内嵌」列就是组合关系：

- **Modal** 内已有 `Filled icon`（`Property 1=cross_filled`）与 Button 的 `Type=danger|primary|secondary, Size=md, State=default` → 代码里用 Modal + Button，不要自己造关闭按钮和确认按钮；
- **Header** 内已有 Search 与 Button → Header + Search + Button；
- **Table** 内已有 Tag（`Tone=neutral, Size=sm, Style=soft`）、Empty、Skeleton → 空态 / 加载态不要另造一套；
- **Dropdown** 面板内已有 MenuItem 实例（`State=default` / `State=hover`）；
- **List** 内已有 Avatar（`Size=md, Type=initial`）与 `chevron-right_filled`；
- **Pagination** 内已有 `chevron-left_filled` / `chevron-right_filled`。

每个组件准确的内嵌清单在 [components/&lt;slug&gt;.md](components/) 的「概览」段。

### 6.5 怎么读 `references/components/<slug>.md`

1. 先在 [components.md](components.md) 找到 slug（按类别分组，含变体数、属性轴、默认尺寸、内嵌、预览图）；
2. 打开 `references/components/<slug>.md`：
   - `<!-- GEN:BEGIN -->…<!-- GEN:END -->` 之间是从 Figma 导出的事实段（概览 / 变体与属性 / 各变体的事实 / 结构 / 设计 token），**由脚本生成，不要手改，也不要在别处另抄一份数字**；
   - 标记之外是 5 节讲解：交互与状态 / 代码用法 / 可访问性 / 不要这样做 / 相关组件；
3. 需要取值含义时回 [tokens.md](tokens.md)；需要设计规则时回 [foundations.md](foundations.md)；
4. 代码参考实现在 [`components/<Pascal>/`](../components/)（`.tsx` + `.css` + `index.ts`，零依赖）；自检跑 `python3 tools/validate.py --slug <slug>`。

**拿不准就写「以 references/components/<slug>.md 为准」，不要凭印象编数字。**

### 6.6 交付说明要写什么

- 用到的组件集与具体变体（Figma 名 + 属性值）；
- 用到的 token 组（Figma 变量名，必要时给对应的 `--vm-*`）；
- 状态覆盖情况：哪些用了变体、哪些在代码里是伪类或 prop；
- 自造的临时结构（只应是库缺口的占位，并说明为什么不能复用组件）；
- 库缺口，以及需要产品确认的设计决策。
