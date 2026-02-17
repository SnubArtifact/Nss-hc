import { useState } from "react";
import { addHour } from "../api/hours";
import dayjs from "dayjs";

export default function AddHourModal({ onAdd }: { onAdd: () => void }) {
  const [task, setTask] = useState("");
  const [category, setCategory] = useState("Dept");
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [startTime, setStart] = useState("");
  const [endTime, setEnd] = useState("");
  const [seniorPresent, setSeniorPresent] = useState("");

  const submit = async () => {
    try {
      if (!task || !startTime || !endTime || !date) {
        alert("Please fill all required fields");
        return;
      }

      const adjustedEndDate = endTime < startTime
        ? dayjs(date).add(1, 'day').toISOString()
        : dayjs(date).toISOString();

      await addHour({
        task,
        category,
        startDate: dayjs(date).toISOString(),
        endDate: adjustedEndDate,
        startTime,
        endTime,
        seniorPresent: seniorPresent || undefined,
      });

      alert("Hour log added");
      onAdd();
      // Reset form
      setTask("");
      setStart("");
      setEnd("");
      setSeniorPresent("");
    } catch (error: any) {
      alert(error.response?.data?.message || "Failed to add hour log");
    }
  };

  return (
    <div className="add-hour-card">
      <div className="form-row">
        <label>Task</label>
        <input
          placeholder="e.g. Dept meeting, Event duty"
          value={task}
          onChange={e => setTask(e.target.value)}
        />
      </div>

      <div className="form-row">
        <label>Category</label>
        <select value={category} onChange={e => setCategory(e.target.value)}>
          <option value="Dept">Department</option>
          <option value="Meet">Meeting</option>
          <option value="Event">Event</option>
          <option value="Misc">Misc</option>
        </select>
      </div>

      <div className="form-row">
        <label>Date</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
        />
      </div>

      <div className="form-grid">
        <div className="form-row">
          <label>Start Time</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStart(e.target.value)}
          />
        </div>

        <div className="form-row">
          <label>End Time</label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEnd(e.target.value)}
          />
        </div>
      </div>

      <div className="form-row">
        <label>Senior Present (Optional)</label>
        <input
          placeholder="Name of senior"
          value={seniorPresent}
          onChange={e => setSeniorPresent(e.target.value)}
        />
      </div>

      <button className="primary-btn" onClick={submit}>
        Submit Hours
      </button>
    </div>
  );
}
