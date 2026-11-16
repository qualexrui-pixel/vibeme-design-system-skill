# VibeMe 设计 token 真源

> 本文件由 tools/gen-tokens.py 自动生成，请勿手改；改 tools/token-map.json 后重新生成。

> 真源：Figma [`ZO4WH3sbVCj7lZIFMpiwV9`](https://www.figma.com/design/ZO4WH3sbVCj7lZIFMpiwV9/VibeMe-App---Web-Design-%E5%A4%87%E4%BB%BD?node-id=56054-5521) 的变量与样式；本文件是它的完整快照。

规模：**169 个 token**（另有 22 个历史遗留变量不纳入）· **19 个文字样式** · **4 组海拔阴影** · 15 个颜色样式 · 4 组栅格样式。


## 怎么用

- **CSS**：引 `components/tokens.css`，然后一律用 `var(--vm-xxx)`，不要硬编码色值/间距/圆角/字号。
- **TS/JS**：读 `data/tokens.json`（含 `figmaName` ↔ `cssVar` ↔ 解析值的完整映射，可做主题或校验）。
- **命名规则**：`--vm-` + 变量名（`Brand/Brand` → `--vm-brand`，`Background/bg-card` → `--vm-bg-card`）；少数需要消歧的写在 `tools/token-map.json` 的 `overrides` 里。中文集合名映射：`状态色/*` → `--vm-status-*`，`VibeMe AI / *` → `--vm-ai-*`。
- **别名**：表里 `→ 目标` 表示该 token 是别名（Figma VARIABLE_ALIAS），值已按同一 mode 解析成最终值。
- **百分比语义**：`opacity/*` 在 Figma 里是 `38`、`60`、`100`（百分数），落地成 CSS 是 `0.38`、`0.6`、`1`。

## 字体 Typography

`font-family`：`"Poppins", "PingFang SC", "Microsoft YaHei", system-ui, -apple-system, "Segoe UI", sans-serif`


| 文字样式 | CSS 类 | 字号 | 字重 | 行高 | 字距 |
|---|---|---|---|---|---|
| `Display/4XL` | `.vm-type-display-4xl` | 64px | 700 Bold | 72px | 0em |
| `Heading/XXL` | `.vm-type-heading-xxl` | 24px | 700 Bold | 36px | 0em |
| `Heading/XL` | `.vm-type-heading-xl` | 20px | 700 Bold | 30px | 0em |
| `Heading/L` | `.vm-type-heading-l` | 18px | 700 Bold | 26px | 0em |
| `Heading/M` | `.vm-type-heading-m` | 16px | 600 SemiBold | 24px | 0em |
| `Heading/S` | `.vm-type-heading-s` | 14px | 600 SemiBold | 20px | 0em |
| `Caption/Caption` | `.vm-type-caption-caption` | 12px | 500 Medium | 18px | 0em |
| `Caption/Label` | `.vm-type-caption-label` | 10px | 500 Medium | 14px | 0em |
| `Heading/Body/L/Regular` | `.vm-type-heading-body-l-regular` | 18px | 400 Regular | 28px | 0em |
| `Heading/Body/L/Medium` | `.vm-type-heading-body-l-medium` | 18px | 400 Regular | 28px | 0em |
| `Heading/Body/L/SemiBold` | `.vm-type-heading-body-l-semibold` | 18px | 600 SemiBold | 28px | 0em |
| `Heading/Body/M/Regular` | `.vm-type-heading-body-m-regular` | 16px | 400 Regular | 24px | 0em |
| `Heading/Body/M/Medium` | `.vm-type-heading-body-m-medium` | 16px | 400 Regular | 24px | 0em |
| `Heading/Body/M/SemiBold` | `.vm-type-heading-body-m-semibold` | 16px | 600 SemiBold | 24px | 0em |
| `Heading/Body/S/Regular` | `.vm-type-heading-body-s-regular` | 14px | 400 Regular | 20px | 0em |
| `Heading/Body/S/Medium` | `.vm-type-heading-body-s-medium` | 14px | 500 Medium | 20px | 0em |
| `Heading/Body/S/SemiBold` | `.vm-type-heading-body-s-semibold` | 14px | 400 Regular | 20px | 0em |
| `Heading/XS` | `.vm-type-heading-xs` | 12px | 600 SemiBold | 18px | 0em |
| `Display/3XL` | `.vm-type-display-3xl` | 48px | 400 Regular | 56px | 0em |

**⚠ 命名与字体不一致（照抄前先看这里）**：
- `Heading/Body/L/Medium`：样式名写着 Medium（500），实际字体是 Regular（400）
- `Heading/Body/M/Medium`：样式名写着 Medium（500），实际字体是 Regular（400）
- `Heading/Body/S/SemiBold`：样式名写着 SemiBold（600），实际字体是 Regular（400）


## 品牌色 Brand

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Brand/Brand` | `--vm-brand` | `#FFCC90` |
| `Brand/Brand-Hover` | `--vm-brand-hover` | `#FFC07A` |
| `Brand/Brand-Disable` | `--vm-brand-disable` | `#875229` |
| `Brand/Brand-900` | `--vm-brand-900` | `#3A2112` |
| `Brand/Brand-950` | `--vm-brand-950` | `#2B1F12` |
| `Brand/Brand_100` | `--vm-brand-100` | `#FFF1DF` |


## 文字 Text

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Text/Text-Primary` | `--vm-text-primary` | `rgba(255, 255, 255, 0.92)　→ `White/White-1`` |
| `Text/Text-Secondary` | `--vm-text-secondary` | `rgba(255, 255, 255, 0.64)　→ `White/White-2`` |
| `Text/Text-Tertiary` | `--vm-text-tertiary` | `rgba(255, 255, 255, 0.3)　→ `White/White-4`` |
| `Text/Text-Disable` | `--vm-text-disable` | `rgba(255, 255, 255, 0.24)　→ `White/White-5`` |
| `Text/Text-Action` | `--vm-text-action` | `#FFCC90　→ `Brand/Brand`` |


## 背景与表面 Surface

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Background/bg-app` | `--vm-bg-app` | `#0E0E0E　→ `Neutral/Neutral-950`` |
| `Background/bg-page` | `--vm-bg-page` | `#121212　→ `Neutral/Neutral-900`` |
| `Background/bg-panel` | `--vm-bg-panel` | `#1A1A1A　→ `Neutral/Neutral-800`` |
| `Background/bg-card` | `--vm-bg-card` | `#202020　→ `Neutral/Neutral-750`` |
| `Background/bg-toast` | `--vm-bg-toast` | `#202020　→ `Neutral/Neutral-750`` |
| `Background/border-default` | `--vm-border-default` | `rgba(255, 255, 255, 0.12)　→ `White/White-6`` |
| `Background/border-selected` | `--vm-border-selected` | `rgba(255, 255, 255, 0.5)　→ `White/White-3`` |
| `Background/Surface-hover` | `--vm-surface-hover` | `#262626　→ `Neutral/Neutral-700`` |
| `Background/Surface-selected` | `--vm-surface-selected` | `#2A2A2A　→ `Neutral/Neutral-650`` |
| `Background/Surface-pressed` | `--vm-surface-pressed` | `#303030　→ `Neutral/Neutral-600`` |
| `Scrim/scrim-modal` | `--vm-scrim-modal` | `rgba(0, 0, 0, 0.56)　→ `Black/Black-3`` |


## 描边与聚焦 Border / Focus

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `border/width/thin` | `--vm-border-width-thin` | `1px` |
| `border/width/thick` | `--vm-border-width-thick` | `2px` |
| `focus/ring-width` | `--vm-focus-ring-width` | `2px` |
| `border/width/ring` | `--vm-border-width-ring` | `3px` |


## 中性色阶 Neutral

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Black/Black` | `--vm-black` | `#000000` |
| `Black/Black-3` | `--vm-black-3` | `rgba(0, 0, 0, 0.56)` |
| `Neutral/Neutral-950` | `--vm-neutral-950` | `#0E0E0E` |
| `Neutral/Neutral-900` | `--vm-neutral-900` | `#121212` |
| `Neutral/Neutral-850` | `--vm-neutral-850` | `#161616` |
| `Neutral/Neutral-800` | `--vm-neutral-800` | `#1A1A1A` |
| `Neutral/Neutral-750` | `--vm-neutral-750` | `#202020` |
| `Neutral/Neutral-700` | `--vm-neutral-700` | `#262626` |
| `Neutral/Neutral-650` | `--vm-neutral-650` | `#2A2A2A` |
| `Neutral/Neutral-600` | `--vm-neutral-600` | `#303030` |
| `Neutral/Neutral-550` | `--vm-neutral-550` | `#383838` |
| `Neutral/Neutral-500` | `--vm-neutral-500` | `#4D4D4D` |
| `Neutral/Neutral-400` | `--vm-neutral-400` | `#7F7F7F` |
| `Neutral/Neutral-300` | `--vm-neutral-300` | `#A3A3A3` |
| `Neutral/Neutral-250` | `--vm-neutral-250` | `#B4B4B4` |
| `Neutral/Neutral-100` | `--vm-neutral-100` | `#E0E0E0` |
| `White/White-0` | `--vm-white-0` | `#FFFFFF` |
| `White/White-1` | `--vm-white-1` | `rgba(255, 255, 255, 0.92)` |
| `White/White-2` | `--vm-white-2` | `rgba(255, 255, 255, 0.64)` |
| `White/White-3` | `--vm-white-3` | `rgba(255, 255, 255, 0.5)` |
| `White/White-4` | `--vm-white-4` | `rgba(255, 255, 255, 0.3)` |
| `White/White-5` | `--vm-white-5` | `rgba(255, 255, 255, 0.24)` |
| `White/White-6` | `--vm-white-6` | `rgba(255, 255, 255, 0.12)` |
| `White/White-7` | `--vm-white-7` | `rgba(255, 255, 255, 0.08)` |
| `White/White-8` | `--vm-white-8` | `rgba(255, 255, 255, 0.04)` |
| `White/White-9` | `--vm-white-9` | `rgba(255, 255, 255, 0.02)` |


## 状态色 Status

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `状态色/Error` | `--vm-status-error` | `#FF3B30` |
| `状态色/Success` | `--vm-status-success` | `#34C759` |
| `状态色/Warning` | `--vm-status-warning` | `#FFCC00` |
| `状态色/Info` | `--vm-status-info` | `#2797FF` |


## 间距与内边距 Space

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Semantic Space/padding-button-sm-x` | `--vm-padding-button-sm-x` | `12px　→ `space/space-3`` |
| `Semantic Space/padding-button-sm-y` | `--vm-padding-button-sm-y` | `8px　→ `space/space-2`` |
| `Semantic Space/padding-button-md-x` | `--vm-padding-button-md-x` | `16px　→ `space/space-4`` |
| `Semantic Space/padding-button-md-y` | `--vm-padding-button-md-y` | `10px　→ `space/space-2-5`` |
| `Semantic Space/padding-button-lg-x` | `--vm-padding-button-lg-x` | `20px　→ `space/space-5`` |
| `Semantic Space/padding-button-lg-y` | `--vm-padding-button-lg-y` | `12px　→ `space/space-3`` |
| `Semantic Space/padding-input-x` | `--vm-padding-input-x` | `16px　→ `space/space-4`` |
| `Semantic Space/padding-input-y` | `--vm-padding-input-y` | `12px　→ `space/space-3`` |
| `Semantic Space/padding-card-sm` | `--vm-padding-card-sm` | `16px　→ `space/space-4`` |
| `Semantic Space/padding-card-md` | `--vm-padding-card-md` | `20px　→ `space/space-5`` |
| `Semantic Space/padding-card-lg` | `--vm-padding-card-lg` | `24px　→ `space/space-6`` |
| `Semantic Space/padding-modal-x` | `--vm-padding-modal-x` | `24px　→ `space/space-6`` |
| `Semantic Space/padding-modal-y` | `--vm-padding-modal-y` | `20px　→ `space/space-5`` |
| `Semantic Space/padding-badge-x` | `--vm-padding-badge-x` | `10px　→ `space/space-2-5`` |
| `Semantic Space/padding-badge-y` | `--vm-padding-badge-y` | `4px　→ `space/space-1`` |
| `Semantic Space/padding-toast-x` | `--vm-padding-toast-x` | `16px　→ `space/space-4`` |
| `Semantic Space/padding-toast-y` | `--vm-padding-toast-y` | `12px　→ `space/space-3`` |
| `Semantic Space/padding-popover` | `--vm-padding-popover` | `16px　→ `space/space-4`` |
| `space/space-0` | `--vm-space-0` | `0px` |
| `space/space-1` | `--vm-space-1` | `4px` |
| `space/space-1-5` | `--vm-space-1-5` | `6px` |
| `space/space-2` | `--vm-space-2` | `8px` |
| `space/space-2-5` | `--vm-space-2-5` | `10px` |
| `space/space-3` | `--vm-space-3` | `12px` |
| `space/space-4` | `--vm-space-4` | `16px` |
| `space/space-5` | `--vm-space-5` | `20px` |
| `space/space-6` | `--vm-space-6` | `24px` |
| `space/space-8` | `--vm-space-8` | `32px` |
| `space/space-10` | `--vm-space-10` | `40px` |
| `space/space-12` | `--vm-space-12` | `48px` |
| `space/space-16` | `--vm-space-16` | `64px` |
| `space/space-0-5` | `--vm-space-0-5` | `2px` |


## 圆角 Radius

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Semantic Radius/radius-button` | `--vm-radius-button` | `12px　→ `Radious/radius-lg`` |
| `Semantic Radius/radius-input` | `--vm-radius-input` | `12px　→ `Radious/radius-lg`` |
| `Semantic Radius/radius-card` | `--vm-radius-card` | `12px　→ `Radious/radius-lg`` |
| `Semantic Radius/radius-avatar` | `--vm-radius-avatar` | `999px　→ `Radious/radius-full`` |
| `Semantic Radius/radius-badge` | `--vm-radius-badge` | `4px　→ `Radious/radius-xs`` |
| `Semantic Radius/radius-toast` | `--vm-radius-toast` | `12px　→ `Radious/radius-lg`` |
| `Radious/radius-none` | `--vm-radius-none` | `0px` |
| `Radious/radius-xs` | `--vm-radius-xs` | `4px` |
| `Radious/radius-sm` | `--vm-radius-sm` | `6px` |
| `Radious/radius-md` | `--vm-radius-md` | `8px` |
| `Radious/radius-lg` | `--vm-radius-lg` | `12px` |
| `Radious/radius-xl` | `--vm-radius-xl` | `16px` |
| `Radious/radius-2xl` | `--vm-radius-2xl` | `24px` |
| `Radious/radius-3xl` | `--vm-radius-3xl` | `32px` |
| `Radious/radius-full` | `--vm-radius-full` | `999px` |


## 组件尺寸 Component Size

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Modal Size/modal-sm` | `--vm-modal-sm` | `400px` |
| `Modal Size/modal-md` | `--vm-modal-md` | `520px` |
| `Modal Size/modal-lg` | `--vm-modal-lg` | `720px` |
| `Modal Size/modal-xl` | `--vm-modal-xl` | `880px` |
| `Modal Size/modal-2xl` | `--vm-modal-2xl` | `1120px` |


## 不透明度 Opacity

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `opacity/disabled` | `--vm-opacity-disabled` | `0.38` |
| `opacity/muted` | `--vm-opacity-muted` | `0.6` |
| `opacity/full` | `--vm-opacity-full` | `1` |


## 动效 Motion

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `duration/fast` | `--vm-duration-fast` | `100ms` |
| `duration/normal` | `--vm-duration-normal` | `200ms` |
| `duration/slow` | `--vm-duration-slow` | `300ms` |


## 扩展色板 Color Panel（主库未使用，备用）

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `Olive_50` | `--vm-olive-50` | `#F6F9F2` |
| `Olive_100` | `--vm-olive-100` | `#EDF3E7` |
| `Olive_200` | `--vm-olive-200` | `#DCE8D0` |
| `Olive_300` | `--vm-olive-300` | `#C4D6B3` |
| `Olive_400` | `--vm-olive-400` | `#9AB07A` |
| `Olive_950` | `--vm-olive-950` | `#12180E` |
| `Clay_Red_100` | `--vm-clay-red-100` | `#FBEAEA` |
| `Clay_Red_400` | `--vm-clay-red-400` | `#D99A9A` |
| `Clay_Red_950` | `--vm-clay-red-950` | `#1A0D0C` |
| `Soft_Blue_100` | `--vm-soft-blue-100` | `#EAF1FA` |
| `Soft_Blue_400` | `--vm-soft-blue-400` | `#88A4C8` |
| `Soft_Blue_950` | `--vm-soft-blue-950` | `#0E1520` |
| `Purple_100` | `--vm-purple-100` | `#F1E8FF` |
| `Purple_400` | `--vm-purple-400` | `#AA82F0` |
| `Purple_950` | `--vm-purple-950` | `#160E24` |
| `Pink_100` | `--vm-pink-100` | `#FFE8F0` |
| `Pink_400` | `--vm-pink-400` | `#EB7FA5` |
| `Pink_950` | `--vm-pink-950` | `#220D14` |
| `Cyan_100` | `--vm-cyan-100` | `#DDF5F3` |
| `Cyan_400` | `--vm-cyan-400` | `#63C7C1` |
| `Cyan_950` | `--vm-cyan-950` | `#0B2221` |


## VibeMe AI 主题（另一套 token，不要与主库混用）

| Figma 变量 | CSS 变量 | 值 |
|---|---|---|
| `spacing/4` | `--vm-ai-spacing-4` | `4px` |
| `spacing/8` | `--vm-ai-spacing-8` | `8px` |
| `spacing/12` | `--vm-ai-spacing-12` | `12px` |
| `spacing/16` | `--vm-ai-spacing-16` | `16px` |
| `spacing/20` | `--vm-ai-spacing-20` | `20px` |
| `spacing/24` | `--vm-ai-spacing-24` | `24px` |
| `radius/8` | `--vm-ai-radius-8` | `8px` |
| `radius/12` | `--vm-ai-radius-12` | `12px` |
| `radius/16` | `--vm-ai-radius-16` | `16px` |
| `radius/full` | `--vm-ai-radius-full` | `999px` |
| `neutral/950` | `--vm-ai-neutral-950` | `#080A11` |
| `neutral/900` | `--vm-ai-neutral-900` | `#121420` |
| `neutral/850` | `--vm-ai-neutral-850` | `#191B2A` |
| `neutral/700` | `--vm-ai-neutral-700` | `#383C52` |
| `neutral/400` | `--vm-ai-neutral-400` | `#8C91A8` |
| `white/1000` | `--vm-ai-white-1000` | `#FFFFFF` |
| `violet/500` | `--vm-ai-violet-500` | `#8547FF` |
| `violet/400` | `--vm-ai-violet-400` | `#A373FF` |
| `violet/950` | `--vm-ai-violet-950` | `#29174A` |
| `pink/400` | `--vm-ai-pink-400` | `#FF57AD` |
| `green/400` | `--vm-ai-green-400` | `#40D694` |
| `red/400` | `--vm-ai-red-400` | `#FF5766` |
| `color/bg/canvas` | `--vm-ai-color-bg-canvas` | `#080A11　→ `neutral/950`` |
| `color/bg/panel` | `--vm-ai-color-bg-panel` | `#121420　→ `neutral/900`` |
| `color/bg/raised` | `--vm-ai-color-bg-raised` | `#191B2A　→ `neutral/850`` |
| `color/bg/brand` | `--vm-ai-color-bg-brand` | `#8547FF　→ `violet/500`` |
| `color/bg/brand-hover` | `--vm-ai-color-bg-brand-hover` | `#A373FF　→ `violet/400`` |
| `color/bg/brand-soft` | `--vm-ai-color-bg-brand-soft` | `#29174A　→ `violet/950`` |
| `color/text/primary` | `--vm-ai-color-text-primary` | `#FFFFFF　→ `white/1000`` |
| `color/text/secondary` | `--vm-ai-color-text-secondary` | `#8C91A8　→ `neutral/400`` |
| `color/border/default` | `--vm-ai-color-border-default` | `#383C52　→ `neutral/700`` |
| `color/status/success` | `--vm-ai-color-status-success` | `#40D694　→ `green/400`` |
| `color/status/error` | `--vm-ai-color-status-error` | `#FF5766　→ `red/400`` |
| `color/accent/pink` | `--vm-ai-color-accent-pink` | `#FF57AD　→ `pink/400`` |


## 海拔阴影 Elevation

| Figma 效果样式 | CSS 变量 | 值 |
|---|---|---|
| `Elevation/1` | `--vm-elevation-1` | `0px 2px 4px 0px rgba(0, 0, 0, 0.24)` |
| `Elevation/2` | `--vm-elevation-2` | `0px 4px 12px 0px rgba(0, 0, 0, 0.28)` |
| `Elevation/3` | `--vm-elevation-3` | `0px 8px 24px 0px rgba(0, 0, 0, 0.32)` |
| `Elevation/4` | `--vm-elevation-4` | `0px 16px 40px 0px rgba(0, 0, 0, 0.4)` |


## 栅格样式（页面布局参考，非 CSS 变量）

- `4-通用性栅格16-12`：4 列 · 列间距 12 · 边距 16；行 · 间距 0
- `4-宽松型栅格16-16`：4 列 · 列间距 16 · 边距 16
- `12-通用型栅格32-16`：12 列 · 列间距 16 · 边距 32
- `12-通用型栅格32-20`：12 列 · 列间距 20 · 边距 32


## Figma 颜色样式（旧机制，仅供对照，不要在新代码里用）

| 样式名 | 颜色 |
|---|---|
| `Backgrounds/Primary` | `#0E0E0E` |
| `Backgrounds/Secondary` | `#1A1A1A` |
| `Backgrounds/Tertiary` | `#202020` |
| `Fills/Primary` | `#FFFFFF` |
| `Fills/Secondary` | `#FFFFFF` |
| `Fills/Tertiary` | `#FFFFFF` |
| `Fills/Quaternary` | `#FFFFFF` |
| `Labels/Primary` | `#FFFFFF` |
| `Labels/Secondary` | `#FFFFFF` |
| `Labels/Tertiary` | `#FFFFFF` |
| `Labels/Quaternary` | `#FFFFFF` |
| `Separators/Opaque` | `#1A1A1A` |
| `Separators/Non-opaque` | `#FFFFFF` |
| `Gradient` | `GRADIENT_LINEAR（6 个色标）` |
| `ui/color/primary` | `#6750A3` |


## 历史遗留变量（不要引用）

历史遗留命名：或与主体系语义重复（Text/灰/*、Text/辅助色、Text/副标题、正文），或命名错误（主色/Main Orange 的值其实是品牌砂色 #FFCC90），或与产品无关（Color 3/4、后台主色、绿色、按钮、分割线、标注用色）。写出新代码时一律不要引用，一律走主体系 token。


| 变量 | 集合 | 值 |
|---|---|---|
| `Color` | Variable collection | `#000000 @20%` |
| `Text/辅助色` | Variable collection | `#7F7F7F` |
| `Text/副标题、正文` | Variable collection | `#B4B4B4` |
| `button` | Variable collection | `#FFFFFF` |
| `按钮` | Variable collection | `#1C1C1E` |
| `分割线` | Variable collection | `#38383B` |
| `Color 3` | Variable collection | `#AA00FF` |
| `Color 4` | Variable collection | `#D685FF` |
| `绿色` | Variable collection | `#51EA44` |
| `Text/灰/Black` | Variable collection | `#000000` |
| `Text/灰/Gray1` | Variable collection | `#0E0E0E` |
| `Text/灰/深灰` | Variable collection | `#1A1A1A` |
| `Text/灰/中灰` | Variable collection | `#4D4D4D` |
| `Text/灰/浅灰` | Variable collection | `#B3B3B3` |
| `Text/灰/边框灰` | Variable collection | `#E0E0E0` |
| `Text/灰/666` | Variable collection | `#666666` |
| `主色/Main Orange` | Variable collection | `#FFCC90` |
| `标注色-1` | Variable collection | `#FFCC00` |
| `100%` | Variable collection | `0` |
| `100` | Variable collection | `20` |
| `标注用色` | Variable collection | `#FF5D5D` |
| `后台主色` | Variable collection | `#CEFF00` |

