# Pull Request 模板

请在提交 PR 时填充以下信息，便于评审与自动化验证：

- 变更类型（请选择）：`fix` / `feat` / `docs` / `test` / `chore` / `refactor`
- 关联 issue（若有）：#<issue-number>
- 变更简述（两三句话）：
- 是否需要更新文档：是 / 否（若是，请指明文件）
- 测试指引（如何在本地复现变更并运行测试）：

示例：

```
feat: add temperature sampling spec

关联: #12
变更简述: 新增色温滑块采样 100K 的事件契约与测试向量
 文档: docs/需求和公式原理文档.md / docs/技术框架和技术栈框架.md / docs/用户界面操作文档.md
测试: npm run test:unit && npm run test:e2e
```
