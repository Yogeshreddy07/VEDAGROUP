import { ImageResponse } from 'next/og';
export const alt = 'Veda Group — International Business Development';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export default function Image() {
  return new ImageResponse(<div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '90px', background: '#102c3c', color: '#ffffff' }}><div style={{ display: 'flex', fontSize: 84, fontWeight: 700 }}>VEDA GROUP</div><div style={{ display: 'flex', marginTop: 32, fontSize: 42, color: '#aad4cd' }}>International Business Development</div><div style={{ display: 'flex', marginTop: 38, fontSize: 28 }}>Markets. Relationships. Cross-border opportunities.</div></div>, size);
}
