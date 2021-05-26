const express = require("express");
const cors = require("cors");

const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User not found!" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameExists = users.some(
    (usernameExists) => usernameExists.username === username
  );

  if (usernameExists) {
    return response.status(400).json({ error: "This username exists!" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const userTodo = user.todos;

  return response.status(200).json(userTodo);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todo);

  return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.find((userTodoIndex) => userTodoIndex.id === id);

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  todoIndex.title = title;
  todoIndex.deadline = new Date(deadline);

  return response.status(200).json(todoIndex);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.find((userTodoIndex) => userTodoIndex.id === id);

  if (!todoIndex) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  if (todoIndex.done == false) {
    todoIndex.done = true;
    return response.status(200).json(todoIndex);
  } else {
    return response
      .status(404)
      .json({ msg: "This Todo has already been made!" });
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoIndex = user.todos.findIndex(
    (userTodoIndex) => userTodoIndex.id == id
  );

  if (todoIndex < 0) {
    return response.status(404).json({ error: "Todo not found!" });
  }

  user.todos.splice(todoIndex, 1);

  return response.status(204).send();
});

module.exports = app;
