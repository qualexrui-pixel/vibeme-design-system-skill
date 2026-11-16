# 组件索引

VibeMe 总组件库共 **48 个组件集 / 334 个变体**，全部来自 Figma 页面 [`56054:5521`「全局」总组件库](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56054-5521)。本文件由 `tools/gen-component-docs.py --index` 生成。

## 怎么用

1. 在下表找到组件 → 打开它的**规格文档**（含全部变体、绑定 token、结构树、代码用法）。
2. Figma 的 **VARIANT 属性 = 代码里的 prop**，属性值小写后就是枚举值。
3. **交互态**（`hover` / `pressed` / `focus`）不做成 prop，用 CSS 伪类；**应用态**（`disabled` / `error` / `open` / `checked` / `selected`）才是 prop。
4. 未知组件先看 [foundations.md](foundations.md) 的硬规则，再动手。

> 表里「内嵌」列表示该组件内部已经放了其他组件的实例 —— 代码里对应组合关系，不要重复实现。

## 表单控件（10 个组件集 / 142 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **Button** | 48 | `label`(TEXT)　`type`: primary/secondary/ghost/danger　`size`: sm/md/lg　`state`: default/hover/pressed/disabled | 72×32 | — | [button.md](components/button.md) | [图](../assets/previews/button.png) |
| **Input** | 15 | `placeholder`(TEXT)　`size`: sm/md/lg　`state`: default/hover/focus/error/disabled | 320×32 | — | [input.md](components/input.md) | [图](../assets/previews/input.png) |
| **Textarea** | 10 | `placeholder`(TEXT)　`size`: md/lg　`state`: default/hover/focus/error/disabled | 320×88 | — | [textarea.md](components/textarea.md) | [图](../assets/previews/textarea.png) |
| **Select** | 15 | `value`(TEXT)　`size`: sm/md/lg　`state`: default/hover/open/error/disabled | 320×32 | `Property 1=chevron-down_filled` | [select.md](components/select.md) | [图](../assets/previews/select.png) |
| **Search** | 12 | `placeholder`(TEXT)　`size`: sm/md/lg　`state`: default/hover/focus/disabled | 320×32 | `Property 1=icon, Property 2=search-line` | [search.md](components/search.md) | [图](../assets/previews/search.png) |
| **Checkbox** | 12 | `label`(TEXT)　`size`: sm/md　`checked`: false/true/indeterminate　`state`: default/disabled | 66×20 | — | [checkbox.md](components/checkbox.md) | [图](../assets/previews/checkbox.png) |
| **Radio** | 8 | `label`(TEXT)　`size`: sm/md　`selected`: false/true　`state`: default/disabled | 66×20 | — | [radio.md](components/radio.md) | [图](../assets/previews/radio.png) |
| **Switch** | 8 | `size`: sm/md　`checked`: false/true　`state`: default/disabled | 44×24 | — | [switch.md](components/switch.md) | [图](../assets/previews/switch.png) |
| **Slider** | 9 | `state`: default/hover/disabled　`value`: 0/50/100 | 320×16 | — | [slider.md](components/slider.md) | [图](../assets/previews/slider.png) |
| **Upload** | 5 | `state`: default/hover/dragover/error/disabled | 320×160 | `Property 1=icon, Property 2=import-line` | [upload.md](components/upload.md) | [图](../assets/previews/upload.png) |

## 展示类（8 个组件集 / 67 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **Tag** | 24 | `label`(TEXT)　`tone`: neutral/brand/success/warning/error/info　`size`: sm/md　`style`: soft/solid | 38×24 | — | [tag.md](components/tag.md) | [图](../assets/previews/tag.png) |
| **Badge** | 8 | `count`(TEXT)　`type`: dot/count　`tone`: brand/error　`size`: sm/md | 6×6 | — | [badge.md](components/badge.md) | [图](../assets/previews/badge.png) |
| **Avatar** | 10 | `initial`(TEXT)　`size`: xs/sm/md/lg/xl　`type`: icon/initial | 24×24 | `Property 1=icon, Property 2=user-line` | [avatar.md](components/avatar.md) | [图](../assets/previews/avatar.png) |
| **Card** | 6 | `type`: plain/media/selected　`state`: default/hover | 320×98 | — | [card.md](components/card.md) | [图](../assets/previews/card.png) |
| **Divider** | 4 | `orientation`: horizontal/vertical　`style`: solid/dashed | 320×1 | — | [divider.md](components/divider.md) | [图](../assets/previews/divider.png) |
| **List** | 4 | `state`: default/hover/selected/disabled | 320×74 | `Property 1=chevron-right_filled`、`Size=md, Type=initial` | [list-item.md](components/list-item.md) | [图](../assets/previews/list-item.png) |
| **Skeleton** | 8 | `type`: line/circle/rect/card　`size`: sm/md | 120×8 | — | [skeleton.md](components/skeleton.md) | [图](../assets/previews/skeleton.png) |
| **Empty** | 3 | `type`: empty/search/error | 360×220 | `Property 1=icon, Property 2=alert-line`、`Property 1=icon, Property 2=folder-line`、`Property 1=icon, Property 2=search-line` | [empty.md](components/empty.md) | [图](../assets/previews/empty.png) |

## 反馈类（8 个组件集 / 43 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **Modal** | 6 | `size`: sm/md/lg　`type`: basic/confirm | 400×196 | `Property 1=cross_filled`、`Type=danger, Size=md, State=default`、`Type=primary, Size=md, State=default`、`Type=secondary, Size=md, State=default` | [modal.md](components/modal.md) | [图](../assets/previews/modal.png) |
| **Drawer** | 6 | `size`: sm/md/lg　`side`: right/left | 320×640 | `Property 1=cross_filled` | [drawer.md](components/drawer.md) | [图](../assets/previews/drawer.png) |
| **Toast** | 4 | `type`: info/success/warning/error | 360×68 | `Property 1=circle-alert-filled`、`Property 1=circle-check-filled`、`Property 1=circle-cross-filled`、`Property 1=circle-info-filled`、`Property 1=cross_filled` | [toast.md](components/toast.md) | [图](../assets/previews/toast.png) |
| **Notification** | 8 | `type`: info/success/warning/error　`layout`: banner/card | 480×78 | `Property 1=circle-alert-filled`、`Property 1=circle-check-filled`、`Property 1=circle-cross-filled`、`Property 1=circle-info-filled`、`Property 1=cross_filled` | [notification.md](components/notification.md) | [图](../assets/previews/notification.png) |
| **Tooltip** | 8 | `placement`: top/bottom/left/right　`tone`: dark/brand | 72×39 | — | [tooltip.md](components/tooltip.md) | [图](../assets/previews/tooltip.png) |
| **Popover** | 4 | `placement`: bottom-start/bottom-end/top-start/top-end | 100×139 | — | [popover.md](components/popover.md) | [图](../assets/previews/popover.png) |
| **Progress** | 4 | `value`: 25/50/75/100 | 320×6 | — | [progress.md](components/progress.md) | [图](../assets/previews/progress.png) |
| **Loading** | 3 | `size`: sm/md/lg | 16×16 | — | [loading.md](components/loading.md) | [图](../assets/previews/loading.png) |

## 导航类（7 个组件集 / 26 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **Tabs** | 8 | `type`: line/pill　`state`: default/hover/selected/disabled | 66×44 | — | [tabs.md](components/tabs.md) | [图](../assets/previews/tabs.png) |
| **Breadcrumb** | 2 | `type`: 3levels/collapsed | 186×20 | — | [breadcrumb.md](components/breadcrumb.md) | [图](../assets/previews/breadcrumb.png) |
| **Pagination** | 4 | `size`: sm/md　`type`: full/simple | 156×28 | `Property 1=chevron-left_filled`、`Property 1=chevron-right_filled` | [pagination.md](components/pagination.md) | [图](../assets/previews/pagination.png) |
| **Steps** | 4 | `type`: horizontal/vertical　`current`: 1/2 | 309×24 | `Property 1=circle-check-filled` | [steps.md](components/steps.md) | [图](../assets/previews/steps.png) |
| **MenuItem** | 4 | `label`(TEXT)　`state`: default/hover/selected/disabled | 208×36 | `Property 1=circle-check-filled`、`Property 1=icon, Property 2=folder-line` | [menu-item.md](components/menu-item.md) | [图](../assets/previews/menu-item.png) |
| **Dropdown** | 2 | `state`: closed/open | 180×40 | `Property 1=chevron-down_filled`、`State=default`、`State=hover` | [dropdown.md](components/dropdown.md) | [图](../assets/previews/dropdown.png) |
| **Sidebar** | 2 | `state`: expanded/collapsed | 240×320 | `Property 1=icon, Property 2=folder-line`、`Property 1=icon, Property 2=search-line`、`Property 1=icon, Property 2=user-line` | [sidebar.md](components/sidebar.md) | [图](../assets/previews/sidebar.png) |

## 数据展示类（5 个组件集 / 20 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **TableCell** | 4 | `type`: text/number/status/action | 200×44 | — | [table-cell.md](components/table-cell.md) | [图](../assets/previews/table-cell.png) |
| **TableRow** | 6 | `type`: header/body　`state`: default/hover/selected | 720×43 | `Tone=neutral, Size=sm, Style=soft` | [table-row.md](components/table-row.md) | [图](../assets/previews/table-row.png) |
| **Table** | 3 | `state`: default/empty/loading | 720×191 | `Tone=neutral, Size=sm, Style=soft`、`Type=empty`、`Type=line, Size=md` | [table.md](components/table.md) | [图](../assets/previews/table.png) |
| **Descriptions** | 4 | `layout`: horizontal/vertical　`columns`: 2/3 | 720×98 | — | [descriptions.md](components/descriptions.md) | [图](../assets/previews/descriptions.png) |
| **Statistic** | 3 | `type`: default/up/down | 77×58 | `Property 1=chevron-down_filled`、`Property 1=chevron-up_filled` | [statistic.md](components/statistic.md) | [图](../assets/previews/statistic.png) |

## 布局类（5 个组件集 / 18 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **Container** | 4 | `type`: narrow/default/wide/full | 720×168 | — | [container.md](components/container.md) | [图](../assets/previews/container.png) |
| **Stack** | 6 | `direction`: vertical/horizontal　`gap`: sm/md/lg | 288×136 | — | [stack.md](components/stack.md) | [图](../assets/previews/stack.png) |
| **Grid** | 3 | `columns`: 2/3/4 | 720×176 | — | [grid.md](components/grid.md) | [图](../assets/previews/grid.png) |
| **Header** | 3 | `type`: simple/with-nav/with-search | 1200×64 | `Size=md, State=default`、`Type=primary, Size=sm, State=default`、`Type=secondary, Size=sm, State=default` | [header.md](components/header.md) | [图](../assets/previews/header.png) |
| **Footer** | 2 | `type`: simple/columns | 1200×105 | `Orientation=horizontal, Style=solid` | [footer.md](components/footer.md) | [图](../assets/previews/footer.png) |

## VibeMe AI（另一套 token）（5 个组件集 / 18 变体）

| 组件 | 变体 | 属性轴（= 代码 props） | 默认尺寸 | 内嵌 | 规格文档 | 预览 |
|---|---|---|---|---|---|---|
| **VibeMe AI / Trigger Button** | 6 | `size`: Medium/Large　`state`: Default/Hover/Disabled | 154×40 | — | [vibe-ai-trigger-button.md](components/vibe-ai-trigger-button.md) | [图](../assets/previews/vibe-ai-trigger-button.png) |
| **VibeMe AI / Prompt Field** | 3 | `state`: Default/Focus/Disabled | 420×136 | — | [vibe-ai-prompt-field.md](components/vibe-ai-prompt-field.md) | [图](../assets/previews/vibe-ai-prompt-field.png) |
| **VibeMe AI / Generation Status** | 3 | `state`: Thinking/Generating/Complete | 104×37 | — | [vibe-ai-generation-status.md](components/vibe-ai-generation-status.md) | [图](../assets/previews/vibe-ai-generation-status.png) |
| **VibeMe AI / Capability Chip** | 3 | `type`: Creative/Precise/Fast | 106×36 | — | [vibe-ai-capability-chip.md](components/vibe-ai-capability-chip.md) | [图](../assets/previews/vibe-ai-capability-chip.png) |
| **VibeMe AI / Response Card** | 3 | `state`: Thinking/Complete/Error | 460×154 | — | [vibe-ai-response-card.md](components/vibe-ai-response-card.md) | [图](../assets/previews/vibe-ai-response-card.png) |

