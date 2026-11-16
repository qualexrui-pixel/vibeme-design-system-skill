# 参考实现的验证怎么做（可复现）

`tools/validate.py` 只做**静态**检查：文件齐全、文档章节写全、CSS 里没有字面量颜色、`var(--vm-*)` 都有定义、props 接口与具名导出存在。
它**不能**证明这些 TSX 能编译、能渲染、CSS 真的生效。所以参考实现还要过下面三层验证。

| 层 | 工具 | 抓什么 | 期望 |
|---|---|---|---|
| 1. 类型检查 | TypeScript `tsc` | 类型错误、props 冲突、错的导入 | 0 error |
| 2. 冒烟渲染 | `react-dom/server` | 运行时崩溃（缺默认值、hooks 误用、undefined 访问） | 48/48 渲染出 HTML |
| 3. 计算样式抽查 | `puppeteer-core` + 本机 Chrome | CSS 是否真生效（token 是否落到计算值上） | 关键断言全过 |

> 这三层都**不属于** skill 运行时依赖，只是维护者验证用。验证环境放在仓库外（`/tmp`），不污染交付物。

## 1. 一次性搭环境

```bash
mkdir -p /tmp/vm-check && cd /tmp/vm-check
printf '{"name":"vm-check","private":true}' > package.json

NODE=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node
PNPM=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/pnpm/bin/pnpm.mjs
$NODE $PNPM add react@19 react-dom@19 puppeteer-core          # puppeteer-core 用本机 Chrome，不下载 Chromium
$NODE $PNPM add -D typescript@5 @types/react@19 @types/react-dom@19

# 让 tsc 能从组件目录向上找到 react 的类型
ln -sfn /tmp/vm-check/node_modules "<仓库根>/node_modules"     # 已被 .gitignore 忽略，验证完删掉
```

`/tmp/vm-check/tsconfig.json`：

```json
{
  "compilerOptions": {
    "target": "ES2020", "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "react-jsx", "module": "ESNext", "moduleResolution": "Bundler",
    "strict": true, "noEmit": true, "skipLibCheck": true,
    "esModuleInterop": true, "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true, "types": ["react", "react-dom"]
  },
  "include": [
    "<仓库根>/vibeme-design-system/components/**/*.ts",
    "<仓库根>/vibeme-design-system/components/**/*.tsx",
    "css.d.ts"
  ]
}
```

`css.d.ts`：`declare module '*.css';`（让 tsc 接受 `import './X.css'`）

`loader.mjs`（Node 不认识 CSS 导入，用 loader 吞掉）：

```js
export async function resolve(specifier, context, next) {
  if (specifier.endsWith('.css'))
    return { url: 'data:text/javascript,export default {};', shortCircuit: true, format: 'module' };
  return next(specifier, context);
}
```

`register.mjs`：

```js
import { register } from 'node:module';
register('./loader.mjs', import.meta.url);
```

`smoke.mjs`：遍历 `out/index.js` 的所有导出，跳过非组件导出（常量、数组），对每个组件用
`renderToStaticMarkup(React.createElement(C, {}))` 渲染一次，打印 `OK/FAIL + html 长度` 与成功/失败计数。

`fix-imports.py`：把 tsc 产物里无扩展名的相对导入补成 `./X.js` 或 `./X/index.js`
—— Node ESM 不支持目录导入，不补就跑不起来。

## 2. 跑三层验证

```bash
cd /tmp/vm-check
NODE=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/node/bin/node
PY=/Users/Zhuanz/.dsh/dsh-runtimes/dsh-primary-runtime/dependencies/python/bin/python3

# 层 1：类型检查
$NODE node_modules/typescript/bin/tsc -p tsconfig.json

# 层 2：编译 + 修后缀 + 冒烟渲染
rm -rf out && $NODE node_modules/typescript/bin/tsc -p tsconfig.json --noEmit false --outDir out && $PY fix-imports.py out
$NODE --import ./register.mjs smoke.mjs | tail -6
```

层 3（计算样式抽查）思路：用 `puppeteer-core` 指向本机 Chrome
（`executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`），
把组件渲染成 HTML、注入 `vibeme-design-system/components/tokens.css`，然后 `getComputedStyle` 断言，例如：

| 断言 | 期望 |
|---|---|
| Button `type=primary` 的高度 / 圆角 | `32/40/48px`（按 size）、`12px` |
| Button hover 的 `background-image` | 含 `rgba(255, 255, 255, 0.08)`（`--vm-white-7` 叠加层） |
| Input `:hover` 的 `border-color` | `rgba(255, 255, 255, 0.3)`（`--vm-white-4`，**不是**叠加层） |
| Input `disabled` 的 `opacity` | `0.38` |
| Modal 面板的 `box-shadow` | 与 `--vm-elevation-4` 一致 |

## 3. 本次（v1.0.0）验证记录

执行时间：2026-11-16。四层全部通过：

| 层 | 命令 | 结果 |
|---|---|---|
| 生成物一致性 | `python3 tools/gen-tokens.py --check` | 3 个生成物与 Figma 导出真源一致 |
| 仓库一致性 | `python3 tools/validate.py` | 48 个组件，0 错误 0 警告 |
| 类型检查 | `tsc -p tsconfig.json` | 0 error（strict） |
| 冒烟渲染 | `node --import ./register.mjs smoke.mjs` | 渲染成功 49 个，失败 0 个（跳过的非组件导出 8 个） |
| 计算样式 | `puppeteer-core` + 本机 Chrome | 45/45 断言通过；49 导出 × 93 实例、385 元素全量扫描，组件自有文字 0 处纯黑 |

这一轮验证**真的抓到了问题并已修掉**（详见 [../CHANGELOG.md](../CHANGELOG.md) 的「验证中发现并修掉的问题」）：
2 个类型冲突、4 个组件的必填 prop 崩溃、5 处 `:hover` 压过 `:focus-visible` 的优先级 bug、1 个损坏的导出 JSON。

审计断言表、失败项处理与全量扫描明细：`tools/style-audit-report.md`。

## 4. 踩过的坑

1. **pnpm 会按 `package.json` 的依赖列表裁剪 `node_modules`**：手改 `package.json` 时若把依赖删了，下次 `pnpm add/rebuild` 会把 typescript 清掉，表现为 `Cannot find module '.../typescript/bin/tsc'`。
2. **esbuild 的 postinstall 默认被 pnpm 忽略**（`onlyBuiltDependencies` 现在要写在 `pnpm-workspace.yaml`）。本方案不需要 esbuild，用 tsc 出 JS 即可。
3. **`node_modules` 必须在仓库根**（软链也算），否则 tsc/esbuild 从组件目录向上找不到 `react` 的类型。
4. **`Table` 这样的组合组件会 import 兄弟组件目录**，所以补 ESM 后缀时要处理 `./X` 与 `../X` 两种形态，不能只改桶文件。
