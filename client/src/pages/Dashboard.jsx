import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      <nav className="dashboard-navbar">
        <h2>CampusConnect</h2>
        <button onClick={handleLogout}>Logout</button>
      </nav>

      <div className="dashboard-content">
        <h1>Welcome, {user?.name || "Student"} 👋</h1>
        <p>Your college activity hub</p>

        <div className="dashboard-cards" onClick={() => navigate("/events")}>
          <div className="dashboard-card">
            <h3>📅 Events</h3>
            <p>Create and manage college events.</p>
          </div>

          <div className="dashboard-card">
            <h3>📢 Announcements</h3>
            <p>View and manage important notices.</p>
          </div>

          <div className="dashboard-card">
            <h3>📚 Notes</h3>
            <p>Upload and access study materials.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;