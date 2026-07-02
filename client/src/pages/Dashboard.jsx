import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const [eventCount, setEventCount] = useState(0);
  const [announcementCount, setAnnouncementCount] = useState(0);
  const [noteCount, setNoteCount] = useState(0);

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  const fetchDashboardCounts = async () => {
    try {
      const eventsResponse = await axios.get("http://localhost:5000/api/events");
      const announcementsResponse = await axios.get(
        "http://localhost:5000/api/announcements"
      );
      const notesResponse = await axios.get("http://localhost:5000/api/notes");

      setEventCount(eventsResponse.data.length);
      setAnnouncementCount(announcementsResponse.data.length);
      setNoteCount(notesResponse.data.length);
    } catch (error) {
      console.log(error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <div>
          <h2>🎓 CampusConnect</h2>
          <span>College Activity Management System</span>
        </div>

        <div className="nav-user">
          <p>{user?.name || "Student"}</p>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      <section className="dashboard-hero">
        <h1>Welcome, {user?.name || "Student"} 👋</h1>
        <p>Manage events, announcements, and notes from one place.</p>
      </section>

      <section className="dashboard-stats">
        <div className="stat-card">
          <h3>📅 Events</h3>
          <h2>{eventCount}</h2>
          <p>Total events</p>
        </div>

        <div className="stat-card">
          <h3>📢 Announcements</h3>
          <h2>{announcementCount}</h2>
          <p>Total announcements</p>
        </div>

        <div className="stat-card">
          <h3>📚 Notes</h3>
          <h2>{noteCount}</h2>
          <p>Total notes</p>
        </div>
      </section>

      <section className="dashboard-cards">
        <div className="dashboard-card" onClick={() => navigate("/events")}>
          <h3>📅 Events</h3>
          <p>Create, update, and delete college events.</p>
          <button>Open Events</button>
        </div>

        <div
          className="dashboard-card"
          onClick={() => navigate("/announcements")}
        >
          <h3>📢 Announcements</h3>
          <p>Manage important campus announcements.</p>
          <button>Open Announcements</button>
        </div>

        <div className="dashboard-card" onClick={() => navigate("/notes")}>
          <h3>📚 Notes</h3>
          <p>Upload, view, and manage study notes.</p>
          <button>Open Notes</button>
        </div>
      </section>
    </div>
  );
}

export default Dashboard;