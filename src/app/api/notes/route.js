let notes = [];

export async function GET() {
  return Response.json(notes);
}

export async function POST(req) {
  const { content } = await req.json();

  const newNote = {
    id: Date.now(),
    content,
    summary: "",
    createdAt: new Date().toISOString(),
  };

  notes.unshift(newNote);
  return Response.json(newNote);
}

export async function PATCH(req) {
  const { id, content, summary } = await req.json();

  notes = notes.map(note =>
    note.id === id
      ? {
          ...note,
          content: content ?? note.content,
          summary: summary ?? note.summary,
        }
      : note
  );

  return Response.json({ success: true });
}

export async function DELETE(req) {
  const { id } = await req.json();
  notes = notes.filter(note => note.id !== id);
  return Response.json({ success: true });
}

