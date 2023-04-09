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

const requestTime = (req, res, next) => {
  req.requestTime = new Date();
  next();
};
app.use(requestTime);

app.get("/", (request, response) => {
  response.send("<h1>root</h1>");
});

app.get("/api/notes", (request, response) => {
  response.json(notes);
});

app.get("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  const note = notes.find((note) => note.id === id);
  if (note) {
    response.json(note);
  } else {
    response.status(404).end();
  }
});

app.delete("/api/notes/:id", (request, response) => {
  const id = Number(request.params.id);
  notes = notes.filter((note) => note.id !== id);
  response.status(204).end();
});

const generateId = () => {
  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }
  const maxId = notes.length > 0 ? Math.max(...notes.map((n) => n.id)) : 0;
  return maxId + getRandomInt(99999999);
};

app.post("/api/notes", (request, response) => {
  const body = request.body;
  if (!body.content) {
    return response.status(400).json({
      error: "content missing",
    });
  }
  const note = {
    id: generateId(),
    content: body.content,
    important: body.important,
  };

  if (note.content.length < 1) {
    return response.status(400).json({
      error: "content missing",
    });
  } else if (note.important.length < 1) {
    return response.status(400).json({
      error: "importance missing",
    });
  } else if (note.content.length > 0 && note.important.length > 0) {
    notes = notes.concat(note);
    response.json(note);
  }
});

const requestLogger = (req, res, next) => {
  console.log("Method:", req.method);
  console.log("Path:  ", req.path);
  console.log("Body:  ", req.body);
  console.log("---");
  next();
};
app.use(requestLogger);
const unknownEndpoint = (req, res) => {
  res.status(404).send({error: "unknown endpoint"});
};
app.use(unknownEndpoint);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
