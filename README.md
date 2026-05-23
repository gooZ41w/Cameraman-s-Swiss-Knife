# 穷哥们的摄影小帮手

当前版本：`build 1.1.1`

一个面向摄影现场使用的纯前端摄影工具。项目优先适配安卓竖屏与单手触控场景，视觉方向是暗场、克制、数值优先的现场拍摄工具，而不是内容型网站或营销页。

## 当前状态

- 首页已重做为暗色入口页，功能入口平级展示。
- 功能页采用独立页面结构，不再作为首页子项嵌套。
- ND 曝光计算器是当前重点功能，已优化滚动/滑动切换交互。
- 景深、色温等功能保留领域计算与测试基础，页面会按新规范逐步重建。
- Android APK 可通过本地 Capacitor 封装流程生成；生成工程与 APK 产物默认不进入仓库。

## 功能清单

- ND 曝光计算器
- 大光比助手（开发中）
- 景深计算器
- 放大倍率换算（开发中）
- 色温与色相预览（开发中）
- 参数斗蛐蛐助手（开发中）
- 摄影小知识（待开放）

## 快速开始

```bash
npm install
npm run dev
```

启动后在浏览器中打开 Vite 提示的本地地址。

## 常用命令

```bash
npm run build
npm run preview
npm run test:unit
npm run test:e2e
npm run visual:diff
```

## Android 打包

项目使用 Capacitor 做本地 Android 封装。为避免上传本机 SDK 路径、原生构建缓存、APK 产物和签名文件，`android/`、`capacitor.config.ts`、`*.apk`、`*.aab`、`local.properties`、`*.keystore`、`*.jks` 等均已加入 `.gitignore`。

本地封装时需要准备 JDK 与 Android SDK，然后执行：

```bash
npm run android:sync
npm run android:apk
```

生成的 debug APK 通常位于：

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## 技术栈

- React 18
- Vite
- TypeScript
- Zustand
- Capacitor
- Vitest
- Playwright
- 全局 CSS

## 项目结构

```text
src/
  domain/          公式与领域计算
  stores/          页面状态
  utils/           交互与通用工具
  presentation/    页面、组件、格式化与样式

docs/
  需求和公式原理文档.md
  页面内容与控件规范.md
  项目视觉设计系统.md
  技术框架和技术栈框架.md

tests/
  unit/            领域计算与格式化测试
  e2e/             页面交互与视觉回归测试

archive/
  conversation_history.md
```

## 文档入口

- [需求和公式原理文档](docs/需求和公式原理文档.md)
- [页面内容与控件规范](docs/页面内容与控件规范.md)
- [项目视觉设计系统](docs/项目视觉设计系统.md)
- [技术框架和技术栈框架](docs/技术框架和技术栈框架.md)

## 维护约定

- 需求文档只记录功能用途和公式原理。
- 页面内容与控件规范只记录页面层级、输入控件和输出控件。
- 视觉、布局、交互细节优先沉淀到视觉设计系统或实现文档中。
- 任何公式、阈值、结果格式或核心交互的调整，都应同步更新测试与文档。
