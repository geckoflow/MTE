import React from 'react'

const wrap: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 14 }
const text: React.CSSProperties = {
  fontFamily: 'Montserrat, system-ui, sans-serif',
  fontStyle: 'italic',
  fontWeight: 800,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  lineHeight: 1.05,
  fontSize: 13,
}

/** Logo auf der Admin-Anmeldeseite */
export const Logo = () => (
  <div style={wrap}>
    <img src="/brand/monogramm-se-schwarz.png" alt="" width={88} height={48} className="sbe-admin-logo" />
    <span style={text}>
      Schaftböller
      <br />
      <span style={{ fontSize: 19 }}>Ebner</span>
    </span>
  </div>
)

/** Icon in der Admin-Navigation */
export const Icon = () => (
  <img src="/brand/monogramm-se-schwarz.png" alt="Schaftböller Ebner" width={36} height={20} className="sbe-admin-logo" />
)
