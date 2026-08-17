# NexoToken Radar 完整产品设计

## 1. 决策与范围

NexoToken Radar 是部署在 `https://radar.nexotoken.net` 的独立公开网站，使用独立 GitHub 仓库 `18534516725/NexoToken-Radar`、独立容器和独立发布流程。它由 NexoToken 运营，但使用公开、统一、可复现的方法评价包括 NexoToken 在内的所有 AI API Provider。

本次交付覆盖原始产品方案中的完整 Radar 能力：Provider 目录、模型目录、价格比较、实时 Benchmark、Coding Agent 兼容性测试、用户自助 API 检测、公开报告、历史趋势、数据下载、Provider 收录和认领、重新测试、方法论、告警订阅、赞助披露、管理后台、公开 API、Agent Doctor 下载与 NexoToken 品牌承接。不建设 Compute Pool、凭证托管或算力交易市场，因为原始方案明确排除这些能力。

## 2. 品牌与独立性

- 产品名称：`NexoToken Radar`
- 描述：`Independent AI API benchmark and compatibility data, operated by NexoToken.`
- 主域名：`radar.nexotoken.net`
- 主站关系：页眉和页脚提供克制的 NexoToken 品牌归属与主站链接；榜单不默认置顶 NexoToken。
- Agent Doctor：展示为 `Agent Doctor by NexoToken`，链接到公开 GitHub Releases，不把安装包放入 Radar 仓库。
- 视觉方向：明亮的“实验室编辑部”风格，以暖白纸面、墨蓝文字、翡翠绿状态色和少量电蓝数据标记构成；避免霓虹暗色、玻璃拟态、模板化卡片海洋。
- 字体：标题使用有技术识别度的 display sans，正文使用清晰的人文 sans；代码与数据使用专用等宽字体。

## 3. 用户与核心任务

### 开发者

1. 比较价格、稳定性、延迟和兼容性。
2. 输入 Base URL、API Key、模型与目标工具进行一次性检测。
3. 下载 Agent Doctor 在本地持续诊断。
4. 订阅 Provider 状态或价格变化提醒。

### Provider 运营者

1. 提交站点收录。
2. 通过域名验证认领档案。
3. 补充公开价格、模型和联系信息。
4. 申请重新测试或纠正资料。

### Radar 管理员

1. 审核收录与认领。
2. 管理 Provider、模型映射、探针计划和赞助披露。
3. 查看探针失败、成本和队列状态。
4. 发布月度报告。

## 4. 页面与路由

### 公开页面

- `/`：Radar 首页，展示搜索、最新状态、价格、可靠性、Claude Code/Codex 兼容榜单和两类 CTA。
- `/providers`：Provider 总目录与筛选排序。
- `/providers/[slug]`：独立可索引档案、价格、历史指标、兼容矩阵、数据来源和纠错入口。
- `/models`、`/models/[slug]`：模型目录和跨 Provider 比较。
- `/benchmarks`、`/benchmarks/[slug]`：Benchmark 数据集、观察窗口、下载和永久链接。
- `/compatibility/claude-code`、`/compatibility/codex`、`/compatibility/cursor`：Coding Agent 专项榜单。
- `/rankings/cheapest`、`/rankings/fastest`、`/rankings/reliable`、`/rankings/most-tested`：单指标榜单。
- `/doctor`：安全自助检测。
- `/reports/[publicId]`：用户主动公开的检测报告。
- `/submit`：Provider 收录申请。
- `/claim/[providerSlug]`：Provider 认领。
- `/methodology`：指标、测试环境、评分和限制。
- `/data`：CSV、JSON、公开 API 与许可证。
- `/reports/monthly/[month]`：月度可靠性报告。
- `/agent-doctor`：Agent Doctor 功能、平台支持和下载入口。
- `/about`、`/privacy`、`/terms`、`/corrections`、`/sponsorship`：治理与政策。
- 所有核心公开页面提供 `/zh/...` 和 `/en/...` 的可索引语言版本，根路径根据默认语言展示但 canonical 固定。

### 管理页面

- `/admin/login`
- `/admin/providers`
- `/admin/submissions`
- `/admin/claims`
- `/admin/probes`
- `/admin/models`
- `/admin/sponsors`
- `/admin/reports`
- `/admin/system`

## 5. 技术架构

采用单仓库模块化单体，不拆微服务：

- Next.js App Router + TypeScript
- React Server Components 用于公开数据正文和 SEO
- MySQL 8，与中转站共用实例但使用 `radar_` 前缀表和独立最小权限账号
- `mysql2` + 明确 SQL repository，不引入第二套数据库
- 数据库任务表实现探针队列；`radar-worker` 使用同一镜像运行 worker 命令
- Vitest 负责单元/集成测试，Playwright 负责核心页面与表单端到端测试
- Docker Compose 独立定义 `radar-web` 与 `radar-worker`
- Nginx 将 `radar.nexotoken.net` 反代到 Radar Web，不改动现有中转站容器

## 6. 数据与表

所有新表使用 `radar_` 前缀：

- `radar_providers`
- `radar_models`
- `radar_provider_models`
- `radar_price_snapshots`
- `radar_probe_schedules`
- `radar_probe_jobs`
- `radar_probe_runs`
- `radar_probe_results`
- `radar_daily_provider_stats`
- `radar_public_reports`
- `radar_provider_submissions`
- `radar_provider_claims`
- `radar_correction_requests`
- `radar_alert_subscriptions`
- `radar_sponsorships`
- `radar_monthly_reports`
- `radar_audit_events`

价格分为 `provider_published`、`public_source` 和 `observed_billing`，不得把公开标价描述成实测计费。所有统计保存观察窗口、探针区域、样本量和计算版本。

## 7. 自助检测安全设计

用户提交：Base URL、API Key、模型、协议和目标工具。API Key 只保存在当前请求的内存变量中，不进入数据库、日志、异常追踪、分析事件或公开报告。

请求防护：

- 只允许 HTTPS；开发环境可显式允许 localhost。
- DNS 解析后拒绝 loopback、link-local、私网、保留网段和云元数据地址。
- 禁止自动重定向；每次连接前重新校验目标地址。
- 限制端口、总时长、响应体大小、输出 token 和并发。
- 所有错误经过安全归类，只返回认证、模型访问、协议、超时、限流和上游服务异常等通用类别。
- 日志中只记录规范化域名哈希、模型、指标、时间和错误类别。
- 公开报告默认关闭；只有用户主动选择才生成，且不包含凭证、请求正文、响应正文和账户信息。
- 匿名贡献默认关闭；主动同意时只保存域名、模型、HTTP 类别、延迟、能力结果和时间。

## 8. Benchmark 与评分

第一层原始指标：Connectivity、Authentication、Model Access、Success Rate、TTFT、Total Latency、Streaming、Tool Calling、Structured Output、Prompt Cache、Context、Usage Accounting、Rate Limit Behavior、Multi-turn Stability。

每条数据必须展示模型、协议、探针区域、测试时间、窗口、样本量、超时、重试规则和来源。单次测试不能生成长期可靠性结论。

榜单分为 Cheapest、Fastest、Most Reliable、Claude Code Compatibility、Codex Compatibility、Cursor Compatibility 和 Most Tested。综合分使用公开公式：30% Reliability、20% Compatibility、20% Performance、15% Price、10% Confidence、5% Transparency。NexoToken 与其他 Provider 使用完全相同的公式。

置信度初始规则：少于 20 次为 Low，20–100 次为 Medium，超过 100 次为 High；统计同时显示独立观察来源数量。

## 9. 收录、认领与治理

收录表单采集站点名称、官网、Base URL、文档、价格、状态页、协议、模型、工具、支付方式、最低充值、联系邮箱和备注。提交进入待审核状态，后台审核后发送结果通知。

认领支持 DNS TXT、指定路径文件或官方域名邮箱三种验证。Provider 可更新自述、Logo、链接和公开价格，但不能修改 Radar 实测结果。纠错、重测和申诉都保留审计记录。

赞助位必须显示 `Sponsored`，不得改变自然榜单顺序或分数。

## 10. SEO、GEO 与开放数据

- 公开页面使用服务端输出的完整正文，不依赖客户端加载关键数据。
- 每页提供 canonical、hreflang、Open Graph、Twitter Card、BreadcrumbList。
- Provider 使用 Organization，Doctor 使用 SoftwareApplication，真实可下载报告使用 Dataset；结构化数据必须与可见内容一致。
- 自动生成 sitemap 分片、robots.txt、RSS、JSON Feed、`llms.txt` 和 `llms-full.txt`。
- Benchmark 提供版本化 CSV/JSON、来源、方法、许可证、更新时间和永久 URL。
- IndexNow 在页面新增、更新和删除后提交；Google 通过 sitemap 和 Search Console 管理。
- 只有具备独立数据和足够正文的 Provider/模型页面才进入 sitemap；数据不足页面使用 noindex。

## 11. 数据流

自动探针：Scheduler → `radar_probe_jobs` → Worker → 安全请求器 → 标准化结果 → 聚合任务 → Provider/榜单/报告页面。

用户检测：浏览器 → Turnstile/限流 → 输入校验与 SSRF 防护 → 内存中使用 API Key → 返回即时结果 → 用户可选匿名贡献或公开报告。

Provider 提交：公开表单 → 校验和反垃圾 → 待审核记录 → 管理员审核 → Provider 档案 → sitemap/IndexNow。

## 12. 错误与可观测性

- 所有公开错误使用固定错误码和用户可理解文本，不回显原始第三方错误。
- Worker 使用租约、重试上限、指数退避和死信状态，避免重复任务。
- 健康检查分别覆盖 Web、数据库、worker 心跳和队列积压。
- 日志使用结构化字段并默认脱敏；审计事件不存凭证与请求正文。

## 13. 测试与发布门槛

- 单元测试：URL 安全、脱敏、评分、统计、价格标准化、权限和验证令牌。
- 集成测试：Repository、API 路由、任务租约、报告生成和审核状态机。
- E2E：目录筛选、用户检测、收录申请、认领、管理员审核和下载。
- 安全测试：SSRF、DNS rebinding、重定向、超时、超大响应、日志泄密和速率限制。
- SEO 测试：服务端正文、canonical、hreflang、JSON-LD、sitemap、noindex。
- 发布必须通过 lint、typecheck、test、build、Playwright、迁移 dry-run 和容器健康检查。

## 14. 部署边界

Radar 通过独立 Git 仓库发布到现有服务器的独立目录和 Compose project。数据库迁移文件进入 Git；真正执行迁移前展示精确 SQL 并取得确认。部署只构建和更新 Radar Web/Worker，不重启 `payment-platform` 的前端、后端或数据库容器。

