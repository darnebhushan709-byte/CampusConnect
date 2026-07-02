import { useEffect, useState } from "react";
import axios from "axios";
import "./Events.css";

function Events() {
  const [events, setEvents] = useState([]);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [venue, setVenue] = useState("");

  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const getToken = () => {
    return localStorage.getItem("token");
  };

  const fetchEvents = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/events");

      setEvents(response.data);
    } catch (error) {
      console.log(error);
      alert("Unable to fetch events");
    }
  };

  const clearForm = () => {
    setTitle("");
    setDescription("");
    setDate("");
    setVenue("");
    setEditId(null);
  };

  const createEvent = async () => {
    try {
      const token = getToken();

      const response = await axios.post(
        "http://localhost:5000/api/events",
        {
          title,
          description,
          date,
          venue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      clearForm();
      fetchEvents();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to create event");
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
        {
          title,
          description,
          date,
          venue,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      clearForm();
      fetchEvents();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to update event");
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
        `http://localhost:5000/api/events/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert(response.data.message);
      fetchEvents();
    } catch (error) {
      console.log(error);
      alert(error.response?.data?.message || "Unable to delete event");
    }
  };

  const handleSubmit = () => {
    if (editId) {
      updateEvent();
    } else {
      createEvent();
    }
  };

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

      {events.length === 0 ? (
        <p className="empty-text">No Events Available</p>
      ) : (
        <div className="events-list">
          {events.map((event) => (
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

