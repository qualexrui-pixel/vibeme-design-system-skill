# 更新日志

本仓库遵循 [语义化版本](https://semver.org/lang/zh-CN/)：`主版本.次版本.修订号`。

- **主版本**：skill 的结构或约定发生不兼容变化（例如 props 命名规则变更、目录重组）。
- **次版本**：新增组件、新增 token、新增文档章节。
- **修订号**：修正事实错误、补漏、措辞与预览图更新。

## [1.0.1] - 2026-11-16

### 修正

- 补齐 **7 个组件「未采样尺寸档」的 Figma 证据**（新增 10 棵结构树）：`button(lg)`、`input(md)`、
  `avatar(sm/md/lg)`、`switch(sm)`、`modal(md)`、`drawer(md/lg)`、`loading(md)`。
  起因：抽查发现实现里按尺寸档写了字号，但部分档位没有对应的 Figma 导出证据 —— 这属于「无证据断言」。
  逐档核对结果：**原有断言全部正确，实现代码无需改动** ——
  button `lg` = `Heading/M`(16 SemiBold/24)、input `md` = `Heading/Body/M/Regular`(16 Regular/24)、
  avatar `sm/md/lg` = `Caption/Caption`/`Heading/S`/`Heading/M`、modal 与 drawer 各档文字样式一致；
  switch 与 loading 的这些档位本身**没有 TEXT 节点**（不适用）。受影响的 7 份组件文档事实段已重算。
- 修正 `data/components-index.json` 里失效的工具名引用（原写 `tools/export-figma.mjs`）。
- 修正 `tools/gen-component-docs.py` 的**幂等性 bug**：每次重跑会在 `<!-- GEN:END -->` 之后多加一个空行。
  现在 facts 与人工讲解用恰好一个空行拼接，连跑两次产物完全一致（已实测）。
- 修正 `.gitignore`：`node_modules/` 只匹配目录、不匹配软链，导致验证用的 `node_modules` 软链被误提交。
  改为 `node_modules`（同时忽略目录与软链），并从版本控制中移除该软链。

### 验证

重新跑全套：`validate.py` 48 组件 0 错 0 警 · `gen-tokens.py --check` 一致 · `tsc` 0 error ·
SSR 冒烟 49/49 渲染成功。

## [1.0.0] - 2026-11-16

首次发布。

### 内容

- **48 个组件集 / 334 个变体**的完整规格：表单控件 10（142 变体）、展示类 8（67）、反馈类 8（43）、
  导航类 7（26）、数据展示类 5（20）、布局类 5（18）、VibeMe AI 5（18）。
- **169 个设计 token** + 22 个历史遗留变量清单 + 19 个文字样式 + 4 组海拔阴影 + 15 个颜色样式 + 4 组栅格样式。
- **48 份 React（TSX）+ 原生 CSS 参考实现**，零第三方依赖，只消费 CSS 变量；
  `components/tokens.css` 提供全部 `--vm-*` 变量与 `.vm-type-*` 文字样式类。
- **48 张组件预览图**（从 Figma 组件集导出，`maxDimension=2400`）。
- 人写文档：[foundations.md](vibeme-design-system/references/foundations.md)（设计不变量）、
  [figma-design.md](vibeme-design-system/references/figma-design.md)（Figma 工作流）、
  [implementation.md](vibeme-design-system/references/implementation.md)（代码与评审规范）、
  [patterns.md](vibeme-design-system/references/patterns.md)（页面级组合）。

### 工具

- `tools/gen-tokens.py`：Figma 变量/样式 → `tokens.css` / `data/tokens.json` / `references/tokens.md`；
  支持 `--check` 做漂移检测。命名规则集中在 `tools/token-map.json`。
- `tools/gen-component-docs.py`：Figma 组件导出 → 逐组件规格文档的事实段（`GEN` 标记内）+ 索引 + 桶文件；
  刷新时保留人工讲解段。
- `tools/figma-extract.js`：在 Figma 插件环境里导出组件集的全部变体事实与结构树；
  受 MCP 48000 字节返回上限约束，内置自适应降级。
- `tools/validate.py`：索引 / 文档 / 代码 / 预览图 / 原始导出五处一致性校验，含「CSS 不得出现字面量颜色」
  与「`var(--vm-*)` 必须有定义」两条硬检查。

### 验证（发布前真跑，不是估计）

| 层 | 手段 | 结果 |
|---|---|---|
| 生成物一致性 | `tools/gen-tokens.py --check` | `tokens.css` / `tokens.json` / `tokens.md` 与 Figma 导出真源一致 |
| 仓库一致性 | `tools/validate.py` | 48 个组件，**0 错误 0 警告** |
| 类型检查 | TypeScript 5.9 strict（48 个 TSX） | **0 error** |
| 渲染冒烟 | `react-dom/server` 逐组件真渲染 | **49/49 成功**（48 组件 + `SidebarItem`），0 崩溃 |
| 计算样式 | `puppeteer-core` + 本机 Chrome | **45/45 断言通过**；另有 49 导出 × 93 实例、385 元素的全量扫描 |
| 依赖审计 | 全量 TSX 引入扫描 | 只 import `react`，**零第三方依赖** |

复现方法与踩坑记录见 [tools/verify-implementations.md](tools/verify-implementations.md)，审计明细见 [tools/style-audit-report.md](tools/style-audit-report.md)。

### 验证中发现并修掉的问题

1. `Card`、`Notification` 的 props 接口继承 `HTMLAttributes` 又重声明 `title: ReactNode`，与 DOM 的 `title: string` 冲突 → 改为 `Omit<…, 'title'>`（类型检查发现）。
2. `Breadcrumb.items`、`Steps.items`、`Pagination.current/total`、`Dropdown.label` 是必填 prop，缺省即崩 → 全部改为带安全默认值（`[]` / `1` / `''`），空数据不再输出无意义空列表（冒烟渲染发现）。
3. `:hover:not(:disabled)` 权重高于 `:focus-visible`，导致「鼠标悬停 + 键盘聚焦」时聚焦描边被 hover 盖掉 —— 这是无障碍问题 → `Input` / `Search` / `Select` / `Textarea` 共 5 处加 `:not(:focus-visible)` 护栏，A/B 自证修前 43/3 → 修后 46/46（计算样式审计发现）。
4. `radio.tree.json` 是早期被中断导出留下的损坏 JSON → 重新导出（一致性校验发现）。

### 已记录的 Figma 侧问题（文档中均已标注，未擅自修改设计稿）

- `Heading/Body/L/Medium`、`Heading/Body/M/Medium`、`Heading/Body/S/SemiBold` 三个文字样式名与真实字重不符（实际都是 Regular）。
- `主色/Main Orange` 的命名与取值不符（值其实是品牌砂色 `#FFCC90`）；`后台主色` 是体系外荧光绿。
- 历史上另有一个圆角 999、蓝底、MiSans 的胶囊按钮组件，不属于本组件库。
- 同一个体系里 hover 有两种手法：填充叠加（Button 等）与描边换色（Input/Search/Select 等），已在文档中分别记录。
- 组件上仍有 22 个历史遗留变量的引用风险，已在生成文档中用 `⚠ 无对应 CSS 变量` 标出。

### 已知限制

- 快照会过期；Figma 实时数据优先。
- `components/` 是参考实现，不是发布到 npm 的包，也未包含 Figma Code Connect 映射。
- `VibeMe AI / *` 使用另一套 token（`--vm-ai-*`），其变量只有 `Dark` 单一 mode。
