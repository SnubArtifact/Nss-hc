import { useEffect, useState } from "react";
import HourCard from "../components/HourCard";
import HourTable from "../components/HourTable";
import AddHourModal from "../components/AddHourModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../api/axios";
import { formatDuration } from "../utils/format";

export default function Dashboard() {
  const { user, logout, refreshUser, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"view" | "add" | "verify" | "members">("view");
  const [category, setCategory] = useState("All");
  const [logs, setLogs] = useState<any[]>([]);
  const [hrHours, setHrHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verificationLogs, setVerificationLogs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");

  const fetchPendingLogs = async () => {
    try {
      const { data } = await api.get("/moderator/pending");
      if (data && data.logs) {
        setVerificationLogs(data.logs);
      }
    } catch (error) {
      console.error("Failed to fetch pending logs");
    }
  };

  const fetchMembers = async () => {
    try {
      const { data } = await api.get("/moderator/members?page=1&amount=200");
      if (data && data.members) {
        setMembers(data.members);
      }
    } catch (error) {
      console.error("Failed to fetch members");
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post("/moderator/log/approve", { id });
      setVerificationLogs(prev => prev.filter(l => l.id !== id));
      fetchLogs(); // Refresh stats
    } catch (error) {
      alert("Failed to approve log");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post("/moderator/log/reject", { id });
      setVerificationLogs(prev => prev.filter(l => l.id !== id));
    } catch (error) {
      alert("Failed to reject log");
    }
  };

  const fetchLogs = async () => {
    try {
      const { data } = await api.get("/member/hour-log");
      if (data && data.myHourLogs) {
        setLogs(data.myHourLogs);

        // Calculate HR hours from logs manually since it might not be in user object yet
        const hrTotal = data.myHourLogs
          .filter((l: any) => l.category === "HR")
          .reduce((sum: number, log: any) => {
            const start = new Date(log.startTime);
            const end = new Date(log.endTime);
            const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
            return sum + diff;
          }, 0);

        setHrHours(Math.round(hrTotal * 10) / 10);
      }
    } catch (error) {
      console.error("Failed to fetch logs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchLogs();
      if (["Excomm", "Coordinator", "Trio"].includes(user.role)) {
        fetchPendingLogs();
      }
    }
  }, [user]);

  if (authLoading || (user && loading)) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="error">Please login to view dashboard</div>;
  }

  const approvedLogs = logs.filter(log => log.status === "Approved");
  const pendingLogs = logs.filter(log => log.status === "Pending");

  const filteredLogs =
    category === "All"
      ? approvedLogs
      : approvedLogs.filter(log => log.category === category);

  return (
    <>
      {/* HEADER */}
      <header className="top-header">
        <div className="header-content">
          {/* LEFT: LOGO + TITLE */}
          <div className="header-left">
            <img
              src="/src/assets/nss-logo.png"
              alt="NSS Logo"
              className="nss-logo"
            />
            <h1 className="portal-title">Hour Count Portal</h1>
          </div>

          {/* RIGHT */}
          <div className="header-right">
            <span className="user-name">{user.name}</span>
            <span className="badge">{user.role}</span>
            <button className="theme-toggle-btn" onClick={toggleTheme}>
              {theme === "light" ? "Dark Mode" : "Light Mode"}
            </button>
            <button className="logout-btn" onClick={logout}>Sign Out</button>
          </div>
        </div>
      </header>

      <div className="page">
        {/* MAIN TABS */}
        <div className="tabs">
          <button
            className={activeTab === "view" ? "tab active" : "tab"}
            onClick={() => setActiveTab("view")}
          >
            View Hours
          </button>
          <button
            className={activeTab === "add" ? "tab active" : "tab"}
            onClick={() => setActiveTab("add")}
          >
            Add Hours
          </button>
          {["Excomm", "Coordinator", "Trio"].includes(user?.role || "") && (
            <>
              <button
                className={activeTab === "verify" ? "tab active" : "tab"}
                onClick={() => {
                  setActiveTab("verify");
                  fetchPendingLogs();
                }}
              >
                Verify
              </button>
              <button
                className={activeTab === "members" ? "tab active" : "tab"}
                onClick={() => {
                  setActiveTab("members");
                  fetchMembers();
                }}
              >
                Members
              </button>
            </>
          )}
        </div>

        {/* VIEW HOURS */}
        {activeTab === "view" && (
          <>
            {/* CATEGORY FILTER */}
            <div className="filters">
              {["All", "Dept", "Meet", "Event", "Misc"].map(cat => (
                <button
                  key={cat}
                  className={category === cat ? "filter active" : "filter"}
                  onClick={() => setCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* SUMMARY */}
            <section className="grid">
              <HourCard title="Department" value={user.hourCountDept} />
              <HourCard title="Meetings" value={user.hourCountMeet} />
              <HourCard title="Events" value={user.hourCountEvent} />
              <HourCard title="Misc" value={user.hourCountMisc} />
            </section>

            {/* TABLE */}
            <section className="section">
              <div className="table-container">
                <HourTable logs={filteredLogs} />
              </div>

              {pendingLogs.length > 0 && (
                <div style={{ marginTop: '2rem' }}>
                  <h3 style={{ color: 'var(--text-muted)', marginBottom: '1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Pending Verification
                  </h3>
                  <div className="table-container" style={{ opacity: 0.7 }}>
                    <HourTable logs={pendingLogs} />
                  </div>
                </div>
              )}
            </section>
          </>
        )}

        {/* VERIFY HOURS */}
        {activeTab === "verify" && (
          <section className="section">
            <div className="add-hours-header">
              <h2>Verify Hours</h2>
              <p>Review and approve pending hour logs</p>
            </div>
            <div className="table-container">
              <table className="hour-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th style={{ textAlign: "center" }}>Category</th>
                    <th>Task</th>
                    <th>Hours</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {verificationLogs.map((log) => {
                    const start = new Date(log.startTime);
                    const end = new Date(log.endTime);
                    const diff = (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                    return (
                      <tr key={log.id}>
                        <td>{log.user.name}</td>
                        <td><span className="badge" style={{ fontSize: '0.7rem' }}>{log.user.role}</span></td>
                        <td>
                          <span className={`category-pill ${log.category.toLowerCase()}`}>
                            {log.category}
                          </span>
                        </td>
                        <td>{log.task}</td>
                        <td>{formatDuration(diff)}</td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleApprove(log.id)}
                            style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(log.id)}
                            style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                  {verificationLogs.length === 0 && (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No pending logs to verify
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* ADD HOURS */}
        {activeTab === "add" && (
          <section className="section">
            <div className="add-hours-header">
              <h2>Add Hours</h2>
              <p>Log your NSS activity by filling in the details below</p>
            </div>
            <AddHourModal onAdd={async () => {
              await refreshUser();
              await fetchLogs();
            }} />
          </section>
        )}

        {/* MEMBERS */}
        {activeTab === "members" && (
          <section className="section">
            <div className="add-hours-header">
              <h2>Member Hours</h2>
              <p>View cumulative hours for all members</p>
            </div>
            <div className="member-search">
              <input
                type="text"
                placeholder="Search by name..."
                value={memberSearch}
                onChange={e => setMemberSearch(e.target.value)}
              />
            </div>
            <div className="table-container">
              <table className="hour-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Role</th>
                    <th style={{ textAlign: 'right' }}>Dept</th>
                    <th style={{ textAlign: 'right' }}>Meet</th>
                    <th style={{ textAlign: 'right' }}>Event</th>
                    <th style={{ textAlign: 'right' }}>Misc</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {members
                    .filter(m => m.name.toLowerCase().includes(memberSearch.toLowerCase()))
                    .map((m) => {
                      const total = (m.hourCountDept || 0) + (m.hourCountMeet || 0) + (m.hourCountEvent || 0) + (m.hourCountMisc || 0);
                      return (
                        <tr key={m.id}>
                          <td>{m.name}</td>
                          <td><span className="badge" style={{ fontSize: '0.7rem' }}>{m.role}</span></td>
                          <td style={{ textAlign: 'right' }}>{formatDuration(m.hourCountDept || 0)}</td>
                          <td style={{ textAlign: 'right' }}>{formatDuration(m.hourCountMeet || 0)}</td>
                          <td style={{ textAlign: 'right' }}>{formatDuration(m.hourCountEvent || 0)}</td>
                          <td style={{ textAlign: 'right' }}>{formatDuration(m.hourCountMisc || 0)}</td>
                          <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatDuration(total)}</td>
                        </tr>
                      );
                    })}
                  {members.length === 0 && (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div >
    </>
  );
}
