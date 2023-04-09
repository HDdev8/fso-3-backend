const express = require("express");
const app = express();
app.use(express.json());
const NOTES = require("./notes");
let notes = NOTES.notes;
const PORT = process.env.PORT || 3001;
const morgan = require("morgan");
morgan.token("body", (req, res) => JSON.stringify(req.body));
app.use(
  morgan(
    ":method :url :status :response-time ms - :res[content-length] :body - :req[content-length]"
  )
);
const cors = require("cors");
app.use(cors());
app.use(express.static("dist"));

const requestTime = (req, res, next) => {
  req.requestTime = new Date();
  next();
};
app.use(requestTime);

app.get("/", (req, res) => {
  res.send("<h1>root</h1>");
});

app.get("/api/notes", (req, res) => {
  res.json(notes);
});

app.get("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const note = notes.find((n) => n.id === id);
  if (note) {
    res.json(note);
  } else {
    res.status(404).end();
  }
});

app.delete("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  notes = notes.filter((n) => n.id !== id);
  res.status(204).end();
});

const generateId = () => {
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + 1;
};

app.post("/api/notes", (req, res) => {
  const body = req.body;

  if (!body.content) {
    return res.status(400).json({
      error: "content missing",
    });
  }
  const note = {
    id: generateId(),
    content: body.content,
    important: body.important,
  };

  if (note.content.length < 1) {
    return res.status(400).json({
      error: "content missing",
    });
  } else if (note.content.length > 0) {
    notes = notes.concat(note);
    res.json(note);
  }
});

app.put("/api/notes/:id", (req, res) => {
  const id = Number(req.params.id);
  const body = req.body;
  const note = notes.find((n) => n.id === id);
  const changedNote = {
    ...note,
    important: notes.important ? !body.important : body.important,
  };
  const notesCopy = [...notes];
  notes = notesCopy.map((n) => (n.id !== id ? n : changedNote));
  res.json(changedNote);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
