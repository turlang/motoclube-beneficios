export function AdminInput({ label, type = "text", value, onChange, placeholder = "", optional = false }) {
  return <label className="mc-admin-field"><span>{label}</span><input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={!optional} /></label>;
}
export function SectionHeader({ eyebrow, title }) { return <div className="mc-app-section-header"><p>{eyebrow}</p><h2>{title}</h2></div>; }
export function InfoStat({ title, value }) { return <div className="mc-app-stat"><p>{title}</p><strong>{value}</strong></div>; }
export function ActionCard({ icon, title, description, cta }) { return <article className="mc-app-action-card"><div className="mc-app-action-icon">{icon}</div><div><h3>{title}</h3><p>{description}</p><button>{cta}</button></div></article>; }
export function DetailRow({ label, value }) { return <div className="mc-app-detail-row"><span>{label}</span><strong>{value}</strong></div>; }
export function StatAdmin({ title, value, icon }) { return <div className="mc-app-admin-stat"><div>{icon}<p>{title}</p></div><strong>{value}</strong></div>; }
