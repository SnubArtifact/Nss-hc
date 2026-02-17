import dayjs from "dayjs";

export default function HourTable({ logs }: any) {
  return (
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th style={{ textAlign: "center" }}>Category</th>
          <th>Start</th>
          <th>End</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {logs?.map((log: any) => (
          <tr key={log.id}>
            <td>{log.task}</td>
            <td style={{ textAlign: "center" }}>
              <span className={`category-pill ${log.category.toLowerCase()}`}>
                {log.category}
              </span>
            </td>

            <td>{dayjs(log.startTime).format("DD MMM HH:mm")}</td>
            <td>{dayjs(log.endTime).format("DD MMM HH:mm")}</td>
            <td>
              <span style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '0.8rem',
                fontWeight: '600',
                background: log.status === 'Approved' ? 'rgba(16, 185, 129, 0.1)' : log.status === 'Rejected' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                color: log.status === 'Approved' ? '#10b981' : log.status === 'Rejected' ? '#ef4444' : '#f59e0b'
              }}>
                {log.status || 'Pending'}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
