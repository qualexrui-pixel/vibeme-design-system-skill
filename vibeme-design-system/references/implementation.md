# 实现通用规范（写代码 / 评审代码）

这份文件是**通用契约**：按 VibeMe 组件库写代码、评审代码时，所有组件都适用。
具体到某一个组件时，**以 `references/components/<slug>.md` 的「各变体的事实」为准** ——
那是从 Figma 导出的原始绑定，「通用规范」与它冲突时以组件 md 为准，并在报告里指出冲突。

| 你要做的事 | 顺序 |
|---|---|
| 写某个组件的代码 | [foundations.md](foundations.md) → [components.md](components.md) → `references/components/<slug>.md` → [components/](../components/) 里同风格实现 → 本文 |
| 评审代码是否漂移 | 本文「⑥ 评审方法」→ 涉及组件的 `references/components/<slug>.md` → [tokens.md](tokens.md) |
| 只要取值 | [tokens.md](tokens.md)（人读）/ [data/tokens.json](../data/tokens.json)（机器读） |

> `references/components/` 目前缺 `drawer.md` / `popover.md` / `toast.md`（`components/` 里也还没有它们）。
> **这三个组件没有事实文档**：写它们之前先按 [tools/REFRESH.md](../../tools/REFRESH.md) 或组件 agent 流程
> 导出 Figma 事实，或者只写「以 `references/components.md` 索引里的属性轴为准」，不要在本文里替它们编事实。

---

## ① 组件 API 约定

总原则：**props 只允许来自三类** —— ① Figma 的变体属性；② 原生属性透传（`...rest`）；
③ 必要的受控/非受控与可访问性关联（`aria-*`、`id`、`errorMessage` 这类）。
细节见 [AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 3 节。

| Figma | 代码 | 例子 |
|---|---|---|
| VARIANT 属性 → prop | prop 名小驼峰，**属性值一律小写**做枚举 | `Type=primary` → `type="primary"`；`Placement=bottom-start` → `placement="bottom-start"` |
| TEXT 属性（`label`/`placeholder`/`value`/`initial`/`count`） | **内容插槽**，不是枚举：优先 `children`，其次同名 prop | Button 的 `label` → `children`；Search 的 `placeholder` → `placeholder` |
| `false`/`true` 值域 | 布尔 prop | `Checked` → `checked?: boolean \| 'indeterminate'`；`Selected` → `selected?: boolean`；`State=open` → `open?: boolean` |
| 数值语义（`Value`/`Current`/`Columns`） | 接收**真实数值**并钳制 | Progress `value` 是 0–100 的百分比，Figma 的 25/50/75/100 只是样本；Grid `columns` 接受任意正整数 |
| 默认值 | 每个 prop 都要有默认值，**与 Figma `defaultVariant` 一致** | Container 默认是 `narrow`（720），不是 `default`（1200） |

**交互态不做 prop，应用态做 prop并映射原生属性**：

- `State=hover` / `pressed` / `focus` → CSS `:hover` / `:active` / `:focus-visible`，**不暴露 `state` prop**。
  Button 的 48 变体里有 12 个是 hover/pressed/focus，代码里一个 prop 都不占。
- `State=disabled` → `disabled` prop，直接映射原生 `disabled`；`error` → `error` + 原生 `aria-invalid`；
  `open` → `open`（落到原生 `<dialog>` 或 `aria-expanded`）；`checked` / `selected` → 原生 `checked` / `aria-selected`。
- **不要暴露 `State` 这种 Figma 专用词**，prop 名一律小驼峰。

**受控 / 非受控成对**：需要用户改值的组件必须同时给两条路。
受控：`value` / `checked` / `open` + `onChange` / `onOpenChange`；
非受控：`defaultValue` / `defaultChecked` / `defaultOpen`（Dropdown 用 `defaultOpen`，Slider 用 `defaultValue`）。
两条路不要混着实现 —— 给了受控值就走受控（组件不自己存），不传才用内部 `useState`。

**forwardRef 与 `...rest`**：有 DOM 根节点的组件一律
`forwardRef<HTMLElement, XxxProps>(...)` + `{...rest}` 透传原生属性，`className` 与内部类**合并而不是覆盖**。
被 Figma 属性占用的原生名要改名（Button 的 `type` 被视觉类型占用，原生类型走 `htmlType`）。
`ref` / `...rest` 落在**真正的交互元素**上（Dropdown 落在触发器的 `<button>`，不是外层 div）。

**用真实语义元素**：`button` / `input` / `textarea` / `select` / `dialog` / `table` / `ul` / `dl`。
绝不把 `div` 样式化成按钮。图标用内联 SVG（`stroke="currentColor"`、`aria-hidden="true"`），注释标出 Figma 图标名。

**不要发明 Figma 里没有的 props / 状态 / 变体**。典型越界：给 Input 加 `multiline` 代替 Textarea；
给 Table 加 `hover` / `selected`（那是 TableRow 的事）；给 Modal 加 `state`（它没有 `State` 轴）。

## ② 样式约定

只引 `components/tokens.css` 里的变量，**只写 `var(--vm-*)`**；CSS 里出现字面量颜色（`#`、`rgb(`、`hsl(`）
即为错误（结构性的 `0` / `1px` / `100%` 除外）。语义缺失时才退回原始层（`--vm-neutral-750`、`--vm-space-4`），
并在文档里说明理由 —— 优先顺序见 [foundations.md](foundations.md) 第 2 节。

- **文字**：挂 `.vm-type-*` 工具类（`Heading/Body/S/Medium` → `.vm-type-heading-body-s-medium`）；
  挂不上类的地方（如图标字号）用配套数值变量 `--vm-type-<slug>-size` / `-weight` / `-line-height`。
  **不要手写 `font-size` / `line-height` / `font-family`**。
  ⚠️ `Heading/Body/L/Medium`、`Heading/Body/M/Medium`、`Heading/Body/S/SemiBold` 三档名不副实（实际 Regular），
  照抄前先看 [tokens.md](tokens.md) 的警告表 —— 真要 Medium/SemiBold 时用类名与字重对得上的档位。
- **颜色**：底色/面板/卡片 `--vm-bg-*`；描边 `--vm-border-default` / 聚焦 `--vm-border-selected`；
  文字 `--vm-text-primary` / `-secondary` / `-tertiary` / `-disable` / `-action`；状态 `--vm-status-*`；遮罩 `--vm-scrim-modal`。
  品牌色只有 `--vm-brand`，**禁止橙色**；`--vm-text-tertiary`（30% 白）只给非关键信息。
- **hover / pressed 两种手法，按组件 md 的事实选**（[foundations.md](foundations.md) 第 1 节第 5 条）：
  - **填充叠加**（Button、MenuItem、List…）：`background-image: linear-gradient(var(--vm-white-7), var(--vm-white-7))`，
    pressed 换成 `--vm-white-6`，**底色变量本身不变**；
  - **前景/描边换 token**（Input、Search、Select、Tabs…）：hover 把描边换成 `--vm-white-4`（30% 白），
    focus 用 `--vm-border-selected`（50% 白）+ 2px（`--vm-border-width-thick`）+ `--vm-focus-ring-width` 外环。
  - ⚠️ **同一体系里两种手法并存，不要互相套用**；Card 还有第三种（hover 换 `--vm-surface-hover` + `--vm-white-4` 描边），
    以 `references/components/card.md` 为准。
- **disabled**：只加 `opacity: var(--vm-opacity-disabled)`（0.38）+ `cursor: not-allowed`，
  **不换**底色、描边、文字色；不要另造一套灰色。
- **过渡**：`transition` 用 `--vm-duration-fast`（100ms，hover/pressed）、
  `--vm-duration-normal`（200ms，展开/收起）、`--vm-duration-slow`（300ms，Modal/Drawer 进出）；
  缓动 Figma 没定义，进场 `ease-out` / 退场 `ease-in`，同一产品保持一致。
- **必须尊重 `@media (prefers-reduced-motion: reduce)`**：有位移/缩放/旋转的组件把时长降到 0 或改成透明度切换
  （`components/` 里现有实现统一写成 `transition: none`）。
- 圆角按语义：按钮/输入/卡片/Toast 用 `--vm-radius-button` / `-input` / `-card` / `-toast`（12px）、
  标签 `--vm-radius-badge`（4px）、头像/开关/进度条 `--vm-radius-avatar`（999px）。
  ⚠️ 文件里另有一个旧版胶囊按钮（999 圆角、蓝底、MiSans），**不要照它写**。
- 组件内部内边距走 `--vm-padding-*`（按组件语义命名），组件之间用 `--vm-space-*`；不要写死宽度/高度
  （Figma 里明确的固定尺寸除外，如输入框参考宽 320）。不要用 `!important`，不要用元素选择器影响宿主页面。

## ③ 组合优先（谁内嵌谁，直接查组件事实）

Figma 的「内嵌」列 = 代码里的组合关系。**组件 md 里已经内嵌了谁，代码里就用谁，不要重造那一层**。

| 场景 | 正确做法（事实出处） |
|---|---|
| Table 的行/单元格/状态 | `Table` 自带 `Empty` + `Skeleton`（`table.md` 内嵌 `Type=empty`、`Type=line, Size=md`×3）；行用 `TableRow`、单元格用 `TableCell`、行内标签用 `Tag`（`table.md` 代码用法） |
| Header 的右侧动作与搜索 | `Header` 的 Figma 实例是 `Button`（`Type=primary/secondary, Size=sm`）与 `Search`（`Size=md`）；代码里传 `Button` / `Search`，不要自己写按钮或输入框样式（`header.md`） |
| Dropdown 的选项 | 面板内容用 `MenuItem`；Figma 面板里就是 3 个 `MenuItem` 实例（`dropdown.md`）。面板是 `role="menu"`，直接子节点应当是 `MenuItem`，不要塞裸内容 |
| Modal 的底部动作 | Figma 底部是 `Button` 实例：取消 = `Type=secondary, Size=md`、确认 = `Type=primary, Size=md`、删除 = `Type=danger, Size=md`（`modal.md`「相关组件」）。**当前 `Modal.tsx` 还是手写的 `.vm-modal__action`，`modal.md` 已注明「等 Button 落地后替换」—— 新增/改动时用 `Button`，不要把第三套按钮样式再复制一遍** |
| List 的行 | `List`/`ListItem` 内嵌 `Avatar`（`Size=md`，40×40），传 `avatar={<Avatar size="md" … />}`；空态用 `Empty`、加载用 `Skeleton`（`list-item.md`） |
| 搜索无结果 / 列表为空 | 用 `Empty`（`type="search"` 区分「搜不到」，`type="empty"` 区分「还没有数据」），不要手写空状态 |
| 页面骨架 | `Container`（限宽 + 留白）里排 `Card` 栅格，纵向间距交给 `Stack` / `Grid` + `--vm-space-*`；`Modal` / `Drawer` 有自己宽度与遮罩，**不要**再用 `Container` 包裹（`container.md`） |

溢出/滚动的归属：**宿主负责滚动，行组件不管滚动**（`Sidebar` 负责滚动、分组标题与行间距，
`ListItem` / `MenuItem` 不写 `margin`、不带分隔线）。

## ④ 响应式

- **`Container` 是最大宽度档位，不是固定视口宽**：`narrow` / `default` / `wide` / `full` = 720 / 1200 / 1440 / 1560
  （`container.md` 与 `foundations.md` 第 7 节）。落地是 `max-width: <档位>; width: 100%`；
  窄视口下保留左右 `--vm-space-8`（32px）留白，**不要横向溢出**。
  这套 token 里没有断点变量、Figma 也没有响应式变体，**不要自己给 Container 加媒体查询改宽度或 padding**。
- **`Grid` 收敛**：`columns` 只决定 `repeat(n, minmax(0, 1fr))`，窄容器下由 `minmax(0, 1fr)` 自然收缩；
  内容撑不住时**减少列数**，不要靠写死列宽把内容挤出去。`Stack` 只在内容或产品断点要求时改 `direction`。
- **`Modal` / `Drawer` 必须留在视口内，长内容走内部滚动**：Modal 现在写了
  `max-width: calc(100vw - var(--vm-space-8))` 的窄屏兜底（`Modal.css`），
  正文过长时在 `--vm-modal__body` 一层做 `max-height` + `overflow: auto`（**当前实现还没有**，需要时补），
  不要把整个页面顶出滚动条；Drawer 同理（无事实文档，以 `components.md` 的 `Size` × `Side` 轴为准）。
- **表格横滚不丢列**：`Table` 容器宽 720 是固定参考宽：更窄时在**外层**包 `overflow-x: auto` 的元素，
  并给它 `role="region"` + `aria-label` + `tabindex="0"`，键盘用户才能横向滚动看到操作列（`table.md` 可访问性）。
  **绝不静默丢列**，也不要给表格写死高度（`table.md`「不要这样做」第 3 条）。
- **浮层重定位**：Tooltip / Popover / Dropdown / Toast 在视口边缘必须翻转或重定位，保证完整可见
  （通用要求；Tooltip 的四个 `placement` 是 Figma 真值，见 `tooltip.md`，
  但「贴边翻转」不在 Figma 变体里，属于实现层职责）。`Dropdown` 面板不要复制 Figma 的裁切 ——
  Figma 面板 180 宽、里面却是 208 宽的 `MenuItem` 实例，代码里让 `MenuItem` 收进容器（`max-width: 100%`），
  **不要写死 208 或加 `overflow: hidden` 让它被裁**（`dropdown.md`）。
- 图片/媒体：给固定比例与 `max-width: 100%`，不要用固定像素宽把卡片撑破。

## ⑤ 无障碍清单（底线见 foundations.md 第 8 节）

- **语义**：真实元素与角色；`Table` 根是展示用 `div`，真语义在内部 `<table>`，**不要再加 `role="table"`**；
  列名用 `<th scope="col">`，表格要有可访问名（优先 `<caption>`，其次 `aria-label`）。
- **键盘**：所有可交互元素可达；`Enter` / `Space` / 方向键 / `Esc` 符合平台惯例；
  `Esc` 关闭浮层并**把焦点还给触发元素**；Modal / Drawer 打开期间焦点不逃出（`<dialog>` + `showModal()` 的原生行为）。
- **焦点可见**：`--vm-border-selected` 描边 / ring + `--vm-focus-ring-width`（2px），**不要 `outline: none` 了事**；
  同一表单家族（Input / Textarea / Search / Select）的 focus 视觉必须一致。
- **图标**：图标按钮必须有可访问名称（`aria-label` 或可见文字）；图标本身 `aria-hidden="true"`；不要用 emoji 当图标。
- **表单**：持久 label；错误用 `aria-invalid` + **文本说明**，不要只靠红框；`error` 的 ring 用 `--vm-status-error`；
  label 与控件的 `id`/`htmlFor` 正确关联。
- **状态播报**：加载用 `aria-busy="true"` + `aria-live="polite"`，骨架块自身 `aria-hidden="true"`；
  加载完成移除 `aria-busy`，避免读屏一直念「忙」；空态不要重复加 `aria-label` 让文案念两遍。
- **触控目标**：视觉可紧凑，可点区域不小于 40×40（时间紧时至少 32×32 且四周有留白）。
- **不只靠颜色**：选中/错误/成功要同时有图标或文案；`MenuItem` 的选中态用 `aria-current="true"` 表达；
  行的选中语义在 `TableRow`（`aria-selected`），Table 不重复声明。
- **对比度**：`--vm-text-secondary`（64%）可用正文；`--vm-text-tertiary`（30%）只给时间戳、辅助说明。

## ⑥ 评审方法

**尺子就是组件 md 的「各变体的事实」表**：每个变体的尺寸 / 填充栈 / 描边 / 圆角 / 内边距 / 不透明度 +
「设计 token」表 +「不要这样做」+ 生成段的 `⚠无cssVar` 标记。评审时逐条对照，**不要凭印象**。

流程：

1. **定位**：改动涉及哪些组件 → `references/components.md` 找 slug → 打开 `references/components/<slug>.md`。
2. **取事实**：读该组件「各变体的事实」与「设计 token」，把变体轴（= props）和每个状态的绑定变量抄下来当对照表。
3. **读代码**：组件实现与调用点（含 CSS）；只读事实段之外的自述章节时，注意它们可能与代码现状不同（见下表）。
4. **逐条比对**：props 轴、默认值、每个状态的视觉实现、token 名、组合关系、无障碍。
5. **写报告**：每条结论必须写成 **「组件名 + token 名（Figma 变量名 / CSS 变量名）+ 期望 / 实际」**，
   并给出出处（`references/components/<slug>.md` 的哪一节、或 `components/<Pascal>/<file>` 的哪一行）。
   拿不准的写「以 `references/components/<slug>.md` 为准」，**不要编**。

报告模板（一行一条）：

```
Button  hover 态：期望 底色 + White/White-7（--vm-white-7）叠加、底色不变（button.md「交互与状态」）
                 实际 Button.css:92 用 background-image 叠加 ✓
Modal   底部按钮：期望 Button（Type=secondary/primary/danger, Size=md）（modal.md「相关组件」）
                 实际 Modal.tsx:158-174 手写 .vm-modal__action ✗ → 与 modal.md 的「待替换」备注一致，属已知欠账
```

## ⑦ 验证清单

提交/评审前至少过一遍：

- [ ] `python3 tools/validate.py`（全量）或 `--slug <slug>`：0 error；warning 能清就清
      （`.github` CI 与 [AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) 第 8 节是检查项清单）。
- [ ] `grep -n "#\|rgb(\|hsl(" components/<Pascal>/*.css`：CSS 里没有字面量颜色。
- [ ] CSS 里每个 `var(--vm-*)` 都在 `components/tokens.css` 有定义（拼错的 token 会静默失效）。
- [ ] 没有手写 `font-size` / `font-family` / `line-height`；文字都挂了 `.vm-type-*` 或 `--vm-type-*-size`。
- [ ] 每个应用态都有对应视觉与原生属性：`disabled` → `opacity: var(--vm-opacity-disabled)`；
      `error` → `aria-invalid` + 文本；`open` → 原生 `open` / `aria-expanded`。
- [ ] 交互态**没有**变成 prop；受控/非受控成对存在；`forwardRef` + `...rest` + `className` 合并可用。
- [ ] 有位移/缩放的动画带 `prefers-reduced-motion` 兜底。
- [ ] 默认值与 Figma `defaultVariant` 一致（对 `data/components-index.json` 的 `default` 字段）。
- [ ] 组合关系用的是 `components/` 里已有的子组件，没有复制第二套样式。
- [ ] 窄视口 / 长内容 / 空内容 / 超长文案各跑一遍；键盘走一遍 Tab / Enter / Esc。
- [ ] 代码示例与真实实现一致（同一组 props、同一 import 路径）—— 文档里的示例也算交付物。

## ⑧ 不要这样做

**API**

1. 不要把 `State` / `hover` / `pressed` / `focus` 做成 prop（唯一例外是组件 md 里明确记为**应用态**的值：
   `disabled` / `error` / `open` / `checked` / `selected` / `empty` / `loading` / `dragover`）。
2. 不要发明 Figma 里没有的 props、状态或变体（给 Input 加 `multiline`、给 Table 加 `selected`、给 Modal 加 `state`…）。
3. 不要把默认值写成「看起来更合理」的那个（Container 默认必须 `narrow`=720，Figma 没给 1200 做默认）。
4. 不要把数值语义的 prop 限制成 Figma 的样本值（Progress 收 0–100 真实百分比，不是只能 25/50/75/100）。
5. 不要用 `div` 假按钮、假输入框、假表格；不要让 `ref` 落在无交互的外层容器上。

**样式**

6. 不要硬编码颜色 / 圆角 / 间距 / 字号 / 阴影；不要引历史遗留变量（`Color`、`主色/Main Orange`、
   `后台主色`、`Text/灰/*` 等，见 [tokens.md](tokens.md) 末尾），也不要引 `⚠无cssVar` 的绑定。
7. 不要为了「更好看」引入橙色系或第二套品牌色；不要自己发明浅色主题（只有深色一套）。
8. 不要照抄旧版胶囊按钮（999 圆角、蓝底、MiSans）；本库按钮圆角 12px、字体 Poppins（中文回退 PingFang SC）。
9. 不要把两种 hover 手法互换（给 Button 换描边、给 Input 加白色叠加层），也不要给 Card 套 Button 的叠加。
10. 不要用「换一套灰色」实现 disabled；只用 `opacity: var(--vm-opacity-disabled)`。
11. 不要手写 `font-size` / `line-height`，也不要给三档「名不副实」的文字样式（见 [tokens.md](tokens.md) 警告表）想当然。
12. 不要用 `!important`、不要用元素选择器污染宿主页面、不要在组件内部写死 16px 之类的内边距。

**组合**

13. 不要重造内嵌组件：Table 里的 `Empty` / `Skeleton` / `Tag`、Header 里的 `Button` / `Search`、
    Dropdown 里的 `MenuItem`、Modal 底部的 `Button`、List 里的 `Avatar` —— 全部用现成组件。
14. 不要给子组件加它不该管的职责（滚动、外边距、分隔线归宿主，见「③ 组合优先」）。
15. 不要在 `Modal` / `Drawer` 外面再套 `Container`（会多出一层 32px 留白）。

**响应式与无障碍**

16. 不要给 `Container` 加媒体查询改宽度/padding，也不要把 `full` 当成 `width: 100vw`（它是 1560 上限 + `width: 100%`）。
17. 不要为了适配窄屏静默丢表格列、写死表格高度、或让 Modal / Drawer 溢出视口（长内容走内部滚动）。
18. 不要让浮层贴边被裁；不要 `outline: none`；不要让焦点逃出 Modal / Drawer 或关闭后不归还焦点。
19. 不要只用颜色传达状态；不要用 emoji 当图标；图标按钮不要没有可访问名称。
20. 不要复制 Figma 的演示层与裁切（Container 的示例框、Dropdown 面板裁掉 208 宽 `MenuItem`）——
   它们是标注，不是视觉规范。
