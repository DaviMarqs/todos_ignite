const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request?.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const userAlredyExists = users.find((user) => user.username === username);

  if (userAlredyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    name,
    username,
    id: uuidv4(),
    todos: [],
  });

  return response.status(201).send(users);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  console.log(user, "userrrrrrrrrrrrrr");
  const { title, deadline } = request.body;

  const newTodo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoToAtt = user.todos.filter((todo) => todo.id === id);

  if (todoToAtt === []) {
    return response.status(404).json({
      error: "No todo find!",
    });
  }

  todoToAtt[0].title = title;
  todoToAtt[0].deadline = deadline;

  return response.status(200).json(todoToAtt);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoToAtt = user.todos.filter((todo) => todo.id === id);

  if (todoToAtt === []) {
    return response.status(404).json({
      error: "No todo find!",
    });
  }

  todoToAtt[0].done = true;

  return response.status(200).json(todoToAtt);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todoIndex = user.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).json();
});

module.exports = app;
