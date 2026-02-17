import { useEffect, useState } from "react";
import HourCard from "../components/HourCard";
import HourTable from "../components/HourTable";
import AddHourModal from "../components/AddHourModal";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { useToast } from "../context/ToastContext";
import api from "../api/axios";
import { formatDuration } from "../utils/format";
import { addHour } from "../api/hours";
import dayjs from "dayjs";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Dashboard() {
  const { user, logout, refreshUser, isLoading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<"view" | "add" | "verify" | "members" | "rejected">("view");
  const [category, setCategory] = useState("All");
  const [logs, setLogs] = useState<any[]>([]);
  const [hrHours, setHrHours] = useState(0);
  const [loading, setLoading] = useState(true);
  const [verificationLogs, setVerificationLogs] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");

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

  const exportToExcel = () => {
    const filteredMembers = members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase());
      const displayRole = m.specificPosition || m.role;
      const matchesRole = roleFilter === "All" || displayRole === roleFilter;
      return matchesSearch && matchesRole;
    });

    const data = filteredMembers.map(m => ({
      Name: m.name,
      Role: m.specificPosition || m.role,
      Department: formatDuration(m.hourCountDept || 0),
      Meetings: formatDuration(m.hourCountMeet || 0),
      Events: formatDuration(m.hourCountEvent || 0),
      Misc: formatDuration(m.hourCountMisc || 0),
      Total: formatDuration((m.hourCountDept || 0) + (m.hourCountMeet || 0) + (m.hourCountEvent || 0) + (m.hourCountMisc || 0))
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Members");
    XLSX.writeFile(workbook, `NSS_Members_Hours_${dayjs().format('YYYY-MM-DD')}.xlsx`);
    showToast("Excel exported", "success");
  };

  const exportToPDF = () => {
    const filteredMembers = members.filter(m => {
      const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase());
      const displayRole = m.specificPosition || m.role;
      const matchesRole = roleFilter === "All" || displayRole === roleFilter;
      return matchesSearch && matchesRole;
    });

    const doc = new jsPDF();
    doc.text("NSS Member Hour Report", 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${dayjs().format('MMMM D, YYYY')}`, 14, 22);

    const tableData = filteredMembers.map(m => [
      m.name,
      m.specificPosition || m.role,
      formatDuration(m.hourCountDept || 0),
      formatDuration(m.hourCountMeet || 0),
      formatDuration(m.hourCountEvent || 0),
      formatDuration(m.hourCountMisc || 0),
      formatDuration((m.hourCountDept || 0) + (m.hourCountMeet || 0) + (m.hourCountEvent || 0) + (m.hourCountMisc || 0))
    ]);

    autoTable(doc, {
      startY: 30,
      head: [['Name', 'Role', 'Dept', 'Meet', 'Event', 'Misc', 'Total']],
      body: tableData,
    });

    doc.save(`NSS_Members_Hours_${dayjs().format('YYYY-MM-DD')}.pdf`);
    showToast("PDF exported", "success");
  };

  const handleApprove = async (id: number) => {
    try {
      await api.post("/moderator/log/approve", { id });
      setVerificationLogs(prev => prev.filter(l => l.id !== id));
      fetchLogs(); // Refresh stats
      showToast("Log approved", "success");
    } catch (error) {
      showToast("Failed to approve log", "error");
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.post("/moderator/log/reject", { id });
      setVerificationLogs(prev => prev.filter(l => l.id !== id));
      showToast("Log rejected", "success");
    } catch (error) {
      showToast("Failed to reject log", "error");
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
      if (["SecondYearPORHolder", "Coordinator", "Trio"].includes(user.role)) {
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
  const rejectedLogs = logs.filter(log => log.status === "Rejected");

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
            <span className="badge">{user.specificPosition || user.role}</span>
            <button className="theme-toggle-btn" onClick={toggleTheme} title={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
              {theme === "light" ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
              )}
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
          <button
            className={activeTab === "rejected" ? "tab active" : "tab"}
            onClick={() => setActiveTab("rejected")}
          >
            Rejected
          </button>
          {["SecondYearPORHolder", "Coordinator", "Trio"].includes(user?.role || "") && (
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

        {/* REJECTED HOURS */}
        {activeTab === "rejected" && (
          <section className="section animate-slide-up">
            <div className="add-hours-header">
              <h2>Rejected Hours</h2>
              <p>View your hour logs that were not approved</p>
            </div>
            {rejectedLogs.length > 0 ? (
              <div className="table-container" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                <HourTable logs={rejectedLogs} />
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                No rejected logs found
              </div>
            )}
          </section>
        )}

        {/* VERIFY HOURS */}
        {activeTab === "verify" && (
          <section className="section animate-slide-up">
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
                        <td><span className="badge" style={{ fontSize: '0.7rem' }}>{log.user.specificPosition || log.user.role}</span></td>
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
          <section className="section animate-slide-up">
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
          <section className="section animate-slide-up">
            <div className="add-hours-header">
              <h2>Member Hours</h2>
              <p>View cumulative hours for all members</p>
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap' }}>
              <div className="member-search" style={{ marginBottom: 0 }}>
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={memberSearch}
                  onChange={e => setMemberSearch(e.target.value)}
                />
              </div>
              {["Coordinator", "Trio"].includes(user?.role || "") && (
                <div className="filters" style={{ marginBottom: 0 }}>
                  {["All", "Member", "Excomm", "HR"].map(role => (
                    <button
                      key={role}
                      className={roleFilter === role ? "filter active" : "filter"}
                      onClick={() => setRoleFilter(role)}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ marginLeft: 'auto', display: 'flex', gap: '10px' }}>
                <button
                  className="filter"
                  style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}
                  onClick={exportToExcel}
                >
                  Export Excel
                </button>
                <button
                  className="filter"
                  style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}
                  onClick={exportToPDF}
                >
                  Export PDF
                </button>
              </div>
            </div>
            <div className="table-container">
              <table className="hour-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                    .filter(m => {
                      const matchesSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase());
                      const displayRole = m.specificPosition || m.role;
                      const matchesRole = roleFilter === "All" || displayRole === roleFilter;
                      return matchesSearch && matchesRole;
                    })
                    .map((m) => {
                      const total = (m.hourCountDept || 0) + (m.hourCountMeet || 0) + (m.hourCountEvent || 0) + (m.hourCountMisc || 0);
                      return (
                        <tr key={m.id}>
                          <td>{m.name}</td>
                          <td><span className="badge" style={{ fontSize: '0.7rem' }}>{m.specificPosition || m.role}</span></td>
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
