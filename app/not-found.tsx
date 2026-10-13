import Link from 'next/link';
import { PageHero } from '@/components/shared';
export default function NotFound(){return <><PageHero label="Page not found" title="Let’s find your next step." description="The page you are looking for could not be found."/><section className="section"><div className="container"><Link className="button" href="/">Return to home →</Link></div></section></>}
