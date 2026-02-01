import { useEffect, useState } from "react";
import HourCard from "../components/HourCard";
import HourTable from "../components/HourTable";
import AddHourModal from "../components/AddHourModal";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<"view" | "add">("view");
  const [category, setCategory] = useState("All");
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    try {
      const { data } = await api.get("/member/hour-log");
      if (data && data.myHourLogs) {
        setLogs(data.myHourLogs);
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
    }
  }, [user]);

  if (authLoading || (user && loading)) {
    return <div className="loading">Loading...</div>;
  }

  if (!user) {
    return <div className="error">Please login to view dashboard</div>;
  }

  const filteredLogs =
    category === "All"
      ? logs
      : logs.filter(log => log.category === category);

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
            </section>
          </>
        )}

        {/* ADD HOURS */}
        {activeTab === "add" && (
          <section className="section">
            <div className="add-hours-header">
              <h2>Add Hours</h2>
              <p>Log your NSS activity by filling in the details below</p>
            </div>
            <AddHourModal onAdd={fetchLogs} />
          </section>
        )}
      </div>
    </>
  );
}
