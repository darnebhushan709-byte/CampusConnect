import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    fetchEvents();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");
      setEvents(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch events");
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    setEditId(null);
  };

  const handleSubmit = () => {
    if (editId) {
      updateEvent();
    } else {
      createEvent();
    }
  };

  const createEvent = async () => {
    try {
      const token = getToken();

      const response = await axios.post(
        "http://localhost:5000/api/events",
        { title, description, date, venue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      clearForm();
      fetchEvents();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to create event");
    }
  };

  const startEdit = (event) => {
    setEditId(event._id);
    setTitle(event.title);
    setDescription(event.description);
    setDate(event.date ? event.date.substring(0, 10) : "");
    setVenue(event.venue);
  };

  const updateEvent = async () => {
    try {
      const token = getToken();

      const response = await axios.put(
        `http://localhost:5000/api/events/${editId}`,
        { title, description, date, venue },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      clearForm();
      fetchEvents();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to update event");
    }
  };

  const deleteEvent = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this event?"
      );

      if (!confirmDelete) return;

      const token = getToken();

     const response = await axios.delete(
  `${import.meta.env.VITE_API_URL}/api/events/${id}`,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

      toast.success(response.data.message);
      fetchEvents();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to delete event");
    }
  };

  let filteredEvents = events.filter((event) => {
    return (
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.venue.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (filterType === "upcoming") {
    filteredEvents = filteredEvents.filter(
      (event) => new Date(event.date) >= today
    );
  }

  if (filterType === "past") {
    filteredEvents = filteredEvents.filter(
      (event) => new Date(event.date) < today
    );
  }

  if (sortType === "newest") {
    filteredEvents.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (sortType === "oldest") {
    filteredEvents.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (sortType === "az") {
    filteredEvents.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortType === "za") {
    filteredEvents.sort((a, b) => b.title.localeCompare(a.title));
  }

  return (
    <div className="events-container">
      <h1>Campus Events</h1>

      <div className="event-form">
        <h2>{editId ? "Update Event" : "Create New Event"}</h2>

        <input
          type="text"
          placeholder="Event Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Event Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="text"
          placeholder="Venue"
          value={venue}
          onChange={(e) => setVenue(e.target.value)}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update Event" : "Create Event"}
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
        placeholder="Search events by title, description, or venue..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <div className="filter-sort-box">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="upcoming">Upcoming Events</option>
          <option value="past">Past Events</option>
        </select>

        <select value={sortType} onChange={(e) => setSortType(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="az">A-Z</option>
          <option value="za">Z-A</option>
        </select>
      </div>

      {filteredEvents.length === 0 ? (
        <p className="empty-text">No Events Found</p>
      ) : (
        <div className="events-list">
          {filteredEvents.map((event) => (
            <div className="event-card" key={event._id}>
              <h2>{event.title}</h2>
              <p>{event.description}</p>

              <p>
                <strong>Date:</strong>{" "}
                {new Date(event.date).toLocaleDateString()}
              </p>

              <p>
                <strong>Venue:</strong> {event.venue}
              </p>

              <div className="event-actions">
                <button onClick={() => startEdit(event)}>Edit</button>
                <button
                  className="delete-btn"
                  onClick={() => deleteEvent(event._id)}
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

export default Events;

