import { SubmissionForm } from '@/components/submission/SubmissionForm';
import { pageMetadata } from '@/lib/pageMetadata';
import { publicRoute } from '@/lib/publicRoutes';
const route = publicRoute('/submit'); export const metadata = pageMetadata(route);
export default function Page(){ return <article className="feature-page shell"><header className="feature-page__header"><p className="eyebrow">{route.eyebrow}</p><h1>{route.heading}</h1><p>{route.description}</p></header><SubmissionForm/></article>; }
