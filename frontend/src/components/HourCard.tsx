import { formatDuration } from "../utils/format";

export default function HourCard({ title, value }: any) {
  const formatted = formatDuration(value);
  return (
    <div className="card">
      <h3>{title}</h3>
      <p title={formatted}>{formatted}</p>
    </div>
  );
}
