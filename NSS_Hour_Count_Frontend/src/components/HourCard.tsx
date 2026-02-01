export default function HourCard({ title, value }: any) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{value} hrs</p>
    </div>
  );
}
