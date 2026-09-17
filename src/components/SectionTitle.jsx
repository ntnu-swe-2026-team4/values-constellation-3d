export default function SectionTitle({ zh, en }) {
  return (
    <div className="sect-title">
      <h2>{zh}</h2>
      <small>{en}</small>
      <span className="rule" />
    </div>
  )
}
