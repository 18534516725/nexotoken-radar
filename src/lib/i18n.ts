export type Locale = 'zh' | 'en';

export const copy = {
  zh: {
    nav: ['供应商', '模型', '基准测试', '兼容性', '方法论'],
    submit: '提交供应商', test: '测试我的 API', switch: 'EN', switchLabel: '切换到英文',
    skip: '跳到主要内容', search: '搜索', searchPlaceholder: '供应商或描述', protocol: '协议', allProtocols: '所有协议', filter: '筛选目录',
    eyebrow: '供应商目录', heading: '让每个供应商，都在同一标准下接受测量。', description: '浏览带有来源标注价格、近期测试覆盖、编程 Agent 兼容性和透明可信度等级的 AI API 供应商。',
    queue: '证据队列', emptyTitle: '暂时还没有已验证并发布的供应商。', emptyDescription: '在来源完成审核并形成可复现的观测窗口前，申请内容会保持私密。', models: '模型数', freshness: '新鲜度', unobserved: '尚未观测',
    independent: '独立档案', claimed: '已认领', region: '地区未声明',
    explore: '探索', governance: '治理', openData: '开放数据', privacy: '隐私', about: '关于 Radar', statement: '由 NexoToken 运营的独立 AI API 基准与兼容性数据。', measurements: '测量结果，不代表背书。',
    doctor: { input: '私有测试输入', never: '钥匙绝不保存', base: '基础 URL', key: 'API 密钥', keyPlaceholder: '仅在本次测试内存中使用', model: '模型', modelPlaceholder: '模型标识符', protocol: '协议', tool: '目标工具', auth: '高级身份验证', header: '凭证请求头', auto: '按协议自动运行', bearer: 'Authorization: Bearer', consent: '与 Radar 分享匿名计时和兼容性指标。默认关闭；绝不会包含凭据和内容。', run: '运行兼容性序列', running: '正在运行受限测试…', fineprint: '只测试你有权使用的端点。测试受时间、响应大小和请求次数限制。', output: '序列输出', waiting: '等待', ready: '准备检查', readyDesc: '三个受限探针将检查访问、SSE 流式传输和结构化工具调用。', testing: '正在测试端点', testingDesc: '凭据仅存在于本次请求中，序列结束后会立即丢弃。', stopped: '测试已停止', stoppedDesc: '请查看公开错误，然后每次只修改一个输入。不会暴露供应商原始响应。', errorDefault: '测试无法完成，请检查基础 URL、模型和 API 密钥。', sequence: '完整兼容性序列' },
  },
  en: {
    nav: ['Providers', 'Models', 'Benchmarks', 'Compatibility', 'Methodology'],
    submit: 'Submit', test: 'Test my API', switch: '中文', switchLabel: 'Switch to Chinese',
    skip: 'Skip to content', search: 'Search', searchPlaceholder: 'Provider or description', protocol: 'Protocol', allProtocols: 'All protocols', filter: 'Filter directory',
    eyebrow: 'Provider directory', heading: 'Every provider, measured on the same surface.', description: 'Browse AI API providers with source-labelled pricing, recent test coverage, coding-agent compatibility and transparent confidence levels.',
    queue: 'Evidence queue', emptyTitle: 'No verified providers are published yet.', emptyDescription: 'Applications remain private until sources are reviewed and a reproducible observation window exists.', models: 'Models', freshness: 'Freshness', unobserved: 'Unobserved',
    independent: 'Independent profile', claimed: 'Claimed', region: 'Region not declared',
    explore: 'Explore', governance: 'Governance', openData: 'Open data', privacy: 'Privacy', about: 'About Radar', statement: 'Independent AI API benchmark and compatibility data, operated by NexoToken.', measurements: 'Measurements, not endorsements.',
    doctor: { input: 'Private test input', never: 'Key is never stored', base: 'Base URL', key: 'API key', keyPlaceholder: 'Used in memory for this test', model: 'Model', modelPlaceholder: 'Model identifier', protocol: 'Protocol', tool: 'Target tool', auth: 'Advanced authentication', header: 'Credential header', auto: 'Automatic by protocol', bearer: 'Authorization: Bearer', consent: 'Share anonymous timing and compatibility metrics with Radar. Off by default; credentials and content are never included.', run: 'Run compatibility sequence', running: 'Running bounded test…', fineprint: 'Only test an endpoint you are authorized to use. Tests are capped by time, response size and request count.', output: 'Sequence output', waiting: 'Waiting', ready: 'Ready to inspect', readyDesc: 'Three bounded probes check access, SSE streaming and structured tool calls.', testing: 'Testing endpoint', testingDesc: 'The credential stays inside this request and will be discarded when the sequence ends.', stopped: 'Test stopped', stoppedDesc: 'Review the public error, then change one input at a time. Raw provider responses are not exposed.', errorDefault: 'The test could not be completed. Check the Base URL, model and API key.', sequence: 'Complete compatibility sequence' },
  },
} as const;
