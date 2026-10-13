import { pageMetadata } from '@/lib/seo';
import { PageHero } from '@/components/shared';
export const metadata=pageMetadata('/insights', "Insights", "Veda Group insights are being prepared.", false);
export default function Insights(){return <><PageHero label="Insights" title="Perspectives, when there is something to share." description="Our Insights section is being prepared."/><section className="section"><div className="container"><div className="empty-state"><p className="eyebrow">NOT YET PUBLISHED</p><h2>No articles are available yet.</h2><p>Approved articles and market perspectives will appear here when available.</p></div></div></section></>}
