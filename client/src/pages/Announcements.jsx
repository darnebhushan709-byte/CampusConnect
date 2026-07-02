import { useEffect, useState } from "react";
import axios from "axios";
import "./Announcements.css";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/announcements"
      );

      setAnnouncements(response.data);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch announcements");
    }
  };

  const clearForm = () => {
    setTitle("");
    setMessage("");
    setEditId(null);
  };

  const createAnnouncement = async () => {
    try {
      const token = getToken();

      const response = await axios.post(
        "http://localhost:5000/api/announcements",
        {
          title,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      clearForm();
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to create announcement");
    }
  };

  const startEdit = (announcement) => {
    setEditId(announcement._id);
    setTitle(announcement.title);
    setMessage(announcement.message);
  };

  const updateAnnouncement = async () => {
    try {
      const token = getToken();

      const response = await axios.put(
        `http://localhost:5000/api/announcements/${editId}`,
        {
          title,
          message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      clearForm();
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to update announcement");
    }
  };

  const deleteAnnouncement = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this announcement?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      const response = await axios.delete(
        `http://localhost:5000/api/announcements/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to delete announcement");
    }
  };

  const handleSubmit = () => {
    if (editId) {
      updateAnnouncement();
    } else {
      createAnnouncement();
    }
  };

  return (
    <div className="announcements-container">
      <h1>Campus Announcements</h1>

      <div className="announcement-form">
        <h2>{editId ? "Update Announcement" : "Create Announcement"}</h2>

        <input
          type="text"
          placeholder="Announcement Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Announcement Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        ></textarea>

        <button onClick={handleSubmit}>
          {editId ? "Update Announcement" : "Create Announcement"}
        </button>

        {editId && (
          <button className="cancel-btn" onClick={clearForm}>
            Cancel Edit
          </button>
        )}
      </div>

      {announcements.length === 0 ? (
        <p className="empty-text">No Announcements Available</p>
      ) : (
        <div className="announcements-list">
          {announcements.map((announcement) => (
            <div className="announcement-card" key={announcement._id}>
              <h2>{announcement.title}</h2>
              <p>{announcement.message}</p>

              <div className="announcement-actions">
                <button onClick={() => startEdit(announcement)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => deleteAnnouncement(announcement._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Announcements;