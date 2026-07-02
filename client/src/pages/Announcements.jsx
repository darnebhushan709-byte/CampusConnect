import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Announcements.css";

function Announcements() {
  const [announcements, setAnnouncements] = useState([]);

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchAnnouncements = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5000/api/announcements"
      );

      setAnnouncements(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch announcements");
    }
  };

  const clearForm = () => {
    setTitle("");
    setMessage("");
    setEditId(null);
  };

  const handleSubmit = () => {
    if (editId) {
      updateAnnouncement();
    } else {
      createAnnouncement();
    }
  };

  const createAnnouncement = async () => {
    try {
      if (!title || !message) {
        toast.error("Title and message are required");
        return;
      }

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

      toast.success(response.data.message);
      clearForm();
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Unable to create announcement"
      );
    }
  };

  const startEdit = (announcement) => {
    setEditId(announcement._id);
    setTitle(announcement.title);
    setMessage(announcement.message);
  };

  const updateAnnouncement = async () => {
    try {
      if (!title || !message) {
        toast.error("Title and message are required");
        return;
      }

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

      toast.success(response.data.message);
      clearForm();
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Unable to update announcement"
      );
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
        `${import.meta.env.VITE_API_URL}/api/announcements/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      fetchAnnouncements();
    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message || "Unable to delete announcement"
      );
    }
  };

  let filteredAnnouncements = announcements.filter((announcement) => {
    return (
      announcement.title
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      announcement.message
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  if (sortType === "newest") {
    filteredAnnouncements.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  if (sortType === "oldest") {
    filteredAnnouncements.sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );
  }

  if (sortType === "az") {
    filteredAnnouncements.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  if (sortType === "za") {
    filteredAnnouncements.sort((a, b) =>
      b.title.localeCompare(a.title)
    );
  }

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

      <input
        className="search-input"
        type="text"
        placeholder="Search announcements..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="filter-sort-box">
        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>
      </div>

      {filteredAnnouncements.length === 0 ? (
        <p className="empty-text">No Announcements Found</p>
      ) : (
        <div className="announcements-list">
          {filteredAnnouncements.map((announcement) => (
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