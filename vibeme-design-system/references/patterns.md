# 页面级组合模式

本文件回答「页面怎么搭」：把哪些组件按什么顺序套起来、用哪些 token、四种状态（空 / 加载 / 错误 / 禁用）由谁承担。
**事实来源只有两处**：`references/components/<slug>.md`（逐组件事实，GEN 段由 Figma 导出生成）与
`references/tokens.md`（token 全量真源）。本文件是**人写的组合建议**，不是 Figma 里的新组件。

## 0. 通用前提（先读，违反就是错）

1. **库内没有页面模板组件集**。48 个组件集（[components.md](components.md)）里**没有** AppShell / Layout / Page / Form / FormItem / Menu / Toast Container
   这一类页面级模板；下面的模式全部是从各组件文档的「相关组件」「代码用法」段落归纳出来的**组合约定**，
   不是 Figma 里已有的 frame。**不要为了套模式而创造出设计里没有的组件。**
2. **token 只从 [tokens.md](tokens.md) / [components/tokens.css](../components/tokens.css) 取**，颜色 / 圆角 / 间距 / 阴影一律 `var(--vm-*)`；
   本文件里出现的每个变量都可在 tokens.md 找到，不要引用 tokens.md 末尾的「历史遗留变量」。
3. **同一体系里有三种 hover 手法，跨组件不能互套**（本条是全库最容易犯的错，逐组件以它自己的 md 为准）：
   - **填充叠加**：hover 在底色上加 `--vm-white-7`、pressed 加 `--vm-white-6` —— Button 一族；
   - **描边换色**：底色不动，hover 把描边从 `--vm-border-default` 换成 `--vm-white-4` —— Input / Select / Search / Dropdown 一族；
   - **实色替换**：hover 直接把整块底色换成 `--vm-surface-hover`（#262626）—— Card / MenuItem / ListItem / TableRow 一族。
4. **交互态不做 prop**：`hover` / `pressed` / `focus` 用 CSS 伪类；`disabled` / `error` / `open` / `checked` / `selected` 才是 prop
   （见 [foundations.md](foundations.md) §1 与 [tools/AUTHORING-CONVENTIONS.md](../../tools/AUTHORING-CONVENTIONS.md) §3）。
5. **禁用只有一种处理**：`opacity: var(--vm-opacity-disabled)`（0.38）+ `cursor: not-allowed`，
   底色、描边、文字色一个都不换（全库一致，不要另造灰色）。
6. **写作时状态**：`references/components/` 下有 **44 / 48** 份组件文档 —— `drawer.md`、`toast.md`、`tooltip.md`、`popover.md`
   在本文件写作时尚未生成。凡涉及这四者，本文件只写 `components-index.json` 能确证的字段，其余标注「以 `references/components/<slug>.md` 为准」。
7. 每个模式的「事实依据」列出主要来源；**列到的文档之间若有冲突，以该组件自己的 `references/components/<slug>.md` 为准**。

---

## 1. 应用外壳（Sidebar + Header + Container + Footer）

**适用场景**：有全局导航的多页应用 —— 左侧主导航 + 顶部栏 + 限宽主内容 + 页脚。这是**页面层拼装**，Figma 里没有对应的外壳组件集。

**结构**（自外向内）

```
Grid / Stack                       ← 两栏：侧栏 ｜ (Header + main + Footer)
├─ Sidebar（<nav aria-label="主导航">）
│   └─ SidebarItem × n             ← 图标 16×16 + 一行文字；selected / disabled
└─ 主列
    ├─ Header（<header>，一页只一个）
    │   ├─ brand 槽（默认文本 VibeMe）/ 中间 children / actions 槽（Button、Search）
    └─ <main> → Container → Grid / Stack → 内容组件（Card / Table …）
    └─ Footer（<footer>，type="simple" | "columns"）
```

- 两栏骨架用 `Grid` / `Stack` 承载：「页面级布局用它们承载 Sidebar（侧栏 ＋ 主内容），Sidebar 自己不写栅格也不吸顶」（[sidebar.md](components/sidebar.md) 相关组件）。
- 内容限宽用 `Container`：「Header 只占一条 64 高的横条，下面的内容用 `Container` 限宽、用 `Grid` / `Stack` 排版，不要把页面留白塞进 Header 的左右内边距（那 32px 是 `space/space-8`）」（[header.md](components/header.md) 相关组件）。
- Footer 是满宽布局，「不提供最大宽度限制；居中收窄请在组合层用 `Container` 包一层」（[footer.md](components/footer.md) 相关组件）。
- Header 与 Footer 的容器事实不同：Header 只有**底边** 1px、底色 `--vm-bg-app`；Footer 只有**顶边** 1px、底色 `--vm-bg-panel`；
  「三者的描边方向按各自 Figma 事实，不要互相复制（Header 是底边、Footer 是顶边）」（[footer.md](components/footer.md) 相关组件）。

**用哪些 token**

| 部位 | token |
|---|---|
| 顶栏底 / 页面底 | `--vm-bg-app`（#0E0E0E） |
| 侧栏底 / 页脚底 | `--vm-bg-panel`（#1A1A1A） |
| 卡片与面板内容 | `--vm-bg-card`（#202020） |
| 三条横线（Header 底、Sidebar 描边、Footer 顶） | `--vm-border-default` + `--vm-border-width-thin` |
| 侧栏容器圆角 / 侧栏行圆角 | `--vm-radius-card`（12）/ `--vm-radius-sm`（6） |
| 侧栏选中行 | `--vm-surface-selected`；未选中行文字与图标 `--vm-text-secondary`，选中升到 `--vm-brand` |
| Container 留白 | `--vm-space-6`（上下 24）+ `--vm-space-8`（左右 32） |
| 文字 | `--vm-text-primary`（品牌名）/ `--vm-text-secondary`（导航、页脚链接）/ `--vm-text-tertiary`（版权行） |

**状态**

- **外壳自身没有状态**：Header、Footer、Container、Stack、Grid 都**没有 `State` 轴**，`fills` / `strokes` 在所有变体里完全相同
  （[header.md](components/header.md) / [footer.md](components/footer.md) / [container.md](components/container.md) / [stack.md](components/stack.md) / [grid.md](components/grid.md) 均明确写出）。
- **Sidebar** 只有展开 / 折叠两档**布局**（`State=expanded|collapsed`，代码里是布尔 `collapsed`），plus 行级的 selected / disabled；
  骨架态没有 loading / error 变体。
- **空 / 加载 / 错误**全部由 `main` 里的内容组件承担：表格页交给 `Table state="empty"|"loading"`（[table.md](components/table.md)），
  列表页交给 `Empty` / `Skeleton`（见模式 6），失败提示用 `Notification layout="card"`（[notification.md](components/notification.md)）。
- **禁用**：`SidebarItem disabled`、Header `actions` 里的 `Button disabled`，一律只降 `--vm-opacity-disabled`。

**与 Figma 的对应**：`Sidebar` = node `56064:6840`（`State=expanded|collapsed`，240 / 64）；`Header` = `56066:6374`（`Type=simple|with-nav|with-search`，1200×64）；`Container` = `56066:6255`（`Type=narrow|default|wide|full` = 720/1200/1440/1560）；`Footer` = `56066:6407`（`Type=simple|columns`，1200×105 / 252）。属性轴 = props，值小写当枚举。

**易错点**

1. **不要给 Header / Footer / Container 加 hover / focus 描边或底色变化**。它们没有 `State` 变体；
   `hover → --vm-white-4`、`focus → --vm-border-selected` 是 Input / Search / Select / Tabs 一族的描边手法（[header.md](components/header.md) 不要这样做 #1）。
2. **不要写死 `width: 1200px`**。1200 只是 Figma 画板的 FIXED 参考宽；顶栏 / 页脚宽度必须跟随视口（[header.md](components/header.md) #4）。
3. **不要把 Footer 塞进 `Container` 里当满宽背景**，也不要在 `Container` 内用整宽 `Divider` —— 左右各 32px 的内边距会把它「切进来」，
   通栏分割线要放在 `Container` 外面（[container.md](components/container.md) 相关组件）。
4. **不要把 `Container type="full"` 理解成 `width: 100%`**：1560 是上限，正确做法是 `max-width: 1560px; width: 100%`（[container.md](components/container.md) #3）。
5. **侧栏折叠态的文字必须 `display: none` 并给图标行补 `aria-label`**，否则折叠后整条导航没有可访问名（[sidebar.md](components/sidebar.md) #5）。
6. **一页只应有一个顶层 `<header>`（banner）与一个 `<footer>`（contentinfo）**，多导航区时用各自的 `aria-label` 区分
   （[header.md](components/header.md) 可访问性 / [footer.md](components/footer.md) 可访问性）。
7. **不要给 Sidebar 写死高度**：组件只给 `min-height: 320px`，撑满视口交给外层 Grid / Stack（[sidebar.md](components/sidebar.md) #7）。

**事实依据**：[sidebar.md](components/sidebar.md)、[header.md](components/header.md)、[container.md](components/container.md)、[footer.md](components/footer.md)、[grid.md](components/grid.md)、[stack.md](components/stack.md)、[tokens.md](tokens.md) 的栅格样式一节。

---

## 2. 表单页（Container + Stack + Input / Select / Checkbox / Radio / Switch + Button）

**适用场景**：单列表单页（登录 / 注册 / 创建项目 / 设置表单）。**库内没有 `Form` / `FormItem` 组件集**，表单结构与错误汇总需要页面层自己组合。

**结构**

```
Container（type="narrow" 720 或 "default" 1200）
└─ Stack（direction="vertical" gap="lg"）        ← 纵向排字段
    ├─ 字段 1：<label>（持久可见）→ Input（size="md"）→ 错误说明由 errorMessage 渲染
    ├─ 字段 2：<label> → Textarea（多行用独立组件，不要用 Input multiline 代替）
    ├─ 字段 3：<label> → Select（<option value=""> 表达「未选」）
    ├─ 分组 4：<fieldset><legend> → Radio × n（同组同一个 name）
    ├─ 分组 5：Checkbox × n（可多选，同一 name 提交；半选用 checked="indeterminate"）
    ├─ 设置项：<label htmlFor> + Switch（立即生效，不参与表单提交）
    └─ 操作区：Stack direction="horizontal" gap="md" role="group" aria-label="表单操作"
              ├─ Button type="secondary"（取消）
              └─ Button type="primary" htmlType="submit"（提交，可 disabled）
```

- 「表单底部操作区」正是 `Stack direction="horizontal" gap="md"` 的官方用法示例（[stack.md](components/stack.md) 代码用法）。
- 原生 submit 用 `htmlType`，因为 `type` 已被 Figma 的 `Type` 变体占用（[button.md](components/button.md) 代码用法）。
- 控件分工以各自文档为准：多行输入「优先用 `Textarea`」（[input.md](components/input.md) 相关组件）；`Select` 是表单取值，
  `Dropdown` 是导航菜单语义，别混（[dropdown.md](components/dropdown.md) 相关组件）；`Switch` 是**立即生效**的单一开关，
  多选场景不要拿它代替 `Checkbox`（[switch.md](components/switch.md) 相关组件）。

**用哪些 token**

`--vm-radius-input`（12）、`--vm-padding-input-x`（16）、`--vm-bg-card`（控件底）、`--vm-border-default` → `--vm-white-4`（hover 描边）、
`--vm-border-selected` + `--vm-focus-ring-width`（focus 的 2px 描边与 ring）、`--vm-status-error`（error 描边）、
`--vm-text-secondary`（label 与 placeholder）、`--vm-text-primary`（已输入值）、`--vm-space-2` / `--vm-space-3` / `--vm-space-4` / `--vm-space-6`（字段与行距）、
`--vm-brand`（primary Button 底）+ `--vm-neutral-950`（其文字）、`--vm-opacity-disabled`（禁用）、`--vm-radius-button`（12）。
Checkbox / Radio / Switch 另用 `--vm-white-4`（未选中描边）、`--vm-brand`、`--vm-radius-xs`（4）/ `--vm-radius-full`（999）、`--vm-neutral-550` / `--vm-neutral-950` / `--vm-white-0`（Switch 轨道与拇指）。

**状态**

- **错误**：只有 `Input` / `Textarea` / `Select` / `Upload` 有 `State=error`（描边换 `--vm-status-error`、线宽 2px），
  代码里是 `error` prop；`errorMessage` 会渲染 `role="alert"` 并用 `aria-describedby` 自动挂到控件上（[input.md](components/input.md)、[select.md](components/select.md) 可访问性）。
  **`Radio` 没有 error 变体**：「不要给 Radio 加 `error` prop 或红色描边」（[radio.md](components/radio.md) 不要这样做 #1）；`Checkbox` / `Switch` 的 `State` 也只有 `default` / `disabled`。
- **错误汇总**：库内**没有** Form / FormItem，汇总只能页面层自建，但必须遵守一条硬约束 ——
  「`errorMessage` 已经渲染了 `role="alert"` 的说明；表单层如果也有错误文本，**二者只能出现一个**」（[input.md](components/input.md) 不要这样做 #7）。
  即：要么逐字段就地报错，要么只在汇总处播报，不要同一句播两遍。
- **禁用提交**：`Button` 用原生 `disabled`（`opacity: var(--vm-opacity-disabled)`，**不换灰色**）；提交中把 `Loading size="sm"` 放在按钮文字前，
  并给按钮自身加原生 `disabled`（[loading.md](components/loading.md) 相关组件）。
- **禁用控件**：`Input` / `Select` / `Checkbox` / `Radio` / `Switch` 一律由原生 `disabled` 触发，只加 0.38 不透明度，描边 / 底色 / 文字色都不换。
- **空**：表单没有空状态；未选值用 `Select` 里 `value=""` 的空 `<option>` 表达（[select.md](components/select.md) 不要这样做 #2）。

**与 Figma 的对应**：`Input` = `56058:5648`（`Size`×`State=default|hover|focus|error|disabled`）；`Textarea` = `56059:6287`；`Select` = `56059:6318`（含 `State=open`，内嵌 `chevron-down_filled`）；
`Checkbox` = `56059:6442`（`Checked=false|true|indeterminate`）；`Radio` = `56059:6471`（`Selected`，原生 `name` 分组）；`Switch` = `56059:6488`；
`Button` = `56058:5617`（`Type`×`Size`×`State`）。`error` / `disabled` / `open` / `checked` / `selected` 是 prop，`hover` / `focus` 是伪类。

**易错点**

1. **不要把 `State` 做成 `state="error"` 这种字符串 prop**：`hover` / `focus` 归伪类，`error` / `disabled` 才是布尔 prop，并优先落到 `aria-invalid` / 原生 `disabled`。
2. **并排控件用同一档 `size`**：`Input` / `Select` 同宽同高（sm/md/lg = 32/40/48），不同档会基线不齐（[input.md](components/input.md) 相关组件）；
   `Switch` 不要被拉伸去凑 Input 的高度，「同一行对齐时以 Switch 的 24 高度为中心线」（[switch.md](components/switch.md) 相关组件）。
3. **不要用 `Input` + 装饰拼 `Search` / `Upload` / `Textarea`**：它们在 Figma 里各自是独立组件集，页面层直接用那些组件（[input.md](components/input.md) #6）。
4. **`Radio` 的分组**：`role="radiogroup"` + `aria-label` 时，确保 radios 就是它的直接子元素；更推荐 `<fieldset><legend>`（[radio.md](components/radio.md) 可访问性）。
5. **`Checkbox` 半选设 DOM 属性 `indeterminate`**，不要手写 `aria-checked="mixed"`（[checkbox.md](components/checkbox.md) 可访问性）。
6. **不要手写字号 / 行高 / 颜色**：label、值、错误说明都走 `.vm-type-*` 与 `var(--vm-*)`；各控件用哪一档文字样式以它自己的 `references/components/<slug>.md` 为准。
7. **不要给 `Switch` 塞 `children` 当标签**：Figma 的 Switch 没有文字层，标签写在外面用 `htmlFor` / `id` 关联（[switch.md](components/switch.md) #3）。

**事实依据**：[input.md](components/input.md)、[select.md](components/select.md)、[checkbox.md](components/checkbox.md)、[radio.md](components/radio.md)、[switch.md](components/switch.md)、[button.md](components/button.md)、[stack.md](components/stack.md)、[container.md](components/container.md)、[loading.md](components/loading.md)、[foundations.md](foundations.md) §8（表单无障碍）。

---

## 3. 列表 / 表格页（Table + TableRow + TableCell + Tag + Pagination）

**适用场景**：列固定的数据表格页（多行多列、需要状态列与操作列）。真正的表格语义必须用 `Table` 一族，不要用 `Grid` 拼（[grid.md](components/grid.md) #6）。

**结构**

```
Container type="wide" / "full"          ← 宽内容不要挤在 720 里
└─ Stack gap="lg"
    ├─ Table（state="default" | "empty" | "loading"）
    │   ├─ <colgroup>                    ← 列宽由调用方给，不要写进组件
    │   ├─ <thead> → TableRow type="header" → <th scope="col"> × n
    │   └─ <tbody> → TableRow type="body"
    │        └─ TableCell type="text|number|status|action"
    │             ├─ Tag（类型 / 状态列）
    │             └─ Button type="ghost" size="sm"（操作列）
    └─ Pagination（放在 Table 之外，间距 --vm-space-4）
```

- 表格上方/下方留白用 `--vm-space-4`；`Pagination` 明确「放在 Table **之外**（Figma 的 Table 组件不含分页）」（[table.md](components/table.md) 相关组件）。
- 「`Table` 负责容器底色/描边/圆角/裁切，Row 负责行底色与分隔线，`TableCell` 管内边距与文字色」（[table.md](components/table.md) 相关组件）。
- 列表页（非表格）用 `ListItem`：行高 74、内嵌 `Avatar`，「列表为空时用 `Empty` 占住内容区，并用 `type="search"` / `type="empty"` 区分」
  （[list-item.md](components/list-item.md) 相关组件）。

**用哪些 token**

`--vm-bg-card`（Table 容器）、`--vm-bg-panel`（表头行）、`--vm-border-default`（容器描边与行分隔线）、`--vm-radius-card`（12）、
`--vm-surface-hover` / `--vm-surface-selected`（行 hover / 选中）、`--vm-text-primary` / `--vm-text-secondary`（表头）/ `--vm-text-tertiary`（序号列）、
`--vm-status-success`（`TableCell type="status"` 的实测色）、`--vm-text-action`（操作列）、`--vm-white-7`（Skeleton 骨架）、
`--vm-space-3` + `--vm-space-4`（单元格内边距）、`--vm-brand` + `--vm-neutral-950`（Pagination 当前页）、`--vm-radius-md`（Pagination 箭头格 8px）、
`--vm-radius-badge`（Tag 4px）、`--vm-opacity-disabled`（边界禁用）。

**状态**

- **空**：`Table state="empty"` —— **表头保留**，下方换成内嵌的 `Empty`（`Type=empty`：folder-line 48×48 + 标题 + 说明），可用 `emptyContent` 换自定义内容。
- **加载**：`Table state="loading"` —— 表头保留，下方每行一个 `Skeleton type="line" size="md"`（200×12，`--vm-white-7`），
  行数用 `loadingRows`；容器 `aria-busy="true"` + 视觉隐藏的「内容加载中」，加载完成直接卸载骨架（不要只靠 CSS 隐藏）。
- **错误**：`Table` **没有 error 变体**。表内用 `Empty type="error"`，表外用 `Notification layout="card"`，
  「二者不要同时出现同一句文案」（[notification.md](components/notification.md) 相关组件）。
- **禁用**：`TableRow` / `TableCell` / `Table` 都没有 disabled 变体；真禁用要禁用行内的 `Button`，或整表交给 `Table` 的 `state`
  （[table-row.md](components/table-row.md) #7 / [table-cell.md](components/table-cell.md) #5）。
- 分页边界：首页 / 末页的箭头用原生 `disabled`，只降 `--vm-opacity-disabled`，不换灰色（[pagination.md](components/pagination.md)）。

**与 Figma 的对应**：`Table` = `56065:6970`（`State=default|empty|loading`，内嵌 `Tag`×3、`Empty`×1、`Skeleton`×3）；
`TableRow` = `56065:6886`（`Type=header|body` × `State=default|hover|selected`）；`TableCell` = `56065:6816`（`Type=text|number|status|action`）；
`Tag` = `56061:6404`（`Tone`×`Size`×`Style`）；`Pagination` = `56064:6707`（`Size`×`Type`，当前页是**品牌色填充**）。

**易错点**

1. **列宽 60/240/160/140/120 不要写进组件**：那是 Figma 示意表的列宽，用 `<colgroup>` + 调用方控制（[table.md](components/table.md) #6 / [table-row.md](components/table-row.md) #3）。
2. **不要给 `Table` 加 hover / selected**：悬停与选中是**行**的事；也不要给 `TableCell` 加 hover，它没有 `State` 轴（[table-cell.md](components/table-cell.md) #1）。
3. **行的 hover / 选中是实色替换**：`--vm-surface-hover` / `--vm-surface-selected`，**不要**叠 `--vm-white-7`（[table-row.md](components/table-row.md) #2）。
   ⚠️ [table-cell.md](components/table-cell.md) 的「交互与状态」段把行 hover 描述成 `--vm-white-7` / `--vm-white-4` 叠加，与 table-row.md 冲突 —— **以 [table-row.md](components/table-row.md) 为准**。
4. **空态 / 加载态不要用 `TableRow` 拼假行**：Figma 这两个变体的内容就是内嵌的 `Empty` / `Skeleton`（[table.md](components/table.md) #2）。
5. **表头与表体之间不要用 `Divider`**：「Table 有自己的描边与分隔规则，混用会出现双线」（[divider.md](components/divider.md) 相关组件）。
6. **窄屏不要静默丢列**：在外层包 `overflow-x: auto` 的元素并给它 `role="region"` + `aria-label` + `tabindex="0"`（[table.md](components/table.md) 可访问性、[foundations.md](foundations.md) §7）。
7. **Tag 只放 1–4 个字**，它不可点、没有 hover；需要可点的「标签」用 `MenuItem` 或 `Button`（[tag.md](components/tag.md) 不要这样做 #1 / #7）。

**事实依据**：[table.md](components/table.md)、[table-row.md](components/table-row.md)、[table-cell.md](components/table-cell.md)、[tag.md](components/tag.md)、[pagination.md](components/pagination.md)、[empty.md](components/empty.md)、[skeleton.md](components/skeleton.md)、[list-item.md](components/list-item.md)。

---

## 4. 详情 / 描述页（Descriptions + Statistic + Card + Divider + Breadcrumb）

**适用场景**：详情页 / 概览页 —— 顶部路径 + 指标摘要 + 键值明细 + 分块标题与分割线。

**结构**

```
Container type="narrow"（720，与 Descriptions 的 FIXED 720 对齐）
└─ Stack gap="lg"
    ├─ Breadcrumb（<nav aria-label="当前位置">，页头一行 20 高）
    ├─ 页面标题（真实 <h1>，用 .vm-type-* 文字样式；库内没有标题组件集）
    ├─ Divider（需要时才加；不要给 Breadcrumb 自己加 border-bottom）
    ├─ Grid / Stack：一排 Statistic（指标之间 --vm-space-6）
    ├─ Grid columns={2|3}：Card（Type=plain | media | selected）
    └─ Descriptions（layout="horizontal"|"vertical"，columns=2|3；值里可嵌 Tag / Badge / 真实链接）
```

- `Descriptions` 是 FIXED 720，正好等于 `Container type="narrow"`：「页面上用 `narrow` 包住它就不用手写任何宽度」（[container.md](components/container.md) 相关组件）。
- `Statistic` 一排用 `Container type="default"` / `wide`，指标之间用 `--vm-space-6` 排开（[container.md](components/container.md) 相关组件）。
- 页面里常见「上面一行 `Statistic` 摘要、下面 `Descriptions` 列明细」（[statistic.md](components/statistic.md) 相关组件）。
- 面包屑与页面标题之间若需要分隔线，**用 `Divider` 组件**，不要给 Breadcrumb 加 `border-bottom`（[breadcrumb.md](components/breadcrumb.md) 相关组件）。

**用哪些 token**

`--vm-bg-card`（Card 与 Descriptions 的同一套壳）、`--vm-border-default` + `--vm-border-width-thin`（壳描边与 Divider 的唯一颜色）、
`--vm-radius-card`（12）、`--vm-padding-card-md`（20，Descriptions 四边）、`--vm-radius-md`（8，Card 的 media 框与 Divider 无关，别混用）、
`--vm-elevation-1`（Card）、`--vm-text-primary`（当前面包屑、Descriptions 值、标题）/ `--vm-text-secondary`（面包屑祖先层、Descriptions label、Statistic label）/ `--vm-text-tertiary`（面包屑分隔符 `/`）、
`--vm-status-success` / `--vm-status-error`（Statistic 的 up / down）、`--vm-space-1`（Statistic 行内 gap 4）/ `--vm-space-3`（Descriptions horizontal 的 label-value 间距）/ `--vm-space-6`（Descriptions 列间距）/ `--vm-space-4`（Descriptions 行间距）、
`--vm-brand` + `--vm-focus-ring-width`（Card `type="selected"` 的 2px 描边，注意它的变量是 `focus/ring-width` 而不是 `border/width/thick`）。

**状态**

- **这五件都没有状态轴**：`Breadcrumb`（只有 `Type`）、`Descriptions`（`Layout`×`Columns`）、`Statistic`（只有 `Type`）、`Divider`（`Orientation`×`Style`）
  都没有 `State`；`Card` 只有 `State=default|hover`，且 `hover` 是伪类。
- **加载**：数字未到位用 `Skeleton` 顶住数值行的高度（`Heading/XXL` 24/36），
  「不要显示 `--` 或 `0` 假装有数据」（[statistic.md](components/statistic.md) 相关组件）；整块明细用行内 `Skeleton` 替位。
- **空 / 错误**：`Descriptions` / `Statistic` 没有空态变体；区块级失败用 `Notification layout="card"` 或 `Empty type="error"`（[notification.md](components/notification.md) / [empty.md](components/empty.md)）。
- **禁用**：这五件都没有 disabled；「需要『不可用』的卡片就在业务层降低交互层级（去掉链接/按钮），不要凭空加 `--vm-opacity-disabled`」（[card.md](components/card.md) #6）。
- `Card type="selected"` 是**视觉态**，读屏不会因此知道卡片被选中：语义要落到卡内真实 `Radio` / `Checkbox` 或 `aria-selected`（[card.md](components/card.md) 可访问性）。

**与 Figma 的对应**：`Descriptions` = `56065:7035`（4 变体壳完全一致）、`Statistic` = `56065:7053`（77×58 / `up`/`down` 77×80，内嵌 `chevron-up_filled` / `chevron-down_filled`）、
`Card` = `56061:6466`（`Type=plain|media|selected` × `State`，`Elevation/1`）、`Divider` = `56061:6471`（solid 是 1px **填充**，dashed 是 1px 描边 + `dashPattern [4,4]`）、
`Breadcrumb` = `56064:6664`（`Type=3levels|collapsed`；折叠态的省略号只有传了 `onExpand` 才升级成 `<button>`）。

**易错点**

1. **`Divider` 的 `style` prop 被 Figma 的 `Style` 占用**，不能传内联样式；间距用 `className` + token（[divider.md](components/divider.md) #6）。`Tag` 同理（[tag.md](components/tag.md)）。
2. **不要用 `border-top` / `border-style: dashed` 复刻 Divider**：solid 是填充、dashed 是 4/4 的 `repeating-linear-gradient`（[divider.md](components/divider.md) #1 / #2）。
3. **Card 的 hover 是第三种手法**：底色换 `--vm-surface-hover` **同时**描边换 `--vm-white-4`，既不是叠白也不是只换描边（[card.md](components/card.md) #1）。
4. **不要在 `Descriptions` 内部用分割线**：单元间距是 `--vm-space-4` 空白，不是 `Divider`（[descriptions.md](components/descriptions.md) #5）。
5. **面包屑最后一项必须不可点**：渲染成 `<span aria-current="page">`，且不要用品牌色 `--vm-text-action`（[breadcrumb.md](components/breadcrumb.md) #3 / #4）。
6. **不要给 `Statistic` 的数字套 `<h1>`–`<h6>`**，也不要用颜色反推涨跌 `type`（[statistic.md](components/statistic.md) 可访问性 / #2）。
7. **`Columns` 是数值不是枚举**：`Descriptions` 与 `Grid` 都接真实数值并做钳制，别照抄 Figma 的 2/3（[descriptions.md](components/descriptions.md) #2、[grid.md](components/grid.md) #2）。

**事实依据**：[descriptions.md](components/descriptions.md)、[statistic.md](components/statistic.md)、[card.md](components/card.md)、[divider.md](components/divider.md)、[breadcrumb.md](components/breadcrumb.md)、[container.md](components/container.md)、[grid.md](components/grid.md)。

---

## 5. 反馈与确认（Modal / Drawer + Button、Toast / Notification）

**适用场景**：需要用户**先决策**（二次确认、危险操作、表单弹窗）用 `Modal`；侧滑面板用 `Drawer`；瞬时轻提示用 `Toast`；
留在页面流里直到用户处理的通知条 / 通知卡用 `Notification`。四者**不要互相套参数**。

**结构**

```
触发点：Button（危险操作才用 type="danger"）
├─ Modal（open 受控 + onClose / onConfirm，真 <dialog> + showModal()）
│   ├─ 标题（<h2>，由 aria-labelledby 关联）/ 右上 × (closeLabel 默认「关闭」)
│   ├─ 正文：children（可放 Input / Select 等表单控件）
│   └─ 底部动作（Figma 里是三个 Size=md 的 Button 实例）：
│       取消 = secondary ｜ 确认 = primary（Type=basic）/ danger（Type=confirm）｜ 删除 = danger
└─ 成功 / 失败反馈：
    ├─ Toast（浮层、自动消失）—— 见下方「以 toast.md 为准」
    └─ Notification（嵌在页面流：banner 480 宽 / card 320 宽）
```

- `Modal` 的 `Type` **不等于按钮层级语义**：`Type=confirm` 的主按钮在 Figma 里是 `Type=danger, Size=md` 实例，底色是 `--vm-status-error` 而不是 `--vm-brand`（[modal.md](components/modal.md) 交互与状态）。
- `Button` 的 `danger`「只表达视觉警示，不替调用方做二次确认」：真正删除前请在业务层加确认弹窗（`Modal`）（[button.md](components/button.md) 可访问性）。
- **`Drawer`**：以 `references/components/drawer.md` 为准（**本文件写作时该文档尚未生成**）。
  `components-index.json` 能确证的是：node `56063:6563`、`Size=sm|md|lg` × `Side=right|left`、默认变体 `Size=sm, Side=right`、"靠外一侧保留圆角，Elevation/4"；
  [modal.md](components/modal.md) 也写明 Drawer 是 `Elevation/4` + 单侧圆角、有遮罩，并与 Modal 在同一流程里二选一。
- **`Toast`**：以 `references/components/toast.md` 为准（**本文件写作时该文档尚未生成**）。
  `components-index.json` 能确证的是：node `56063:6596`、`Type=info|success|warning|error`、360×68、"轻提示，Elevation/3"；
  [notification.md](components/notification.md) 相关组件补充：Toast 是**浮在页面之上**、带 `--vm-padding-toast-x/y` 与 `--vm-radius-toast`、可 3 秒自动消失的短时提示；
  [loading.md](components/loading.md) 可访问性也说加载失败请用 `Toast` 或 `Notification` 播报。
- `Notification` 的 **card 变体没有关闭按钮**（Figma card 只有「icon + 一个 TEXT」），即使传了 `onClose` 也不渲染（[notification.md](components/notification.md) 交互与状态）。

**用哪些 token**

`--vm-scrim-modal`（Modal 遮罩，唯一来源，不要手写 `rgba(0,0,0,.56)`）、`--vm-bg-panel`（Modal 面板 / Notification banner 底）、
`--vm-radius-card`（12，Modal 面板与 Notification 圆角）、`--vm-padding-modal-x` / `--vm-padding-modal-y`（24 / 20）、`--vm-modal-sm` / `--vm-modal-md` / `--vm-modal-lg`（400 / 520 / 720）、
`--vm-elevation-2`（Notification card）、`--vm-elevation-3`（Toast、Dropdown 面板）、`--vm-elevation-4`（Modal / Drawer，见 [foundations.md](foundations.md) §6）、
`--vm-bg-card`（secondary Button 与 Notification card 底）、`--vm-status-info` / `--vm-status-success` / `--vm-status-warning` / `--vm-status-error`（Notification 四色，banner 用 `--vm-border-width-thick` 2px 描边 + 同色图标）、
`--vm-text-primary` / `--vm-text-secondary` / `--vm-text-tertiary`（关闭图标默认色）、`--vm-white-7` / `--vm-white-6`（底部 Button 的 hover / pressed）、
`--vm-focus-ring-width` + `--vm-border-selected`（焦点环）、`--vm-duration-slow`（Modal / Drawer 进出 300ms）、`--vm-opacity-disabled`（禁用）。

**状态**

- **焦点管理（Modal 硬要求）**：渲染真的 `<dialog>` 并用 `showModal()` 打开 —— 焦点陷阱（`Tab` 只在弹窗内循环）、`Esc` 关闭、top layer、
  背景 inert 全部由浏览器提供；`Esc` 关闭后焦点回到触发元素（浏览器交还给打开前的活动元素，页面层不要抢焦点）（[modal.md](components/modal.md) 可访问性）。
  `Dropdown` 的焦点归还做法可作同族参考：「关闭时若焦点还在被卸载的面板里，会显式 `focus()` 回触发器，避免焦点丢到 `<body>`；
  点面板外部关闭时**不**抢焦点」（[dropdown.md](components/dropdown.md) 可访问性）。Drawer 的焦点管理以 `references/components/drawer.md` 为准。
- **错误 / 失败**：只有 `type="error"` 的 Notification 默认 `role="alert"`，`info` / `success` / `warning` 默认 `role="status"`；
  「不要把 `role="alert"` 用在 info/success 上」（[notification.md](components/notification.md) #7）；`Loading` 上也不要挂 `role="alert"`（[loading.md](components/loading.md) 可访问性）。
- **禁用**：`Modal` / `Drawer` / `Toast` / `Notification` 都**没有 disabled 变体**（[modal.md](components/modal.md) / [notification.md](components/notification.md) 均明确）；
  要「不可用」就禁用里面的 `Button`（原生 `disabled`）。
- **空 / 加载**：`Modal` 没有 loading 变体；提交型弹窗在按钮上叠加「`Loading size="sm"` + 按钮自身 `disabled`」（[loading.md](components/loading.md) 相关组件）。
- **遮罩不承担点击关闭**：Figma 没有这个事实；产品确实要「点遮罩关闭」时由消费方在 `onClose` 上自行决定（[modal.md](components/modal.md) 可访问性）。

**与 Figma 的对应**：`Modal` = `56063:6526`（`Size`×`Type`，内嵌 `cross_filled`×6 与 `Size=md` 的 Button 实例：secondary×6 / primary×3 / danger×3）；
`Drawer` = `56063:6563`；`Toast` = `56063:6596`；`Notification` = `56063:6645`（`Type`×`Layout`，内嵌 `circle-info-filled` / `circle-check-filled` / `circle-alert-filled` / `circle-cross-filled` 与 `cross_filled`）。

**易错点**

1. **不要用 `div` + `z-index` 假弹窗**，也不要把 `open` 当普通属性直接写在 `<dialog>` 上 —— 那样得到的是**非模态** dialog：
   没有 top layer、没有 `::backdrop`、没有焦点陷阱（[modal.md](components/modal.md) #1）。
2. **不要手写遮罩色**：遮罩有真源 `Scrim/scrim-modal` → `--vm-scrim-modal`（[modal.md](components/modal.md) #3）。
3. **不要给弹窗面板加 hover 叠加层**：叠加只出现在底部 Button 实例上（[modal.md](components/modal.md) #2）。
4. **不要把 Toast 塞进 Modal 正文当状态条**：Modal 里的「操作成功」可以在关闭后再弹 Toast（[modal.md](components/modal.md) 相关组件）。
5. **不要给 banner 和 card 套同一套底色 / 描边**：banner 是 `--vm-bg-panel` + 2px 状态色描边，card 是 `--vm-bg-card` + 1px `--vm-border-default` + 2 级阴影（[notification.md](components/notification.md) #2）。
6. **不要把 Modal / Drawer / Toast 的参数互相套**（宽度、圆角、海拔、遮罩各不相同）（[modal.md](components/modal.md) #8）。
7. **不要用通知条代替确认弹窗**：需要用户先决策的场景用 Modal，Notification 不阻塞操作（[notification.md](components/notification.md) 相关组件）。

**事实依据**：[modal.md](components/modal.md)、[notification.md](components/notification.md)、[button.md](components/button.md)、[loading.md](components/loading.md)、[dropdown.md](components/dropdown.md)、[empty.md](components/empty.md)；
`drawer.md` / `toast.md` 的细节**以 references/components/drawer.md、references/components/toast.md 为准**（写作时尚未生成）。

---

## 6. 空状态与骨架屏（Empty / Skeleton 的选用与摆放）

**适用场景**：这是**同一位的两态**，互斥、绝不同时出现 ——
「结构已知、内容未到」→ `Skeleton`；「请求已经回来，但结果为空 / 搜不到 / 失败」→ `Empty`
（[empty.md](components/empty.md) 相关组件、[skeleton.md](components/skeleton.md) #5 都明确写了「两者互斥」）。

**结构**

```
Skeleton（首屏替位，形状要贴着真实内容）
├─ 列表行：circle(size="md" 40×40) + line(size="md" 200×12) + line(size="sm" 120×8)
│          行高与 ListItem 的 74 对齐（标题 20 + 说明 18 + 间隙 4 + 上下各 16）
├─ 整卡：type="card"（sm 200×140 / md 280×180）——它只是一个更大的圆角矩形，没有子节点
└─ 表格：Table state="loading" 已内嵌 Skeleton；自定义时在单元格里逐格铺 line

Empty（空结果的整块替位，默认 360×220、padding 40、gap 12、三档居中）
├─ type="empty"  → folder-line：「暂无内容 / 这里还没有任何内容，先去创建一个吧」
├─ type="search" → search-line：「没有搜索结果 / 换个关键词或调整筛选条件再试试」
├─ type="error"  → alert-line：「加载失败 / 网络或服务异常，请稍后重试」（role="alert"）
└─ 需要动作时：由页面在 Empty **下方**另放 Button（Empty 不内嵌 Button）
```

- 骨架块「间距交给外层的 `Container` / `Stack` 或业务自己的 flex 布局」，`Skeleton` 自身无外边距（[skeleton.md](components/skeleton.md) 代码用法）。
- `Empty` 通常放在内容容器或卡片内部并居中，**外层的圆角、底色与内边距由容器负责**（[empty.md](components/empty.md) 相关组件）。

**用哪些 token**

Skeleton：**8 档全部** `--vm-white-7`（8% 白），与形状、尺寸无关；圆角只有两种 —— `line` / `circle` 用 `--vm-radius-full`（999），`rect` 用 `--vm-radius-md`（8），`card` 用 `--vm-radius-card`（12）。
Empty：`--vm-white-0`（图标）、`--vm-text-primary`（标题）、`--vm-text-secondary`（说明）、`--vm-space-3`（图标-标题-说明之间的 gap 12）、`--vm-space-10`（padding 40）。
外层间距：`--vm-space-*`（`Stack` / `Grid` / `Container`），不要把间距做进骨架块。

**状态**

- **加载**：「正在加载」由**外层容器**承载 —— 容器加 `aria-busy="true"`，再放一段视觉隐藏的提示文本；
  `Skeleton` 自己默认 `aria-hidden="true"`，加载结束把它**卸载**（不是 CSS 隐藏）（[skeleton.md](components/skeleton.md) 可访问性、[table.md](components/table.md) 可访问性）。
- **空 / 错误**：`Empty` 的 `error` 档输出 `role="alert"`，`empty` / `search` 输出 `role="status"`；
  三档**颜色完全一致**，`error` 不是红色 ——「『这是错误』只能靠 ARIA 与文案传达，不能靠视觉」（[empty.md](components/empty.md) 交互与状态）。
- **禁用**：两者都没有任何交互态，不可点击、不进 Tab 序列，也**没有 disabled 变体**（[empty.md](components/empty.md) / [skeleton.md](components/skeleton.md) 均明确）。
- **动效**：`Skeleton` 在 Figma 里没有 shimmer / pulse 变体，组件不带 `--vm-duration-*` 与 `@keyframes`；要扫光请在业务层加并给
  `@media (prefers-reduced-motion: reduce)` 静态降级（[skeleton.md](components/skeleton.md) 交互与状态）。

**与 Figma 的对应**：`Empty` = `56061:6529`（`Type=empty|search|error`，三档同为 FIXED 360×220，内嵌 `folder-line` / `search-line` / `alert-line` 48×48 槽位）；
`Skeleton` = `56061:6513`（`Type=line|circle|rect|card` × `Size=sm|md`，8 变体填充全是 `White/White-7`）；
`Table` 的 `State=empty` / `State=loading` 变体在 Figma 里就已经内嵌了 `Type=empty` 的 Empty 与 `Type=line, Size=md` 的 Skeleton×3（[table.md](components/table.md)）。

**易错点**

1. **不要用 `Skeleton` 表达「没有数据」，也不要用 `Empty` 表达「加载中」**：加载中用 Skeleton、加载完但没数据才换成 Empty（[empty.md](components/empty.md) #6）。
2. **不要把 `Skeleton` 的 `--vm-white-7` 换成 `--vm-white-4` 或 `--vm-bg-card`**：8 档填充在 Figma 里全部绑 `White/White-7`，换亮会让骨架比真实内容还抢眼（[skeleton.md](components/skeleton.md) #2）。
3. **不要给 `Skeleton` 新增 prop**（`animated` / `loading` / `count` / `rows` / `radius` 都不存在），也不要把 `card` 档当成「拼好的骨架卡片」——它没有子节点（[skeleton.md](components/skeleton.md) #3 / #1）。
4. **不要给 `Empty` 加 `action` / `onRetry` prop**：Figma 的 3 个变体只有「图标 + 标题 + 说明」，按钮由页面在下方摆（[empty.md](components/empty.md) #2）。
5. **不要把 360×220 当硬约束，也不要用 `transform: scale()` 缩小**：窄容器覆盖 `width`，缩放会让 14px 正文低于可读下限（[empty.md](components/empty.md) #3 / 可访问性）。
6. **三档文案不能共用**：`search` 档的说明必须告诉用户下一步做什么（换关键词 / 调筛选）（[empty.md](components/empty.md) #4）。
7. **骨架形状要对齐真实内容**：接入前让骨架容器尺寸与真实内容一致，否则替换时会出现布局位移（[skeleton.md](components/skeleton.md) 可访问性）。

**事实依据**：[empty.md](components/empty.md)、[skeleton.md](components/skeleton.md)、[table.md](components/table.md)、[list-item.md](components/list-item.md)、[notification.md](components/notification.md)、[loading.md](components/loading.md)。

---

## 7. 设置项 / 菜单（MenuItem + Dropdown + Switch + Divider）

**适用场景**：一个触发器展开一小组操作或选项（`Dropdown` + `MenuItem`）；设置面板里**立即生效**的开关（`Switch`）。
表单取值不要用它们 —— 那是 `Select` 的职责（`combobox` / `listbox` 语义），`Dropdown` 是 `menu` / `menuitem` 语义（[dropdown.md](components/dropdown.md) 相关组件）。

**结构**

```
Dropdown（label 触发器 + open / defaultOpen；面板里只能放 MenuItem）
├─ MenuItem（icon 16×16 槽 + 文字；selected 时行尾自动出现 circle-check-filled 14×14）
├─ Divider + role="group" aria-label="…"        ← 分组用，Divider 是 role="separator" 的兄弟节点
└─ MenuItem（disabled：无权限 / 已归档）

设置项一整行（Figma 的设置类列表项把 Switch 放在行尾 —— 见「事实依据」）
├─ 行：文字（+ 说明）………………………… Switch（size="md" / "sm"）
└─ 整行可点时：由**行**处理点击，Switch 只负责状态，避免一次点击触发两次切换
```

- `MenuItem` 的根节点是 `<li role="none">`，「**必须**放进 `role="menu"` 的容器（Dropdown 的面板就是）」（[menu-item.md](components/menu-item.md) 可访问性）。
- 菜单分组：「组与组之间再加 `role="group"` / `aria-label`，不要用裸 `<hr>` 或空行」，且 `Divider` 要作为兄弟节点放在列表项之间、**不要放进 `<li>` 里**
  （[menu-item.md](components/menu-item.md) 相关组件 / [divider.md](components/divider.md) 相关组件）。
- `Switch` 没有 `children` 标签插槽：「需要可见标签时，标签写在外面，用 `htmlFor` / `id` 关联」（[switch.md](components/switch.md) 代码用法）。

**用哪些 token**

`Dropdown` 触发器：`--vm-bg-card` + 1px `--vm-border-default` + `--vm-radius-button`（12）；hover 换 `--vm-white-4`；open / focus 换 `--vm-border-selected` 且线宽到 `--vm-border-width-thick`（2px）。
面板：`--vm-bg-panel` + 1px `--vm-border-default` + `--vm-radius-md`（8）+ `--vm-elevation-3` + 8px 内边距 + 行间距 `--vm-space-0-5`（2）。
`MenuItem`：hover `--vm-surface-hover`、selected `--vm-surface-selected` + `--vm-brand`（文字与图标）、pressed `--vm-surface-pressed`、
圆角 `--vm-radius-sm`（6）、文字 `--vm-text-primary`、禁用 `--vm-opacity-disabled`。
`Switch`：未选中轨道 `--vm-neutral-550` + 拇指 `--vm-white-0`；选中轨道 `--vm-brand` + 拇指 `--vm-neutral-950`；
圆角 `--vm-radius-full`；内边距 `--vm-space-1`（4）；键盘焦点 `--vm-focus-ring-width` + `--vm-border-selected`。
`Divider`：`--vm-border-default`（四个变体唯一颜色）。

**状态**

- **选中**：`MenuItem selected` → `--vm-surface-selected` + 品牌色文字与对勾，并输出 `aria-current="true"`；
  `Switch checked` 由原生 `:checked` 驱动，轨道与拇指**成对换色**（不要写反）。
- **展开**：`Dropdown open` → 触发器描边 2px `--vm-border-selected`，下方 8px 出现面板；收起路径有三条：`Esc`、点面板外部、选中一个 `menuitem`
  （都会把焦点还给触发器；点外部不抢焦点）。触发器输出 `aria-haspopup="menu"` + `aria-expanded`（关着也输出 `false`）。
- **禁用**：`MenuItem` / `Dropdown` / `Switch` 都用原生 `disabled`，只加 `opacity: var(--vm-opacity-disabled)`（0.38）+
  `cursor: not-allowed`；`Dropdown disabled` 同时挡住开合，`Switch disabled` 退出 Tab 序列且不随表单提交。
- **空 / 加载 / 错误**：三者**都没有**这些变体 —— `MenuItem` 只有 `State=default|hover|selected|disabled`，
  `Dropdown` 只有 `State=closed|open`，`Switch` 只有 `Default|disabled`。库内也没有「空菜单」「菜单加载中」的设计事实；
  这类需求**以 `references/components/dropdown.md` / `menu-item.md` 为准**，或回 Figma 确认，不要自己发明一个 Menu 组件集。

**与 Figma 的对应**：`MenuItem` = `56064:6789`（`State` 四档，内嵌 `folder-line` 16×16 与 `circle-check-filled` 14×14）、
`Dropdown` = `56064:6813`（`State=closed|open`，内嵌 `chevron-down_filled`×2 与 3 个 `MenuItem`：default / hover / default）、
`Switch` = `56059:6488`（`Size` 36×20 / 44×24 × `Checked` × `State`）、`Divider` = `56061:6471`。
注意 Figma 里 Dropdown 面板固定 180 宽、却放了固定 208 宽的 MenuItem，右边 44px 被面板的 `clip: true` 裁掉了（选中对勾正好在裁切线外）。

**易错点**

1. **`MenuItem` 的 hover 是实色替换 `--vm-surface-hover`，不要叠 `--vm-white-7`**（[menu-item.md](components/menu-item.md) #2）。
   ⚠️ [list-item.md](components/list-item.md) 相关组件里把 MenuItem 的 hover 说成「`--vm-white-7` 叠加」，与 menu-item.md 冲突 —— **以 [menu-item.md](components/menu-item.md) 为准**。
2. **不要把 `State` 做成 prop**：`hover` / `active` / `focus` 用伪类，只有 `selected` 与原生 `disabled` 是应用态（[menu-item.md](components/menu-item.md) #1）。
3. **`MenuItem` 圆角是 6px**（`--vm-radius-sm`），不是按钮 / 输入框的 12px；文件里那个 999 圆角、蓝底、MiSans 的胶囊按钮是历史遗留，不要参照（[menu-item.md](components/menu-item.md) #3）。
4. **不要给 Switch 加 hover / pressed 效果**：Figma 的 `State` 只有 `default` / `disabled`，叠 `--vm-white-7` 或换 `--vm-brand-hover` 都是发明状态（[switch.md](components/switch.md) #1）。
5. **面板里不要放 `MenuItem` 之外的裸内容，也不要再套一层 `role="menu"`**；不要复制 Figma 的 `clip: true` 让内容重新被裁（[dropdown.md](components/dropdown.md) #2 / #3 / #4）。
6. **不要把 `Switch` 用成多选**：同一组多选里用 `Checkbox`（提交时生效），`Switch` 是立即生效的单一开关（[switch.md](components/switch.md) 相关组件）。
7. **点击区不要重复**：整行可点的设置项里，让行处理点击、`Switch` 只负责状态，避免一次点击切换两次（[switch.md](components/switch.md) 相关组件）。

**事实依据**：[menu-item.md](components/menu-item.md)、[dropdown.md](components/dropdown.md)、[switch.md](components/switch.md)、[divider.md](components/divider.md)、[list-item.md](components/list-item.md)、[select.md](components/select.md)；
「设置类列表项把 Switch 放在行尾」来自 [switch.md](components/switch.md) 相关组件，**以 switch.md 为准**。
