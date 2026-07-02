import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./Notes.css";

function Notes() {
  const [notes, setNotes] = useState([]);

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [file, setFile] = useState(null);

  const [editId, setEditId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("newest");

  useEffect(() => {
    fetchNotes();
  }, []);

  const getToken = () => localStorage.getItem("token");

  const fetchNotes = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/notes");
      setNotes(response.data);
    } catch (error) {
      console.log(error);
      toast.error("Unable to fetch notes");
    }
  };

  const clearForm = () => {
    setTitle("");
    setSubject("");
    setFile(null);
    setEditId(null);
  };

  const uploadNote = async () => {
    try {
      if (!title || !subject || !file) {
        toast.error("Title, subject and PDF file are required");
        return;
      }

      const token = getToken();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);
      formData.append("file", file);

      const response = await axios.post(
        "http://localhost:5000/api/notes",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      clearForm();
      fetchNotes();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to upload note");
    }
  };

  const startEdit = (note) => {
    setEditId(note._id);
    setTitle(note.title);
    setSubject(note.subject);
    setFile(null);
  };

  const updateNote = async () => {
    try {
      if (!title || !subject) {
        toast.error("Title and subject are required");
        return;
      }

      const token = getToken();

      const formData = new FormData();
      formData.append("title", title);
      formData.append("subject", subject);

      if (file) {
        formData.append("file", file);
      }

      const response = await axios.put(
        `http://localhost:5000/api/notes/${editId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success(response.data.message);
      clearForm();
      fetchNotes();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to update note");
    }
  };

  const deleteNote = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this note?"
      );

      if (!confirmDelete) return;

      const token = getToken();

      const response = await axios.delete(
        `http://localhost:5000/api/notes/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message);
      fetchNotes();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to delete note");
    }
  };

  const handleSubmit = () => {
    if (editId) {
      updateNote();
    } else {
      uploadNote();
    }
  };

  let filteredNotes = notes.filter((note) => {
    return (
      note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (sortType === "newest") {
    filteredNotes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  if (sortType === "oldest") {
    filteredNotes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  }

  if (sortType === "az") {
    filteredNotes.sort((a, b) => a.title.localeCompare(b.title));
  }

  if (sortType === "za") {
    filteredNotes.sort((a, b) => b.title.localeCompare(a.title));
  }

  const getFileUrl = (filePath) => {
    return `http://localhost:5000/${filePath.replace("\\", "/")}`;
  };

  return (
    <div className="notes-container">
      <h1>Campus Notes</h1>

      <div className="note-form">
        <h2>{editId ? "Update Note" : "Upload Note"}</h2>

        <input
          type="text"
          placeholder="Note Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="text"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />

        <input
          type="file"
          accept=".pdf"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button onClick={handleSubmit}>
          {editId ? "Update Note" : "Upload Note"}
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
        placeholder="Search notes by title or subject..."
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

      {filteredNotes.length === 0 ? (
        <p className="empty-text">No Notes Found</p>
      ) : (
        <div className="notes-list">
          {filteredNotes.map((note) => (
            <div className="note-card" key={note._id}>
              <h2>{note.title}</h2>

              <p>
                <strong>Subject:</strong> {note.subject}
              </p>

              <div className="pdf-actions">
                <a href={getFileUrl(note.file)} target="_blank">
                  View PDF
                </a>

                <a href={getFileUrl(note.file)} download>
                  Download PDF
                </a>
              </div>

              <div className="note-actions">
                <button onClick={() => startEdit(note)}>Edit</button>

                <button
                  className="delete-btn"
                  onClick={() => deleteNote(note._id)}
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

export default Notes;