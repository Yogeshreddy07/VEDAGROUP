'use client';
export default function Error({reset}:{reset:()=>void}){return <section className="section"><div className="container"><h1>Something went wrong.</h1><p style={{margin:'25px 0'}}>Please try loading this page again.</p><button className="button" onClick={reset}>Try again</button></div></section>}
