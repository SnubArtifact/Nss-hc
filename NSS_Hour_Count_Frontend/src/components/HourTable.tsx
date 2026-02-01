import dayjs from "dayjs";

export default function HourTable({ logs }: any) {
  return (
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Category</th>
          <th>Start</th>
          <th>End</th>
        </tr>
      </thead>
      <tbody>
        {logs?.map((log: any) => (
          <tr key={log.id}>
            <td>{log.task}</td>
            <td className={`category ${log.category.toLowerCase()}`}>
  {log.category}
</td>

            <td>{dayjs(log.startTime).format("DD MMM HH:mm")}</td>
            <td>{dayjs(log.endTime).format("DD MMM HH:mm")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
