# VibeMe 参考实现 · 计算样式审计报告（验证第 3 层）

> 审计对象：`vibeme-design-system/components/` 参考实现——48 个组件集目录，桶文件 `components/index.ts` 共导出 49 个组件（`SidebarItem` 是 `Sidebar` 目录里的子组件，没有独立组件集）。
> 事实来源：`references/tokens.md`（169 个 token 快照）＋ `references/components/<slug>.md` 各变体 GEN 段（Figma 逐变体导出的填充/描边/圆角/尺寸/不透明度）。
> 工具链：`react-dom/server` 的 `renderToStaticMarkup` → 本机 Chrome（`Google Chrome 157.0.8103.51`，headless）＋ `puppeteer-core@25.17.0` → `getComputedStyle`。
> 运行环境：Node v24.21.0（`/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node`）· react/react-dom 19.3.1 · typescript 5.9.3。
> 编译产物：`/tmp/vm-check/out/`（`tsc -p tsconfig.json --noEmit false --outDir out` + `fix-imports.py` 补 ESM 后缀）。

## 1. 审计范围与方法

### 1.1 范围

- **断言级（45 条）**：Button / Input / Switch / Checkbox / Tag / Progress / Modal / Tabs 共 8 个组件的默认态、hover、focus-visible、disabled、checked 等关键变体，逐条比对上方事实来源。
- **全量级**：48 个组件集（49 个导出）各渲染两轮 props（默认 props ＋ 带内容 props），检查**没有任何元素**出现「计算 `color` 为纯黑 `rgb(0, 0, 0)` 且有效背景为深色」的情况。

### 1.2 方法（以及必须踩对的几个点）

1. **CSS 不能只内联 `tokens.css`**：组件样式是 TSX 里的 `import './X.css'`，Node 的 loader 会把 CSS 导入吞掉，所以页面里必须同时内联 `tokens.css` ＋ 48 个组件的 CSS（按目录名字典序拼接），否则所有组件都是无样式的裸 DOM，断言会「假失败」。
2. **读计算值前要等过渡跑完**：tokens 的动效是 `duration/fast` = 100ms，`:hover` / `:focus-visible` 会触发 `border-color` / `background-color` 的插值。脚本在每个交互动作后固定等 350ms，避免读到中间值。
3. **交互态之间要隔离**：`page.hover()` 设置的鼠标位置在 `page.setContent()` 之后依然保留。测试 `:focus-visible` 前先把鼠标移到 `(2, 2)`（页面 `body` 预留 24px 内边距），否则上一条 hover 用例会残留、让 `:hover` 与 `:focus-visible` 同时命中——**这一条正是本次找出实现问题的关键**（见 §3.1）。
4. **Modal 要用真实布局**：`<dialog>` 在未 `open` 时 `display: none`，宽度取不到用的值。脚本给 `dialog` 加 `open` 属性（命中 `.vm-modal[open] { display: flex }`）后再读 `width`。
5. **`box-shadow` 与 token 的一致性用参考元素比对**：页面里放一个 `box-shadow: var(--vm-elevation-4)` 的参考元素，断言 Modal 面板的 `box-shadow` 与它**逐字符相等**（Chrome 序列化成 `rgba(0, 0, 0, 0.4) 0px 16px 40px 0px`，与 tokens.md 写的 `0px 16px 40px 0px rgba(0, 0, 0, 0.4)` 只是分量顺序不同）。
6. **伪元素也要读**：Tabs `line` 选中态的指示条是 `::after`，用 `getComputedStyle(el, '::after')` 读 `height` / `background-color`。
7. **表格组件要放进真实表格上下文**：`<td>` / `<tr>` 脱离 `<table>` 时会被 HTML 解析器丢弃标签，`TableCell` 会因此丢父类、误报成「漏 token」。扫描时把 `TableCell` 包进 `<table><tbody><tr>`、`TableRow` 包进 `<table><tbody>`。

### 1.3 每条断言的期望值依据

| 断言组 | 期望 | 依据 |
|---|---|---|
| 1 Button `primary/md` | 高 40 / 圆角 12 / 底色 `#FFCC90`；disabled `opacity .38`；hover 出现 8% 白叠加层 | `button.md` GEN `Type=primary, Size=md` 80×40、圆角 12、`--vm-brand`；`Size=md, State=hover` 填充栈 = `Brand/Brand ＋ White/White-7`；`--vm-opacity-disabled` 0.38 |
| 2 Button `secondary/md` | 底色 `#202020` / 描边 12% 白；hover **底色不变** ＋ 8% 白叠加 | `button.md` GEN `Type=secondary, Size=md` = `--vm-bg-card` + `--vm-border-default`；「交互与状态」段明确 hover 是追加 `--vm-white-7`、**不换底色变量** |
| 3 Input `md` | 高 40 / 圆角 12 / 底色 `#202020` / 描边 12% 白；hover 描边→ 30% 白；disabled `.38`；focus-visible 描边 2px | `input.md` GEN `Size=md`；hover 变体描边 = `White/White-4`（30% 白，**不是叠加层**）；focus 变体 = `--vm-border-selected` ＋ `border/width/thick` 2px |
| 4 Input `sm` / `lg` | 32px / 48px | `input.md` GEN `Size=sm` 320×32、`Size=lg` 320×48 |
| 5 Switch | 选中轨道 `#FFCC90`；未选中 `--vm-neutral-550` = `#383838` | `switch.md` GEN `Checked=true` → `Brand/Brand`、`Checked=false` → `Neutral/Neutral-550` |
| 6 Checkbox | 选中方块 `#FFCC90`；disabled `opacity .38` | `checkbox.md` GEN `Checked=true` 方块填充 `--vm-brand`；`State=disabled` 0.38 |
| 7 Tag `error` | soft：文字 `#FF3B30`、圆角 4px；solid：底色 `#FF3B30` | `tag.md`「交互与状态」逐变体表（error/soft = `--vm-bg-card` ／ `--vm-status-error`）、`--vm-radius-badge` 4px |
| 8 Progress | 轨道高 6px、圆角 999px | `progress.md` GEN 320×6、圆角 `radius-full` |
| 9 Modal `md` | 宽 520px、阴影 = `--vm-elevation-4`、面板 `--vm-bg-panel` `#1A1A1A` | `modal.md` GEN `Size=md` 520 宽；`Modal.css` 头注「海拔 Elevation/4」＋ tokens.md `--vm-elevation-4` |
| 10 Tabs `line` 选中 | 指示条品牌色、高 2px | `tabs.md` 结构 `Type=line, State=selected`：底部 66×2 `Brand/Brand` ＋ `radius-full` |

## 2. 断言结果（45/45 PASS）

| # | 断言 | 选择器 | CSS 属性 | 期望 | 实际 | 结果 |
|---|---|---|---|---|---|---|
| 1a | Button type=primary size=md（default） | `.vm-button` | height | `40px` | `40px` | PASS |
| 1a | Button type=primary size=md（default） | `.vm-button` | border-radius | `12px` | `12px` | PASS |
| 1a | Button type=primary size=md（default） | `.vm-button` | background-color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |
| 1b | Button type=primary size=md disabled | `.vm-button` | opacity | `0.38` | `0.38` | PASS |
| 1c | Button type=primary size=md :hover | `.vm-button` | background-image | `rgba(255, 255, 255, 0.08)` | `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))` | PASS |
| 1c | Button type=primary size=md :hover | `.vm-button` | background-color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |
| 2a | Button type=secondary size=md（default） | `.vm-button` | background-color | `rgb(32, 32, 32)` | `rgb(32, 32, 32)` | PASS |
| 2a | Button type=secondary size=md（default） | `.vm-button` | border-color | `rgba(255, 255, 255, 0.12)` | `rgba(255, 255, 255, 0.12)` | PASS |
| 2b | Button type=secondary size=md :hover（底色不变 + 8% 白叠加） | `.vm-button` | background-color | `rgb(32, 32, 32)` | `rgb(32, 32, 32)` | PASS |
| 2b | Button type=secondary size=md :hover（底色不变 + 8% 白叠加） | `.vm-button` | background-image | `rgba(255, 255, 255, 0.08)` | `linear-gradient(rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.08))` | PASS |
| 3a | Input size=md（default） | `.vm-input__field` | height | `40px` | `40px` | PASS |
| 3a | Input size=md（default） | `.vm-input__field` | border-radius | `12px` | `12px` | PASS |
| 3a | Input size=md（default） | `.vm-input__field` | background-color | `rgb(32, 32, 32)` | `rgb(32, 32, 32)` | PASS |
| 3a | Input size=md（default） | `.vm-input__field` | border-color | `rgba(255, 255, 255, 0.12)` | `rgba(255, 255, 255, 0.12)` | PASS |
| 3a | Input size=md（default） | `.vm-input__field` | border-width | `1px` | `1px` | PASS |
| 3b | Input size=md :hover（换描边为 White-4，非叠加层） | `.vm-input__field` | border-color | `rgba(255, 255, 255, 0.3)` | `rgba(255, 255, 255, 0.3)` | PASS |
| 3b | Input size=md :hover（换描边为 White-4，非叠加层） | `.vm-input__field` | background-color | `rgb(32, 32, 32)` | `rgb(32, 32, 32)` | PASS |
| 3b | Input size=md :hover（换描边为 White-4，非叠加层） | `.vm-input__field` | background-image | `none` | `none` | PASS |
| 3c | Input size=md disabled | `.vm-input__field` | opacity | `0.38` | `0.38` | PASS |
| 3d | Input size=md :focus-visible | `.vm-input__field` | border-width | `2px` | `2px` | PASS |
| 3d | Input size=md :focus-visible | `.vm-input__field` | border-color | `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.5)` | PASS |
| 3e | Input size=md :hover + :focus-visible（同一时刻，focus 事实应胜出） | `.vm-input__field` | border-color | `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.5)` | PASS |
| 3e | Input size=md :hover + :focus-visible（同一时刻，focus 事实应胜出） | `.vm-input__field` | border-width | `2px` | `2px` | PASS |
| 4a | Input size=sm 高度 | `.vm-input__field` | height | `32px` | `32px` | PASS |
| 4b | Input size=lg 高度 | `.vm-input__field` | height | `48px` | `48px` | PASS |
| 5a | Switch checked | `.vm-switch` | background-color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |
| 5b | Switch unchecked（--vm-neutral-550 = #383838） | `.vm-switch` | background-color | `rgb(56, 56, 56)` | `rgb(56, 56, 56)` | PASS |
| 5c | Switch checked + disabled | `.vm-switch` | opacity | `0.38` | `0.38` | PASS |
| 6a | Checkbox checked | `.vm-checkbox__box` | background-color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |
| 6a | Checkbox checked | `.vm-checkbox__box` | border-radius | `4px` | `4px` | PASS |
| 6b | Checkbox disabled | `.vm-checkbox` | opacity | `0.38` | `0.38` | PASS |
| 7a | Tag tone=error style=soft | `.vm-tag` | color | `rgb(255, 59, 48)` | `rgb(255, 59, 48)` | PASS |
| 7a | Tag tone=error style=soft | `.vm-tag` | border-radius | `4px` | `4px` | PASS |
| 7a | Tag tone=error style=soft | `.vm-tag` | background-color | `rgb(32, 32, 32)` | `rgb(32, 32, 32)` | PASS |
| 7b | Tag tone=error style=solid | `.vm-tag` | background-color | `rgb(255, 59, 48)` | `rgb(255, 59, 48)` | PASS |
| 7b | Tag tone=error style=solid | `.vm-tag` | color | `rgb(255, 255, 255)` | `rgb(255, 255, 255)` | PASS |
| 8 | Progress 轨道 | `.vm-progress` | height | `6px` | `6px` | PASS |
| 8 | Progress 轨道 | `.vm-progress` | border-radius | `999px` | `999px` | PASS |
| 9 | Modal size=md（open） | `dialog.vm-modal` | width | `520px` | `520px` | PASS |
| 9 | Modal size=md（open） | `dialog.vm-modal` | box-shadow | `rgba(0, 0, 0, 0.4) 0px 16px 40px 0px` | `rgba(0, 0, 0, 0.4) 0px 16px 40px 0px` | PASS |
| 9 | Modal size=md（open） | `dialog.vm-modal` | background-color | `rgb(26, 26, 26)` | `rgb(26, 26, 26)` | PASS |
| 9 | Modal size=md（open） | `dialog.vm-modal` | display | `flex` | `flex` | PASS |
| 10 | Tabs type=line selected（::after 指示条） | `.vm-tabs--line.vm-tabs--selected::after` | background-color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |
| 10 | Tabs type=line selected（::after 指示条） | `.vm-tabs--line.vm-tabs--selected::after` | height | `2px` | `2px` | PASS |
| 10 | Tabs type=line selected（::after 指示条） | `.vm-tabs--line.vm-tabs--selected` | color | `rgb(255, 204, 144)` | `rgb(255, 204, 144)` | PASS |

**合计：PASS 45 / FAIL 0（45 条断言）。**

## 3. 失败项与处理

### 3.1 唯一真实问题：Input 聚焦时 hover 描边盖掉 focus 描边（**已修实现**）

- **现象**：鼠标停在输入框上再聚焦（点击聚焦、或键盘聚焦时鼠标恰好悬停），`:hover` 与 `:focus-visible` 同时命中，最终描边色是 `rgba(255, 255, 255, 0.3)`（White-4，hover 值），而 Figma 的 `State=focus` 事实要求 `rgba(255, 255, 255, 0.5)`（`Background/border-selected`，50% 白）。线宽 2px 是对的，颜色不对。
- **根因**：选择器权重，不是源码顺序。`.vm-input__field:hover:not(:disabled)` 是 `(0,3,0)`，`.vm-input__field:focus-visible` 只有 `(0,2,0)`——`Input.css` 里 focus 规则写在 hover 之后，但权重更低，压不住 hover。组件文档 `input.md` 的注释以为「写在 `:hover` 之后」就够了，这个假设不成立。
- **修法**（只改 `components/Input/Input.css`，一行选择器）：

```diff
-/* State=focus 的实体事实：描边 2px ＋ Background/border-selected（50% 白），再补 focus ring */
-.vm-input__field:focus-visible {
+/* State=focus 的实体事实：描边 2px ＋ Background/border-selected（50% 白），再补 focus ring。
+   末尾的 :not(:disabled) 不是装饰：`:hover:not(:disabled)` 的选择器权重是 (0,3,0)，
+   而 `:focus-visible` 只有 (0,2,0)——光靠源码顺序（写在 :hover 之后）压不住它。 */
+.vm-input__field:focus-visible:not(:disabled) {
   border-color: var(--vm-border-selected);
   border-width: var(--vm-border-width-thick);
   box-shadow: 0 0 0 var(--vm-focus-ring-width) var(--vm-border-selected);
   outline: none;
 }
```

- **验证**：补了断言 `3e`（`:hover` ＋ `:focus-visible` 同时命中，期望 focus 事实胜出）。修复前 `border-color` 实测 `rgba(255, 255, 255, 0.3)` **FAIL**；修复后实测 `rgba(255, 255, 255, 0.5)` **PASS**，且不影响 `3b`（单独 hover 仍是 30% 白）与 `3d`（单独 focus 仍是 50% 白 ＋ 2px）。
- 影响面：仅视觉。键盘聚焦（鼠标不在控件上）时 focus 色本来就对；问题出在**鼠标悬停 + 聚焦同时成立**的场景（点击聚焦是最常见路径），此时 Figma `State=focus` 的 50% 白描边此前达不到。

### 3.2 另外两处是**脚本自身的测量问题**，不是实现错（已修脚本，期望值无需更正）

| 现象（第一版脚本） | 判定 | 处理 |
|---|---|---|
| 断言 9 Modal `box-shadow` 期望读到空串 | 脚本 bug：`getPropertyValue('boxShadow')` 用了驼峰，必须写 `'box-shadow'` | 修脚本；参考元素实测 `rgba(0, 0, 0, 0.4) 0px 16px 40px 0px`，断言改为与参考元素逐字符相等 |
| 断言 3d Input `:focus-visible` 描边色 = 30% 白 | 脚本 bug：上一条 hover 用例残留的鼠标位置让 `:hover` 同时命中 | 每个用例交互前 `mouse.move(2, 2)`；隔离后单独 focus = 50% 白 PASS。**但这也说明该组合本身有实现问题**——于是新增 3e 固化为回归断言，并按 §3.1 修了实现 |
| 扫描里 `TableCell` 报纯黑文字 | 脚本 bug：`<td>` 脱离 `<table>` 被 HTML 解析器丢掉标签，`.vm-table-cell--text` 因此不匹配 | 扫描时用真实 `<table><tbody><tr>` 包裹；重跑后 `TableCell` 无命中 |

**结论：45 条断言的期望值没有一条是写错的**——全部与 `tokens.md` / `components/<slug>.md` 的 GEN 事实一致；唯一需要动代码的是 §3.1 的实现。

## 4. 全量扫描结论（48 个组件集 / 49 个导出 × 2 轮 props）

- 渲染实例：**93** 个 = 49 个导出 × 2 轮 props − 5。少掉的 5 个是带内容那轮按预期抛错的 `Divider` / `Input` / `Search` / `Slider` / `Switch`（它们渲染 `<hr>` / `<input>`，不能塞 `children`）；**49/49 个导出在默认 props 下全部渲染成功**。
- 扫描元素：**385** 个；文本节点：**80** 个
- 「计算 `color` 纯黑 ＋ 有效背景深色」的元素级命中：**75** 处（40 个「组件 × 选择器」组合）
- 其中**真正会以纯黑渲染出来的文本节点：5 处，全部是本次注入文案造成的人工痕迹，不是实现漏 token**（见 §4.1）
- 其余 **75 个文本节点**的计算色全部来自 token（或继承自带 token 色的祖先），**没有一处纯黑文字**。

### 4.1 5 处文本节点级命中（人工痕迹，逐条说明）

| 组件 | 命中元素 | 为什么不是漏 token |
|---|---|---|
| `Container` | `.vm-container` | 布局原语。`container.md` 明确「组件本身没有任何填充、描边与圆角」，Figma 里的 `narrow · 内容区` 是画板标注文字（`Text/Text-Tertiary`），不是组件产出；注入的裸文本落到 `body` 的继承色上 |
| `Grid` | `.vm-grid` | 同上；Figma 里的 `1/2/3` 是画板标注 |
| `Stack` | `.vm-stack` | 同上；Figma 里的 `项 1/2/3` 是画板标注 |
| `Header` | `.vm-header__center` | 纯透传插槽。`header.md` 的 with-nav 用法由调用方写 `<nav>` 与链接样式，`Header.css` 里没有任何 nav 规则（导航链接色归调用方）；注入的裸文本无归属 |
| `Skeleton` | `.vm-skeleton` | 骨架屏**按设计就没有文本**；注入的字符串是扫描脚本塞的，组件默认渲染里不存在该文本 |

> 这 5 处都只在「往纯布局容器/插槽里硬塞裸文本」时出现。真实用法下，这些位置放的都是自带 token 色的子组件（`Button`、`Search`、`Tag`、`<nav><a>` 等）；文本色由应用外壳（`body` / 页面根）决定，不属于组件集的 token 责任范围。

### 4.2 元素级 75 处命中的分类（全部为合理例外）

三类原因，无一是「组件自己声明的文字漏 token」：

1. **隐藏元素（不渲染）**：`Checkbox` / `Radio` / `Switch` 的原生 `<input>`（`opacity: 0`、1×1，只承担语义与键盘行为）；扫描包裹 `TableRow` 用的 `<table><tbody><tr>`（无单元格 → 0×0）。
2. **透传容器 / 纯装饰元素**：自身不渲染文本，文字都在子节点上且子节点各自带 token 色（如 `.vm-input` 根、`.vm-progress` 轨道、`Loading` 的 `<svg>/<g>/<circle>`、`Notification` 面板、`Popover` 容器、`Tooltip` 容器、`Slider` 轨道等）。它们在深色页面里继承到 `body` 的默认黑，但没有可渲染字符。
3. **注入文案造成的人工痕迹**：上表 5 处。

分组明细：

| 组件 | 元素/类名 | 命中数 | 自带文本 | 隐藏 | 有效背景 | 判定 |
|---|---|---|---|---|---|---|
| Checkbox | `vm-checkbox__input` | 2 | — | 2 | rgb(14, 14, 14) | 隐藏元素，不渲染 |
| Container | `vm-container vm-container--narrow` | 2 | 示例文本 | 0 | rgb(14, 14, 14) | 注入文本的人工痕迹（见 §4.1） |
| Dropdown | `vm-dropdown` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Empty | `vm-empty vm-empty--empty` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Grid | `vm-grid` | 2 | 示例文本 | 0 | rgb(14, 14, 14) | 注入文本的人工痕迹（见 §4.1） |
| Header | `vm-header vm-header--simple` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Header | `vm-header__spacer` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Header | `vm-header__center` | 1 | 示例文本 | 0 | rgb(14, 14, 14) | 注入文本的人工痕迹（见 §4.1） |
| Input | `vm-input vm-input--sm` | 1 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| ListItem | `vm-list-item` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Loading | `svg` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Loading | `circle` | 4 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Loading | `g` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| MenuItem | `vm-menu-item` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Notification | `vm-notification vm-notification--banner vm-notification--info` | 2 | — | 0 | rgb(26, 26, 26) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Notification | `vm-notification__content` | 2 | — | 0 | rgb(26, 26, 26) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Popover | `vm-popover vm-popover--bottom-start` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Popover | `vm-popover__arrow-row` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Progress | `vm-progress` | 2 | — | 0 | rgb(43, 43, 43) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Radio | `vm-radio__input` | 2 | — | 2 | rgb(14, 14, 14) | 隐藏元素，不渲染 |
| Search | `vm-search vm-search--sm` | 1 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Select | `vm-select vm-select--sm` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| SidebarItem | `vm-sidebar__item-wrap` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Skeleton | `vm-skeleton vm-skeleton--line vm-skeleton--sm` | 2 | 示例文本 | 0 | rgb(33, 33, 33) | 注入文本的人工痕迹（见 §4.1） |
| Slider | `vm-slider` | 1 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Slider | `vm-slider__track` | 1 | — | 0 | rgb(43, 43, 43) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Stack | `vm-stack vm-stack--vertical vm-stack--gap-sm` | 2 | 示例文本 | 0 | rgb(14, 14, 14) | 注入文本的人工痕迹（见 §4.1） |
| Statistic | `vm-statistic vm-statistic--default` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Switch | `vm-switch vm-switch--md` | 1 | — | 0 | rgb(56, 56, 56) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Switch | `vm-switch__input` | 1 | — | 1 | rgb(56, 56, 56) | 隐藏元素，不渲染 |
| TableCell | `table` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| TableCell | `tbody` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| TableCell | `tr` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| TableCell | `vm-table-cell vm-table-cell--text` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| TableRow | `table` | 2 | — | 2 | rgb(14, 14, 14) | 隐藏元素，不渲染 |
| TableRow | `tbody` | 2 | — | 2 | rgb(14, 14, 14) | 隐藏元素，不渲染 |
| TableRow | `vm-table-row vm-table-row--header` | 2 | — | 2 | rgb(26, 26, 26) | 隐藏元素，不渲染 |
| Textarea | `vm-textarea vm-textarea--md` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Tooltip | `vm-tooltip vm-tooltip--top vm-tooltip--dark` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |
| Upload | `vm-upload` | 2 | — | 0 | rgb(14, 14, 14) | 透传容器/纯装饰，子节点各自带 token 文字色 |

合计 75 处 / 40 个 (组件, 选择器) 组合

## 5. 复现命令

环境一次性搭好（详见 `tools/verify-implementations.md`）：`/tmp/vm-check` 内有 react@19 / react-dom@19 / puppeteer-core / typescript，仓库根有指向 `/tmp/vm-check/node_modules` 的 `node_modules` 软链，`tsconfig.json` 的 `include` 指向本仓库的 `vibeme-design-system/components/**`。

```bash
cd /tmp/vm-check
NODE=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node
PY=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3

# 1) 重建编译产物（tsc → JS，再补 ESM 后缀）
rm -rf out && $NODE node_modules/typescript/bin/tsc -p tsconfig.json --noEmit false --outDir out && $PY fix-imports.py out

# 2) 跑计算样式审计（puppeteer-core 指向本机 Chrome）
$NODE --import ./register.mjs style-audit.mjs
# 结果同时写到：/tmp/vm-check/style-audit-output.md（断言表 + 扫描明细）
#               /tmp/vm-check/style-audit-result.json（结构化结果）
```

脚本 `/tmp/vm-check/style-audit.mjs` 是**临时验证脚本，按约定不进仓库**，全文见附录 A。

## 6. 范围与未验证项

- **组件数**：`references/components/` 有 48 份文档、目录也是 48 个；桶文件多导出一个 `SidebarItem`（`Sidebar` 的子组件），全量扫描按 49 个导出做，不影响结论。
- **字体**：只断言颜色/尺寸/圆角/阴影等计算值，没有断言 Poppins 是否真的装到本机（字体回退不影响这些属性）。
- **未覆盖的状态**：Button 的 `ghost/danger`、Input 的 `error`、Switch/Checkbox 的 `indeterminate`、Tabs 的 `pill`、Modal 的 `sm/lg`、以及各组件在 `prefers-reduced-motion` 下的表现未逐条断言（本次按任务给定的断言清单执行）。
- **同类潜在问题（本次未改，范围外）**：`Search.css`、`Select.css`、`Textarea.css` 的 `field:hover:not(:disabled)` ＋ `field:focus-visible` 与 Input 是同一写法，存在同样的权重问题（focus 描边色会被 hover 覆盖，但这些组件当前 hover/focus 恰好都是「换描边 token」的一族，实际观感差异小于 Input）。建议后续一并加 `:not(:disabled)`。
- **并行改动**：任务已说明 `radio.tree.json` 与若干 prop 默认值正由其他 agent 修改，本报告不涉及这些文件；本次只改了 `components/Input/Input.css`。审计时的文件哈希见 §7。

## 7. 审计快照（sha256）

审计时的相关文件哈希（`Input.css` 为**修复后**）：


| 文件 | sha256 |
|---|---|
| `components/tokens.css` | `bd0434df965dc8822d7379e63702c4ca9e1e87e13812d49e6cebb7a840045f5d` |
| `components/Input/Input.css`（修复后） | `0b0bc9fb4ebca16883d2095b1608b2d8534867778aebfedd668166af230ad549` |
| `components/Button/Button.css` | `1572dbf6faf1e7d0e0689202e18ab80bfe499023d902ddff7fb423ea8dd861a0` |
| `components/Switch/Switch.css` | `9bfb79d5a4d4e2303834a852837f019b64651ca29f0780da0d978dcf4310303c` |
| `components/Checkbox/Checkbox.css` | `8ad8a7795ef640ca7b189d777036421525517a2ec91774ee89a7119dd1daa256` |
| `components/Tag/Tag.css` | `9fde6b1e03f5b020b5ded9e2e940925830fdc12f7e99709e503c99c2fe11445c` |
| `components/Progress/Progress.css` | `30df10a9cf71d14ecd008b09f01b8aee1ccf0b6c9eb424e5153e8c80b4495812` |
| `components/Modal/Modal.css` | `b38b77f915e9fd5c67f753957855220fad572e419806fea0cd4d9743969ed25b` |
| `components/Tabs/Tabs.css` | `b28844b65bcda8d1d9e26e05152bf142540482c6d0f81287579a7044d8fcf3f2` |

## 附录 A：审计脚本全文（`/tmp/vm-check/style-audit.mjs`，临时文件，不入库）

```js
#!/usr/bin/env node
/**
 * VibeMe 参考实现 · 计算样式审计（层 3）
 * 用法：cd /tmp/vm-check && node --import ./register.mjs style-audit.mjs
 *
 * 做法：react-dom/server 渲染单组件 -> 内联 tokens.css + 全部组件 CSS -> 本机 Chrome
 *       -> getComputedStyle 断言；最后把 48 个组件各渲染一次做「纯黑文字」全量扫描。
 * 注：组件 CSS 由 TSX 里的 `import './X.css'` 引入，Node 侧被 loader 吞掉，
 *     所以这里必须把 48 个组件的 CSS 一起内联，只内联 tokens.css 是不够的。
 */
import fs from 'node:fs';
import path from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import puppeteer from 'puppeteer-core';
import * as All from './out/index.js';

const REPO = '/Users/Zhuanz/workspace/deepseek/设计组件库/vibeme-design-system';
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const h = React.createElement;

/* ------------------------------------------------------------------ CSS 内联 */
function collectCss() {
  const root = path.join(REPO, 'components');
  const files = [path.join(root, 'tokens.css')];
  for (const d of fs.readdirSync(root).sort()) {
    const dir = path.join(root, d);
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const f of fs.readdirSync(dir).sort()) if (f.endsWith('.css')) files.push(path.join(dir, f));
  }
  return files;
}
const CSS_FILES = collectCss();
const PAGE_CSS =
  CSS_FILES.map((f) => `/* ==== ${path.relative(REPO, f)} ==== */\n${fs.readFileSync(f, 'utf8')}`).join('\n') +
  // padding 24 让组件不贴左上角，(2,2) 处只有 body —— 用来把鼠标从组件上移开，隔离 :hover
  `\nbody { background: var(--vm-bg-app); margin: 0; padding: 24px; font-family: var(--vm-font-family); }`;

const html = (markup) =>
  `<!doctype html><html><head><meta charset="utf-8"><style>${PAGE_CSS}</style></head><body>` +
  `<div id="__elev4" style="box-shadow: var(--vm-elevation-4)"></div><div id="__root">${markup}</div></body></html>`;

/* ------------------------------------------------------------------ 断言表 */
// match: 'eq' 全等 | 'contains' 包含 | 'refElev4' 与本页 --vm-elevation-4 参考元素一致
const CASES = [
  {
    id: '1a',
    label: 'Button type=primary size=md（default）',
    el: () => h(All.Button, { type: 'primary', size: 'md' }, 'Button'),
    checks: [
      { selector: '.vm-button', prop: 'height', expect: '40px' },
      { selector: '.vm-button', prop: 'border-radius', expect: '12px' },
      { selector: '.vm-button', prop: 'background-color', expect: 'rgb(255, 204, 144)' },
    ],
  },
  {
    id: '1b',
    label: 'Button type=primary size=md disabled',
    el: () => h(All.Button, { type: 'primary', size: 'md', disabled: true }, 'Button'),
    checks: [{ selector: '.vm-button', prop: 'opacity', expect: '0.38' }],
  },
  {
    id: '1c',
    label: 'Button type=primary size=md :hover',
    el: () => h(All.Button, { type: 'primary', size: 'md' }, 'Button'),
    actions: [{ type: 'hover', selector: '.vm-button' }],
    checks: [
      { selector: '.vm-button', prop: 'background-image', expect: 'rgba(255, 255, 255, 0.08)', match: 'contains' },
      { selector: '.vm-button', prop: 'background-color', expect: 'rgb(255, 204, 144)' },
    ],
  },
  {
    id: '2a',
    label: 'Button type=secondary size=md（default）',
    el: () => h(All.Button, { type: 'secondary', size: 'md' }, 'Button'),
    checks: [
      { selector: '.vm-button', prop: 'background-color', expect: 'rgb(32, 32, 32)' },
      { selector: '.vm-button', prop: 'border-color', expect: 'rgba(255, 255, 255, 0.12)' },
    ],
  },
  {
    id: '2b',
    label: 'Button type=secondary size=md :hover（底色不变 + 8% 白叠加）',
    el: () => h(All.Button, { type: 'secondary', size: 'md' }, 'Button'),
    actions: [{ type: 'hover', selector: '.vm-button' }],
    checks: [
      { selector: '.vm-button', prop: 'background-color', expect: 'rgb(32, 32, 32)' },
      { selector: '.vm-button', prop: 'background-image', expect: 'rgba(255, 255, 255, 0.08)', match: 'contains' },
    ],
  },
  {
    id: '3a',
    label: 'Input size=md（default）',
    el: () => h(All.Input, { size: 'md', placeholder: 'Placeholder' }),
    checks: [
      { selector: '.vm-input__field', prop: 'height', expect: '40px' },
      { selector: '.vm-input__field', prop: 'border-radius', expect: '12px' },
      { selector: '.vm-input__field', prop: 'background-color', expect: 'rgb(32, 32, 32)' },
      { selector: '.vm-input__field', prop: 'border-color', expect: 'rgba(255, 255, 255, 0.12)' },
      { selector: '.vm-input__field', prop: 'border-width', expect: '1px' },
    ],
  },
  {
    id: '3b',
    label: 'Input size=md :hover（换描边为 White-4，非叠加层）',
    el: () => h(All.Input, { size: 'md', placeholder: 'Placeholder' }),
    actions: [{ type: 'hover', selector: '.vm-input__field' }],
    checks: [
      { selector: '.vm-input__field', prop: 'border-color', expect: 'rgba(255, 255, 255, 0.3)' },
      { selector: '.vm-input__field', prop: 'background-color', expect: 'rgb(32, 32, 32)' },
      { selector: '.vm-input__field', prop: 'background-image', expect: 'none' },
    ],
  },
  {
    id: '3c',
    label: 'Input size=md disabled',
    el: () => h(All.Input, { size: 'md', placeholder: 'Placeholder', disabled: true }),
    checks: [{ selector: '.vm-input__field', prop: 'opacity', expect: '0.38' }],
  },
  {
    id: '3d',
    label: 'Input size=md :focus-visible',
    el: () => h(All.Input, { size: 'md', placeholder: 'Placeholder' }),
    actions: [{ type: 'focus', selector: '.vm-input__field' }],
    checks: [
      { selector: '.vm-input__field', prop: 'border-width', expect: '2px' },
      { selector: '.vm-input__field', prop: 'border-color', expect: 'rgba(255, 255, 255, 0.5)' },
    ],
  },
  {
    id: '3e',
    label: 'Input size=md :hover + :focus-visible（同一时刻，focus 事实应胜出）',
    el: () => h(All.Input, { size: 'md', placeholder: 'Placeholder' }),
    actions: [
      { type: 'hover', selector: '.vm-input__field' },
      { type: 'focus', selector: '.vm-input__field' },
    ],
    checks: [
      { selector: '.vm-input__field', prop: 'border-color', expect: 'rgba(255, 255, 255, 0.5)' },
      { selector: '.vm-input__field', prop: 'border-width', expect: '2px' },
    ],
  },
  {
    id: '4a',
    label: 'Input size=sm 高度',
    el: () => h(All.Input, { size: 'sm', placeholder: 'Placeholder' }),
    checks: [{ selector: '.vm-input__field', prop: 'height', expect: '32px' }],
  },
  {
    id: '4b',
    label: 'Input size=lg 高度',
    el: () => h(All.Input, { size: 'lg', placeholder: 'Placeholder' }),
    checks: [{ selector: '.vm-input__field', prop: 'height', expect: '48px' }],
  },
  {
    id: '5a',
    label: 'Switch checked',
    el: () => h(All.Switch, { checked: true, readOnly: true, 'aria-label': 'sw' }),
    checks: [{ selector: '.vm-switch', prop: 'background-color', expect: 'rgb(255, 204, 144)' }],
  },
  {
    id: '5b',
    label: 'Switch unchecked（--vm-neutral-550 = #383838）',
    el: () => h(All.Switch, { readOnly: true, 'aria-label': 'sw' }),
    checks: [{ selector: '.vm-switch', prop: 'background-color', expect: 'rgb(56, 56, 56)' }],
  },
  {
    id: '5c',
    label: 'Switch checked + disabled',
    el: () => h(All.Switch, { checked: true, readOnly: true, disabled: true, 'aria-label': 'sw' }),
    checks: [{ selector: '.vm-switch', prop: 'opacity', expect: '0.38' }],
  },
  {
    id: '6a',
    label: 'Checkbox checked',
    el: () => h(All.Checkbox, { checked: true, readOnly: true }, 'Label'),
    checks: [
      { selector: '.vm-checkbox__box', prop: 'background-color', expect: 'rgb(255, 204, 144)' },
      { selector: '.vm-checkbox__box', prop: 'border-radius', expect: '4px' },
    ],
  },
  {
    id: '6b',
    label: 'Checkbox disabled',
    el: () => h(All.Checkbox, { checked: true, readOnly: true, disabled: true }, 'Label'),
    checks: [{ selector: '.vm-checkbox', prop: 'opacity', expect: '0.38' }],
  },
  {
    id: '7a',
    label: 'Tag tone=error style=soft',
    el: () => h(All.Tag, { tone: 'error', style: 'soft' }, '已下架'),
    checks: [
      { selector: '.vm-tag', prop: 'color', expect: 'rgb(255, 59, 48)' },
      { selector: '.vm-tag', prop: 'border-radius', expect: '4px' },
      { selector: '.vm-tag', prop: 'background-color', expect: 'rgb(32, 32, 32)' },
    ],
  },
  {
    id: '7b',
    label: 'Tag tone=error style=solid',
    el: () => h(All.Tag, { tone: 'error', style: 'solid' }, '已下架'),
    checks: [
      { selector: '.vm-tag', prop: 'background-color', expect: 'rgb(255, 59, 48)' },
      { selector: '.vm-tag', prop: 'color', expect: 'rgb(255, 255, 255)' },
    ],
  },
  {
    id: '8',
    label: 'Progress 轨道',
    el: () => h(All.Progress, { value: 25 }),
    checks: [
      { selector: '.vm-progress', prop: 'height', expect: '6px' },
      { selector: '.vm-progress', prop: 'border-radius', expect: '999px' },
    ],
  },
  {
    id: '9',
    label: 'Modal size=md（open）',
    el: () => h(All.Modal, { size: 'md', title: '弹窗标题' }, '这里是弹窗正文内容。'),
    actions: [{ type: 'open', selector: 'dialog.vm-modal' }],
    checks: [
      { selector: 'dialog.vm-modal', prop: 'width', expect: '520px' },
      { selector: 'dialog.vm-modal', prop: 'box-shadow', expect: null, match: 'refElev4' },
      { selector: 'dialog.vm-modal', prop: 'background-color', expect: 'rgb(26, 26, 26)' },
      { selector: 'dialog.vm-modal', prop: 'display', expect: 'flex' },
    ],
  },
  {
    id: '10',
    label: 'Tabs type=line selected（::after 指示条）',
    el: () => h(All.Tabs, { type: 'line', selected: true }, '标签页'),
    checks: [
      { selector: '.vm-tabs--line.vm-tabs--selected', pseudo: '::after', prop: 'background-color', expect: 'rgb(255, 204, 144)' },
      { selector: '.vm-tabs--line.vm-tabs--selected', pseudo: '::after', prop: 'height', expect: '2px' },
      { selector: '.vm-tabs--line.vm-tabs--selected', prop: 'color', expect: 'rgb(255, 204, 144)' },
    ],
  },
];

/* ------------------------------------------------------------------ 执行 */
const rows = [];
const refCache = new Map();

async function readComputed(page, selector, pseudo, prop) {
  return page.evaluate(
    (sel, ps, p) => {
      const el = document.querySelector(sel);
      if (!el) return { missing: true };
      const cs = getComputedStyle(el, ps || undefined);
      return { value: cs.getPropertyValue(p) };
    },
    selector,
    pseudo ?? null,
    prop,
  );
}

async function auditCase(page, c) {
  await page.setContent(html(renderToStaticMarkup(c.el())), { waitUntil: 'load' });
  // 期望值来自本页参考元素时，先取参考值
  for (const k of c.checks) {
    if (k.match === 'refElev4' && !refCache.has('elev4')) {
      const r = await readComputed(page, '#__elev4', null, 'box-shadow');
      refCache.set('elev4', r.value);
    }
  }
  if (c.actions?.length) {
    await page.mouse.move(2, 2); // 清掉上一条用例残留的 hover
    for (const a of c.actions) {
      if (a.type === 'hover') await page.hover(a.selector);
      else if (a.type === 'focus') await page.focus(a.selector);
      else if (a.type === 'open')
        await page.evaluate((sel) => document.querySelector(sel)?.setAttribute('open', ''), a.selector);
    }
    await new Promise((r) => setTimeout(r, 350)); // 等 100ms 过渡跑完，避免读到中间插值
  }
  for (const k of c.checks) {
    const expect = k.match === 'refElev4' ? refCache.get('elev4') : k.expect;
    const got = await readComputed(page, k.selector, k.pseudo, k.prop);
    let pass = false;
    let actual;
    if (got.missing) actual = '(选择器未命中)';
    else {
      actual = got.value;
      if (k.match === 'contains') pass = actual.includes(expect);
      else pass = actual === expect;
    }
    rows.push({
      id: c.id,
      case: c.label,
      selector: k.selector + (k.pseudo ? k.pseudo : ''),
      prop: k.prop,
      expect: String(expect),
      actual: String(actual),
      pass,
    });
  }
}

/* --------------------------------------------- 11. 全量「纯黑文字」扫描 */
// 默认 props 之外再补一轮带内容的渲染，让文本节点真的出现（默认 props 下只有 18 个文本节点）
const RICH_PROPS = {
  Breadcrumb: { items: [{ label: '首页' }, { label: '组件库' }, { label: 'Button' }] },
  Button: { children: '按钮' },
  Badge: { children: '99+' },
  Card: { title: '卡片标题', children: '正文内容' },
  Descriptions: { items: [{ label: '项目名称', value: 'VibeMe Web' }] },
  Drawer: { title: '抽屉标题', children: '正文内容' },
  Dropdown: { label: '操作', children: '菜单项' },
  Empty: { title: '暂无内容', description: '这里还没有任何内容' },
  Loading: { label: '加载中' },
  Modal: { title: '弹窗标题', children: '这里是弹窗正文内容。' },
  Notification: { title: '通知标题', children: '说明文字' },
  Statistic: { label: '访问量', value: '1,024' },
  Steps: { items: [{ label: '第一步' }, { label: '第二步' }] },
  Tabs: { children: '标签页' },
  Tag: { children: '标签' },
  Toast: { title: '提示', children: '这是一条提示信息' },
  Tooltip: { children: '悬浮查看' },
};

function collectComponents() {
  const isComponent = (v) => typeof v === 'function' || (typeof v === 'object' && v !== null && v.$$typeof);
  const out = [];
  for (const key of Object.keys(All).sort()) {
    if (!/^[A-Z]/.test(key)) continue;
    if (!isComponent(All[key])) continue;
    out.push([key, All[key]]);
  }
  return out;
}

async function fullScan(page) {
  const comps = collectComponents();
  const entries = [];
  for (const [name, C] of comps) {
    const tryRender = (props) => {
      try {
        return renderToStaticMarkup(h(C, props));
      } catch {
        return null;
      }
    };
    const plain = tryRender({});
    if (plain !== null) entries.push({ name, variant: 'default', markup: plain });
    const rich = tryRender(RICH_PROPS[name] ?? { children: '示例文本' });
    if (rich !== null) entries.push({ name, variant: 'rich', markup: rich });
  }
  // <td>/<tr> 必须放在真实表格上下文里，否则 HTML 解析器会把标签丢掉（TableCell 会误报）
  const TABLE_WRAP = {
    TableRow: (m) => `<table><tbody>${m}</tbody></table>`,
    TableCell: (m) => `<table><tbody><tr>${m}</tr></tbody></table>`,
  };
  const markup = entries
    .map(
      (e) =>
        `<section data-audit-component="${e.name}" data-audit-variant="${e.variant}" style="background:transparent;padding:8px;">${
          TABLE_WRAP[e.name] ? TABLE_WRAP[e.name](e.markup) : e.markup
        }</section>`,
    )
    .join('\n');
  await page.setContent(html(markup), { waitUntil: 'load' });
  const res = await page.evaluate(() => {
    const parse = (s) => {
      const m = /rgba?\(([^)]+)\)/.exec(s);
      if (!m) return null;
      const p = m[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
    };
    const effBg = (el) => {
      const stack = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        const c = parse(getComputedStyle(n).backgroundColor);
        if (c && c.a > 0) {
          stack.push(c);
          if (c.a >= 1) break;
        }
      }
      let base = { r: 0, g: 0, b: 0, a: 0 };
      for (let i = stack.length - 1; i >= 0; i--) {
        const c = stack[i];
        const na = c.a + base.a * (1 - c.a);
        base = {
          r: (c.r * c.a + base.r * base.a * (1 - c.a)) / (na || 1),
          g: (c.g * c.a + base.g * base.a * (1 - c.a)) / (na || 1),
          b: (c.b * c.a + base.b * base.a * (1 - c.a)) / (na || 1),
          a: na,
        };
      }
      if (base.a < 1) {
        const w = 1 - base.a;
        base = { r: base.r * base.a + 255 * w, g: base.g * base.a + 255 * w, b: base.b * base.a + 255 * w, a: 1 };
      }
      return base;
    };
    const bright = (c) => 0.299 * c.r + 0.587 * c.g + 0.114 * c.b;
    const pathOf = (el) => {
      const parts = [];
      for (let n = el; n && n.nodeType === 1; n = n.parentElement) {
        if (n.hasAttribute && n.hasAttribute('data-audit-component')) {
          parts.unshift(`[${n.getAttribute('data-audit-component')}]`);
          break;
        }
        parts.unshift(n.tagName.toLowerCase() + (n.className && typeof n.className === 'string' ? '.' + n.className.trim().split(/\s+/).join('.') : ''));
      }
      return parts.join(' > ');
    };
    const hits = [];
    const textHits = [];
    let scanned = 0;
    let textNodes = 0;
    for (const wrap of document.querySelectorAll('[data-audit-component]')) {
      const name = wrap.getAttribute('data-audit-component');
      const variant = wrap.getAttribute('data-audit-variant');
      for (const el of wrap.querySelectorAll('*')) {
        scanned++;
        const cs = getComputedStyle(el);
        const col = parse(cs.color);
        const black = col && col.a === 1 && col.r === 0 && col.g === 0 && col.b === 0;
        const bg = effBg(el);
        const dark = bright(bg) < 128;
        // 该元素自己是否有直接文本节点
        let ownText = '';
        for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) ownText += n.textContent.trim();
        const rect = el.getBoundingClientRect();
        const hidden = cs.display === 'none' || Number(cs.opacity) === 0 || (rect.width <= 1 && rect.height <= 1);
        if (black && dark) {
          hits.push({
            component: name,
            variant,
            tag: el.tagName.toLowerCase(),
            cls: typeof el.className === 'string' ? el.className : '',
            ownText: ownText.slice(0, 24),
            subText: ownText ? '' : (el.textContent || '').trim().slice(0, 24),
            bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
            opacity: cs.opacity,
            display: cs.display,
            hidden,
            box: `${Math.round(rect.width)}x${Math.round(rect.height)}`,
            path: pathOf(el),
          });
        }
        // 精确信号：真正渲染出来的文本节点，父元素黑色 + 深底
        for (const n of el.childNodes) {
          if (n.nodeType !== 3 || !n.textContent.trim()) continue;
          textNodes++;
          if (black && dark && !hidden)
            textHits.push({
              component: name,
              variant,
              tag: el.tagName.toLowerCase(),
              cls: typeof el.className === 'string' ? el.className : '',
              text: n.textContent.trim().slice(0, 24),
              bg: `rgb(${Math.round(bg.r)}, ${Math.round(bg.g)}, ${Math.round(bg.b)})`,
              path: pathOf(el),
            });
        }
      }
    }
    return { scanned, textNodes, hits, textHits, wrappers: document.querySelectorAll('[data-audit-component]').length };
  });
  return { comps, entryCount: entries.length, ...res };
}

/* ------------------------------------------------------------------ main */
const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--force-color-profile=srgb', '--hide-scrollbars'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 2 });

for (const c of CASES) await auditCase(page, c);

const scan = await fullScan(page);
await browser.close();

const pass = rows.filter((r) => r.pass).length;
const fail = rows.length - pass;

const md = [];
md.push('| # | 断言 | 选择器 | CSS 属性 | 期望 | 实际 | 结果 |');
md.push('|---|---|---|---|---|---|---|');
for (const r of rows) {
  md.push(
    `| ${r.id} | ${r.case} | \`${r.selector}\` | ${r.prop} | \`${r.expect}\` | \`${r.actual}\` | ${r.pass ? 'PASS' : '**FAIL**'} |`,
  );
}
md.push('');
md.push(`合计：**PASS ${pass} / FAIL ${fail}**（共 ${rows.length} 条断言）`);
md.push('');
md.push(
  `### 全量扫描（${scan.comps.length} 个组件 × 2 轮 props = ${scan.entryCount} 个渲染实例，扫描 ${scan.scanned} 个元素 / ${scan.textNodes} 个文本节点）`,
);
md.push('');
md.push(`- 元素级命中（color 纯黑 + 有效背景深色）：**${scan.hits.length}** 处`);
md.push(`- 文本节点级命中（真正会以纯黑渲染出来的文字）：**${scan.textHits.length}** 处`);
md.push(
  `- 命中里「自带直接文本节点」的元素：**${scan.hits.filter((x) => x.ownText).length}** 处；隐藏元素（opacity 0 / ≤1×1）：**${scan.hits.filter((x) => x.hidden).length}** 处`,
);
md.push('');
if (scan.textHits.length === 0) md.push('**文本节点级：0 处纯黑文字。**');
else {
  md.push('文本节点级明细：');
  md.push('');
  md.push('| 组件 | 轮次 | 元素 | 类名 | 文本 | 有效背景 | 路径 |');
  md.push('|---|---|---|---|---|---|---|');
  for (const x of scan.textHits)
    md.push(
      `| ${x.component} | ${x.variant} | ${x.tag} | \`${x.cls}\` | ${x.text} | ${x.bg} | \`${x.path}\` |`,
    );
  md.push('');
}
if (scan.hits.length) {
  md.push('元素级明细（含容器类合理例外）：');
  md.push('');
  md.push('| 组件 | 轮次 | 元素 | 类名 | 自身文本 | 后代文本 | 有效背景 | opacity | 盒尺寸 | 隐藏 | 路径 |');
  md.push('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const x of scan.hits)
    md.push(
      `| ${x.component} | ${x.variant} | ${x.tag} | \`${x.cls}\` | ${x.ownText || '—'} | ${x.subText || '—'} | ${x.bg} | ${x.opacity} | ${x.box} | ${x.hidden ? '是' : '否'} | \`${x.path}\` |`,
    );
}

const out = md.join('\n');
fs.writeFileSync('/tmp/vm-check/style-audit-output.md', out);
fs.writeFileSync(
  '/tmp/vm-check/style-audit-result.json',
  JSON.stringify({ rows, scan: { ...scan, comps: scan.comps.map((c) => c[0]) }, refs: Object.fromEntries(refCache) }, null, 2),
);
console.log(out);
console.log('\n组件数：', scan.comps.length, scan.comps.map((c) => c[0]).join(','));
```

---

## 8. 同类问题全量排查：hover 权重压过 focus 事实（2026-11-16 追加）

> 触发：`Input.css` 修掉 §3.1 后，怀疑「`:hover:not(:disabled)` 权重 (0,3,0) > `:focus-visible` (0,2,0)」是**一类**写法问题，而不是 Input 一处的偶然。本节是 48 个组件 CSS 的全量排查、修复与自证。
> 范围：只改 CSS；`components/Input|Search|Select|Textarea/*.css` 四个文件、共 6 处选择器。未动 tsx、tokens.css、data/**、tools/**。

### 8.1 方法（两条互相独立的证据链）

1. **静态权重扫描**（临时脚本 `/tmp/vm-check/scan-css-specificity.py`，不入库）：解析 48 个 `components/*/*.css`，按 CSS Selectors L4 计算权重（`:not()` / `:is()` 取参数中最高权重，`:where()` 记 0），列出所有满足「**同一组件、同一被样式作用的元素、hover 与 focus 声明同一属性、且 权重(hover) ≥ 权重(focus)**」的组合；简写/长写（`border` ↔ `border-color` 等）也算相交。hover 侧已带 `:not(:focus-visible)` 的记为「结构上已隔离」。
2. **浏览器动态对照**（临时脚本 `/tmp/vm-check/focus-sweep.mjs`）：把 48 个组件渲染进本机 Chrome（`puppeteer-core` + `Google Chrome 157`），对每一条 focus 规则（`:focus-visible` / `:focus` / `:focus-within`，共 36 条）做 **A「只聚焦」 vs B「先 hover 再聚焦」** 的 `getComputedStyle` 逐属性对照；等 350ms 过渡结束；`outline-style: none` 时 `outline` 的 color 分量只是跟随 `color`，不计为冲突。

### 8.2 扫到的结果

- 符合「权重 ≥ 且属性相交」的组合：**16 个**，分布在 **7 个文件**（Dropdown / Footer / Input / Notification / Search / Select / Textarea）。
- 其中**真正会把 focus 事实盖掉**的：**3 个文件 / 4 个元素实例**——`Search`、`Select`、`Textarea`（Input 的默认态在 §3.1 已修）。
- 修复后：静态扫描 BUG **0**；动态 sweep 命中 **0**。

明细（修后终态，共 16 行 = 全部组合）：

| # | 文件 | 属性 | hover 规则（权重） | focus 规则（权重） | 修前判定 |
|---|---|---|---|---|---|
| 1 | Search.css | border-color | `.vm-search__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-search__field:focus-visible` (0,2,0) | **BUG**：hover (0,3,0) 压住 focus，实测 30% 白 |
| 2 | Select.css | border-color | `.vm-select__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-select__field:focus-visible` (0,2,0) | **BUG**：同上，实测 30% 白 |
| 3 | Select.css | border-color | `.vm-select__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-select--error .vm-select__field:focus-visible` (0,3,0) | 无害：同权重、focus 在后，focus 胜出 |
| 4 | Select.css | border-color | `.vm-select--error .vm-select__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-select__field:focus-visible` (0,2,0) | 无害：hover 胜，但值与 error 事实相同（都是 `--vm-status-error`） |
| 5 | Select.css | border-color | `.vm-select--error .vm-select__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-select--error .vm-select__field:focus-visible` (0,3,0) | 无害：同值（error） |
| 6 | Textarea.css | border-color | `.vm-textarea__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-textarea__field:focus-visible` (0,2,0) | **BUG**：实测 30% 白 |
| 7 | Textarea.css | border-color | `.vm-textarea__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-textarea--error .vm-textarea__field:focus-visible` (0,3,0) | 无害：同权重、focus 在后 |
| 8 | Textarea.css | border-color | `.vm-textarea--error .vm-textarea__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-textarea__field:focus-visible` (0,2,0) | 无害：hover 胜但同值（error） |
| 9 | Textarea.css | border-color | `.vm-textarea--error .vm-textarea__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-textarea--error .vm-textarea__field:focus-visible` (0,3,0) | 无害：同值（error） |
| 10 | Input.css | border-color | `.vm-input__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-input__field:focus-visible:not(:disabled)` (0,3,0) | 无害（§3.1 已修）：同权重、focus 在后 |
| 11 | Input.css | border-color | `.vm-input__field:hover:not(:disabled):not(:focus-visible)` (0,4,0) | `.vm-input--error .vm-input__field:focus-visible` (0,3,0) | 无害：同权重、focus 在后 |
| 12 | Input.css | border-color | `.vm-input--error .vm-input__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-input__field:focus-visible:not(:disabled)` (0,3,0) | 无害：hover 胜但同值（error） |
| 13 | Input.css | border-color | `.vm-input--error .vm-input__field:hover:not(:disabled):not(:focus-visible)` (0,5,0) | `.vm-input--error .vm-input__field:focus-visible` (0,3,0) | 无害：同值（error） |
| 14 | Dropdown.css | border-color | `.vm-dropdown__trigger:hover:where(:not(:disabled))` (0,2,0) | `.vm-dropdown__trigger:focus-visible` (0,2,0) | **未改**：`:where()` 把 hover 压到同权重，focus 在后胜出 |
| 15 | Footer.css | color | `.vm-footer__link:hover` (0,2,0) | `.vm-footer__link:focus-visible` (0,2,0) | **未改**：两边同值（`--vm-text-primary`） |
| 16 | Notification.css | color | `.vm-notification__close:hover` (0,2,0) | `.vm-notification__close:focus-visible` (0,2,0) | **未改**：两边同值（`--vm-text-secondary`） |

> 第 1–13 行修后全部带 `:not(:focus-visible)`（脚本记为「结构上已隔离」），hover 与 focus 永不共存；第 14–16 行本就没有视觉冲突，刻意保持原样。

### 8.3 改法（最小、统一；共 4 文件 / 6 处选择器）

统一手法：**给 hover 规则追加 `:not(:focus-visible)`**，并各加一行中文注释说明原由（权重算术 + 为什么不能让 hover 参与聚焦态竞争）。

| 文件 | 行 | 改动 |
|---|---|---|
| `components/Search/Search.css` | 88 | `.vm-search__field:hover:not(:disabled)` → `…:hover:not(:disabled):not(:focus-visible)` |
| `components/Select/Select.css` | 86 / 114 | 默认态与 `--error` 态各一处，同样追加 `:not(:focus-visible)` |
| `components/Textarea/Textarea.css` | 64 / 83 | 默认态与 `--error` 态各一处，同样追加 `:not(:focus-visible)` |
| `components/Input/Input.css` | 76 / 100 | 默认态与 `--error` 态各一处，同样追加；§3.1 已有的 focus 侧修法（`:focus-visible:not(:disabled)`）原样保留 |

**为什么统一选 `:not(:focus-visible)` 而不是抬高 focus 权重**：这 6 条 hover 规则**只声明 `border-color`**，与之配对的 focus 规则把描边色、线宽（2px）和 focus ring 全部覆盖了——聚焦时把 hover 排掉**不会丢掉任何状态**（`A 仅 hover` 的 30% 白、`D disabled+hover` 的 12% 白都不受影响）；同时它把 hover 权重抬到 (0,4,0)/(0,5,0)，比 §3.1「同权重 (0,3,0) 靠源码顺序」的修法更不依赖规则位置。Input 的 error 档原先是 (0,4,0) 结构上高于两条 focus 规则 (0,3,0)（只是恰好同值才没暴露），一并统一后，全库不再有「hover 结构上能压过 focus」的规则。

### 8.4 自证结果（全部真跑）

| 证据 | 修前 | 修后 |
|---|---|---|
| 静态权重扫描：会覆盖 focus 的 BUG 数 | 3 文件 / 4 实例 | **0** |
| `focus-assert.mjs`：4 个组件共 46 条（A 仅 hover／B 仅 focus／C **hover+focus**／D disabled+hover／E error+hover+focus） | **PASS 43 / FAIL 3** —— C 场景 `border-color` 实测 `rgba(255,255,255,0.3)`（应为 0.5） | **PASS 46 / FAIL 0** —— C 场景全部 `rgba(255,255,255,0.5)` ＋ `border-width: 2px` ＋ `box-shadow: rgba(255,255,255,0.5) 0 0 0 2px`，且与 B 逐字符相同 |
| `focus-sweep.mjs`：全库 36 条 focus 规则，A/B 对照 | 4 个元素实例命中（Search×2 / Select / Textarea，均为 `border-color` 0.5→0.3） | **0 命中** |
| `style-audit.mjs`（§2 的 45 条断言，回归） | — | **PASS 45 / FAIL 0**（含 3e「hover + focus-visible」） |
| `tools/validate.py` | — | 48 个组件，**错误 0 / 警告 0** |
| `tools/gen-tokens.py --check` | — | tokens.css / data/tokens.json / references/tokens.md **三者一致** |

- **「修前」数据怎么来的**：把 4 个文件备份到 `/tmp/vm-check/css-after/`，用正则去掉 `:not(:focus-visible)` 重跑同一脚本取得对照列，随后按 sha256 逐文件恢复（`diff -q` 全部一致）；之后又在 Input 默认态 hover 上补了同一保护（§8.3），终态哈希见 §8.6。
- C 场景的关键三行（修后，摘自 `/tmp/vm-check/focus-assert-AFTER.md`）：

```
| Search   | C hover+focus | `.vm-search__field`   | border-color | `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.5)` | PASS |
| Select   | C hover+focus | `.vm-select__field`   | border-color | `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.5)` | PASS |
| Textarea | C hover+focus | `.vm-textarea__field` | border-color | `rgba(255, 255, 255, 0.5)` | `rgba(255, 255, 255, 0.5)` | PASS |
```

### 8.5 仍存疑 / 未覆盖

1. **4 条 focus 规则没能动态演练**（渲染 props 缺对应变体或元素不可聚焦）：`.vm-breadcrumb__ellipsis:focus-visible`、`.vm-footer__link:focus-visible`、`.vm-table-cell--action … :is(button, a):focus-visible`、`.vm-ai-response-card__action:focus-visible`。静态扫描显示它们没有任何同属性的 hover 规则，因此不可能是同一 bug，但**只有静态证据**。
2. **`outline` 上的差异是假阳性**：Tabs / Upload / Pagination / Breadcrumb 的 focus 规则写 `outline: none`，`outline` 简写的 color 分量跟随 `color`，hover 改 `color`（92% vs 64% 白）时简写文本随之变化，但 `outline-style: none` 根本不绘制。脚本已按 `outline-style` 过滤掉这类命中。
3. **Dropdown 用的是另一种防法**：`:hover:where(:not(:disabled))` 把 hover 压到 (0,2,0)，与 `:focus-visible` 同权重、靠源码顺序取胜（实测 focus 胜出）。本次**没有**给它加 `:not(:focus-visible)`（它当前无 bug、且注释明确禁止改回 `:not(:disabled)`）；代价是若将来有人把 focus 规则上移到 hover 之前就会复发。
4. **`:has()` 权重**：Upload 的 `.vm-upload__box:has(.vm-upload__input:focus-visible)` 权重 (0,4,0) 压过 `.vm-upload__box:hover` (0,2,0)，方向正确（focus 更重），实测无冲突；但旧浏览器不支持 `:has()` 时整条 focus 规则会失效——属兼容性风险，与本次 bug 无关，未处理。
5. **无配对 focus 事实的 hover 规则不在判定范围**：Card / TableRow / Tabs(hover 只改 `background-color`/`color`，focus 只改 `box-shadow`)等，hover 与 focus 改的不是同一属性，不构成「焦点指示被盖掉」。
6. **未覆盖状态**：Switch/Checkbox 的 `indeterminate`、Tabs 的 `pill` 变体、各组件 `prefers-reduced-motion` 下的表现未逐条断言（与 §6 一致）；48 个文件里除 `prefers-reduced-motion` 与 Footer 的一个 `max-width: 720px` 外没有其它媒体查询，不影响本次结论。

### 8.6 终态快照（sha256）

| 文件 | sha256 | 说明 |
|---|---|---|
| `components/Input/Input.css` | `d7897522bdf93367528c69825c63147fd007283835e1337f716c4a4ce161c03a` | 相对 §7 的 `0b0bc9…`：新增 hover 侧 `:not(:focus-visible)`（2 处） |
| `components/Search/Search.css` | `c52dfedc124502c3945a107b4e24ecf744e20a93943e5424c5cdbc725769f875` | 1 处 |
| `components/Select/Select.css` | `80a5ad44e68ace05a1724cfa32de8903091d91f54ae39c9e27ae246e5f9fff6a` | 2 处 |
| `components/Textarea/Textarea.css` | `0ca9222b183adcee344e77b86eef18ba3cafe88c7a48dc7776c2525369921d9c` | 2 处 |
| `components/tokens.css` | `bd0434df965dc8822d7379e63702c4ca9e1e87e13812d49e6cebb7a840045f5d` | 未改，与 §7 相同 |

其余 44 个组件 CSS 全部未改：抽查 §7 已记录的 Button / Switch / Checkbox / Tag / Progress / Modal / Tabs 七个文件，sha256 与 §7 **逐字符相同**。
