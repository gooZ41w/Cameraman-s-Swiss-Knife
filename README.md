# 摄影助手 App

一个面向摄影爱好者的纯前端计算工具，提供曝光计算、景深计算和色温预览等功能，适合快速查算与现场参考。

## 功能

- ND曝光计算器
- 大光比助手（开发中）
- 景深计算器
- 放大倍率换算（开发中）
- 色温与色相预览
- 参数斗蛐蛐助手（镜头参数对比）
- 摄影小知识（待开放）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发环境

```bash
npm run dev
```

启动后在浏览器中打开 Vite 提示的本地地址。

### 3. 生产构建

```bash
npm run build
```

### 4. 预览构建结果

```bash
npm run preview
```

## 测试

### 单元测试

```bash
npm run test:unit
```

### E2E 测试

```bash
npm run test:e2e
```

## 技术栈

- React 18
- Vite
- TypeScript
- Zustand
- Vitest
- Playwright
- 全局 CSS 样式

## 项目结构

```text
src/
  domain/          公式与领域计算
  stores/          页面状态
  presentation/    页面、组件和样式

docs/
  需求和公式原理文档.md
  技术框架和技术栈框架.md
  用户界面操作文档.md

tests/
  unit/
  e2e/
```

## 文档

- [需求和公式原理文档](docs/需求和公式原理文档.md)
- [技术框架和技术栈框架](docs/技术框架和技术栈框架.md)
- [用户界面操作文档](docs/用户界面操作文档.md)

## 说明

- 核心公式位于 `src/domain/`
- 页面交互位于 `src/presentation/`
- 任何阈值、公式或结果显示格式的调整，都应同步更新测试与文档
