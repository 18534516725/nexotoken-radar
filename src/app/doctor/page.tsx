import { DoctorClient } from '@/components/doctor/DoctorClient';
import { pageMetadata } from '@/lib/pageMetadata';
import { publicRoute } from '@/lib/publicRoutes';

const route = publicRoute('/doctor');
export const metadata = pageMetadata(route);

export default async function Page() {
  const locale = 'zh' as const;
  return (
    <article className="feature-page shell">
      <header className="feature-page__header">
        <p className="eyebrow">{locale === 'zh' ? '私有一次性测试' : route.eyebrow}</p><h1>{locale === 'zh' ? '一个端点，完成一整套兼容性检查。' : route.heading}</h1><p>{locale === 'zh' ? '输入基础 URL、API 密钥、模型和目标工具，运行一次受限的私有测试；凭据只在内存中使用，绝不保存。' : route.description}</p>
      </header>
      <DoctorClient locale={locale} />
    </article>
  );
}
