"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [notes, setNotes] = useState([]);
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    const res = await fetch("/api/notes");
    const data = await res.json();
    setNotes(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  async function addNote() {
    if (!text.trim()) return;

    if (editingId) {
      await fetch("/api/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingId, content: text }),
      });
      setEditingId(null);
    } else {
      await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: text }),
      });
    }

    setText("");
    loadNotes();
  }

  async function deleteNote(id) {
    await fetch("/api/notes", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadNotes();
  }

  function editNote(note) {
    setText(note.content);
    setEditingId(note.id);
  }

  async function summarize(note) {
    const sentences = note.content
      .replace(/\n/g, " ")
      .split(".")
      .map(s => s.trim())
      .filter(s => s.length > 25);

    let summary =
      sentences.length >= 3
        ? `${sentences[0]}. ${sentences[Math.floor(
            sentences.length / 2
          )]}. ${sentences[sentences.length - 1]}.`
        : sentences.join(". ") + ".";

    await fetch("/api/notes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: note.id, summary }),
    });

    loadNotes();
  }

  const filteredNotes = notes
    .filter(n =>
      n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "az") return a.content.localeCompare(b.content);
      if (sortBy === "za") return b.content.localeCompare(a.content);
      return 0;
    });

  return (
    <main
      style={{
        maxWidth: 700,
        margin: "40px auto",
        color: "white",
        padding: "0 16px",
      }}
    >
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Write your note here..."
        style={{
          width: "100%",
          height: 120,
          padding: 16,
          borderRadius: 12,
          background: "#0b1d3a",
          color: "white",
        }}
      />

      <button
        onClick={addNote}
        style={{
          marginTop: 12,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          fontWeight: "bold",
          transition: "all 0.2s ease",
          cursor: "pointer", // ✅ HAND CURSOR
        }}
      >
        {editingId ? "Update Note" : "Add Note"}
      </button>

      <input
        placeholder="Search notes..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          marginTop: 20,
          width: "100%",
          padding: 12,
          borderRadius: 10,
          background: "#0b1d3a",
          color: "white",
        }}
      />

      <select
        value={sortBy}
        onChange={e => setSortBy(e.target.value)}
        style={{
          marginTop: 16,
          width: "100%",
          padding: "12px 14px",
          borderRadius: 12,
          backgroundColor: "#0b1d3a",
          color: "#e5e7eb",
          border: "1px solid #1e3a8a",
          cursor: "pointer", // ✅ HAND CURSOR
        }}
      >
        <option value="newest">Newest First</option>
        <option value="oldest">Oldest First</option>
        <option value="az">A → Z</option>
        <option value="za">Z → A</option>
      </select>

      {loading && (
        <div style={{ marginTop: 20, opacity: 0.6 }}>
          Loading your notes…
        </div>
      )}

      {filteredNotes.map(note => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          style={{
            marginTop: 20,
            padding: 16,
            borderRadius: 12,
            background: "#0b1d3a",
          }}
        >
          <p style={{ lineHeight: 1.6 }}>{note.content}</p>

          {note.summary && (
            <p
              style={{
                color: "#4fd1c5",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              ✨ Summary: {note.summary}
            </p>
          )}

          {note.tags && (
            <div style={{ marginTop: 8 }}>
              {JSON.parse(note.tags).map(tag => (
                <span
                  key={tag}
                  style={{
                    display: "inline-block",
                    marginRight: 8,
                    marginBottom: 6,
                    padding: "4px 10px",
                    borderRadius: 999,
                    fontSize: 12,
                    background: "#1e293b",
                    color: "#38bdf8",
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <small style={{ opacity: 0.7 }}>
            {new Date(note.createdAt).toLocaleString()}
          </small>

          <div style={{ marginTop: 10 }}>
            <button
              onClick={() => summarize(note)}
              style={{
                color: "lime",
                marginRight: 12,
                transition: "all 0.2s ease",
                cursor: "pointer", // ✅ HAND CURSOR
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={e =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Summarize
            </button>

            <button
              onClick={() => editNote(note)}
              style={{
                color: "#60a5fa",
                marginRight: 12,
                transition: "all 0.2s ease",
                cursor: "pointer", // ✅ HAND CURSOR
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={e =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Edit
            </button>

            <button
              onClick={() => deleteNote(note.id)}
              style={{
                color: "#f87171",
                transition: "all 0.2s ease",
                cursor: "pointer", // ✅ HAND CURSOR
              }}
              onMouseEnter={e =>
                (e.currentTarget.style.transform = "scale(1.05)")
              }
              onMouseLeave={e =>
                (e.currentTarget.style.transform = "scale(1)")
              }
            >
              Delete
            </button>
          </div>
        </motion.div>
      ))}
    </main>
  );
}
