import { pageMetadata } from '@/lib/seo';
import { editorialImages } from '@/lib/imagery';
import { PageHero, CTA, Process } from '@/components/shared';
export const metadata=pageMetadata('/our-approach', "Our Approach", "Learn how Veda Group approaches international business development: understand your objectives, assess opportunities, plan, connect and progress.", true);
export default function Approach(){return <><PageHero path="/our-approach" image={editorialImages.approach} label="Our Approach" title="Clear objectives. Considered progress." description="A practical, relationship-led approach that starts with understanding your organisation and develops around an agreed scope."/><section className="section"><div className="container"><Process full/><p className="scope-note">The shape of each engagement depends on your objectives, the market opportunity and the scope we agree together.</p></div></section><CTA/></>}
