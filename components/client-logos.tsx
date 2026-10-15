import Image from 'next/image';

type Client = { name: string; src: string; scale?: number; cover?: boolean };

const clients: Client[] = [
  { name: 'Alliance University', src: '/clients/alliance-university.png' },
  { name: 'RV University', src: '/clients/rv-university.png', scale: .9 },
  { name: 'Woxsen University', src: '/clients/woxsen-university.jpg', scale: 1.25 },
  { name: 'IFIM Business School', src: '/clients/ifim-business-school.jpg', cover: true },
  { name: 'Christ College of Science and Management', src: '/clients/christ-college.png', scale: 1.15 },
  { name: 'East Point', src: '/clients/east-point.jpg', scale: 1.9 },
];

function Track({ hidden }: { hidden?: boolean }) {
  return <ul className="client-track" aria-hidden={hidden || undefined}>{clients.map(c =>
    <li key={c.name} className={`client-logo${c.cover ? ' is-cover' : ''}`}>
      <span style={c.scale ? { transform: `scale(${c.scale})` } : undefined}>
        <Image src={c.src} alt={hidden ? '' : c.name} fill sizes="240px" draggable={false}/>
      </span>
    </li>)}</ul>;
}

export function ClientLogos() {
  return <section className="clients" aria-labelledby="clients-title"><div className="container clients-head"><p className="eyebrow" id="clients-title"><span className="dot"/> OUR CLIENTS</p></div>
    <div className="client-marquee"><div className="client-rail"><Track/><Track hidden/></div></div></section>;
}
