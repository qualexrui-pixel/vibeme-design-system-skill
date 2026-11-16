# `tools/figma-extract.js` 使用说明

把 Figma 组件集的**真实事实**导出为 JSON。这是所有文档与代码的数据来源 —— 文档和代码里出现的一切
尺寸、颜色、变量绑定、文字样式，都必须能在这份导出里找到出处。

## 怎么用

1. 用 `read` 读出 `tools/figma-extract.js` 的全文。
2. 调 `mcp__figma__use_figma`，`code` 参数 = 该文件全文，但先把三个占位符替换掉：

| 占位符 | 换成 | 说明 |
|---|---|---|
| `__SLUG__` | 组件 slug，如 `button` | 只用于回显，必须与文件名一致 |
| `__SET_ID__` | 组件集 node id，如 `56058:5617` | 从 `data/components-index.json` 的 `id` 拿 |
| `__MODE__` | `variants` 或 `tree` | 见下 |
| `__VARIANT__` | 变体全名，如 `Type=primary, Size=sm, State=hover`；`""` 表示默认变体 | 只有 `MODE=tree` 用 |

3. 返回值是一段 **JSON 字符串**：立刻用 `write` 工具原样写盘（不要把 JSON 再包一层引号或代码块）：

| 调用 | 写到 |
|---|---|
| `MODE=variants` | `vibeme-design-system/data/figma-export/components/<slug>.variants.json` |
| `MODE=tree` + `VARIANT=""` | `vibeme-design-system/data/figma-export/components/<slug>.tree.json` |
| `MODE=tree` + 某个关键变体 | `vibeme-design-system/data/figma-export/components/<slug>.tree.<短标签>.json`（如 `button.tree.secondary-hover.json`） |

4. 用 python 校验能 `json.load`、`ok == true`、`bytes` 与真实字节数接近。

## 两种 MODE

- **`variants`**：把组件集**全部变体**各导出一条「浅层但完整」的记录（不展开子节点）。
  用来写「各变体的事实」表：每个变体的尺寸、填充栈、描边、圆角、内边距、不透明度、绑定的变量。
- **`tree`**：只导出**一个**变体的完整结构树（默认最多 6 层）。
  用来写「结构」段：层级、每个部件的尺寸/Auto Layout/填充/圆角/文字样式/内嵌实例。
  一个组件通常需要 2 棵树：默认变体 + 一个**对比变体**（尺寸最大的一档，或 `selected` / `checked` /
  `error` / `open` 之类的状态变体），这样能看出子元素的差异。

## 顶层字段

| 字段 | 含义 |
|---|---|
| `scriptVersion` | 脚本版本（当前 `"2"`） |
| `slug` / `setId` / `setName` / `description` | 组件集标识与描述 |
| `mode` / `variant` / `variantCount` / `defaultVariant` | 本次导出的模式、目标变体、变体总数、默认变体名 |
| `defs` | `componentPropertyDefinitions`：属性名 → `{type, values, default}`（属性名可能带 `#id` 后缀，如 `label#56058:0`） |
| `variablesUsed` | 本次用到的变量表：`[{id, name}]`。**下标即节点里的 `v` 值** |
| `instances` | 内嵌实例统计 `{主组件名: 次数}` |
| `variants` | （`variants` 模式）每个变体的浅层事实 |
| `tree` | （`tree` 模式）选中变体的结构树 |
| `trimmed` | 为了不超字节上限做的降级动作列表；**空数组表示完整** |
| `bytes` / `bytesUtf8` / `chars` / `ok` | 体积与状态自检 |

节点里的 `v` 字段是**变量下标**，用 `variablesUsed[v].name` 还原成变量名。
**每个导出文件有自己的 `variablesUsed` 表，不要跨文件复用下标。**

## 硬约束：48 KB 上限

`mcp__figma__use_figma` 的返回值上限约 **48000 字节**，超了直接报错。脚本内置了预算
（`MAX_BYTES=46000`，硬线 `HARD_BYTES=47800`）与自动降级：

1. 先截断文本内容长度；
2. 再降低 `tree` 的展开层数；
3. 每一步都记进 `trimmed`。

所以：**看到 `trimmed` 非空不是错误**，但要在报告里说明，必要时改用「一个变体一次调用」把细节补齐。

## 已知坑（脚本已处理，改脚本时别改回去）

1. `boundVariables.fills[i]` 的顺序**可能**与 `fills[i]` 相反（Button secondary 曾出现
   `#202020` 被标成 `White/White-7`）。脚本改为优先读 **paint 级** `paint.boundVariables.color.id`，
   node 级仅兜底。
2. `fontSize` / `fontName` / `lineHeight` / `letterSpacing` 可能是 `figma.mixed`（symbol），
   直接拼字符串会抛错；脚本先判类型。
3. 数值型变量用于**不透明度**时是百分数（`38` = 38%），不是 `0.38`。
4. 组件集里可能根本没有实例（`instances` 为空对象），不代表导出失败。
5. `auto.vars.pad` 数组与 `auto.pad` 的**下标不对齐**（实测 Input 的 `pad [0,16,0,16]` 对应
   `vars.pad [null,0,null,0]`，只有横向那一项有变量）。取内边距数值请用 `auto.pad`；
   `vars.pad` 只当作「这四个方向里有没有绑定变量」的弱信号，不要按下标取名字。
