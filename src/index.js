const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const foundUser = users.find( (user) => user.username === username );

  if(!foundUser) return response.status(404).json({ error: "User not found!"});

  request.foundUser = foundUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const alreadyExist = users.some(user => user.username === username)

  if(alreadyExist) return response.status(400).json({error: "User already Exist!"})

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }

  users.push(user);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
 
  return response.json(foundUser.todos)

});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const { title, deadline } = request.body;

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  foundUser.todos.push(todo);

  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const  { title, deadline } = request.body;
  const { id } = request.params;
  
  const indexOfTodo = foundUser.todos.findIndex( (todo) => todo.id === id)

  if(indexOfTodo < 0) return response.status(404).json({ error: "Todo Not Found! "});

  foundUser.todos[indexOfTodo].title = title;
  foundUser.todos[indexOfTodo].deadline = new Date(deadline);

  return response.json(foundUser.todos[indexOfTodo]);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const { id } = request.params;

  const indexOfTodo = foundUser.todos.findIndex( (todo) => todo.id === id )

  if(indexOfTodo < 0) return response.status(404).json({ error: "Todo Not Found!"});

  foundUser.todos[indexOfTodo].done = true;

  return response.json(foundUser.todos[indexOfTodo]);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { foundUser } = request;
  const { id } = request.params;

  const foundTodo = foundUser.todos.find( (todo) => todo.id === id )

  if(!foundTodo) return response.status(404).json({error: "Todo Not Found"})

  foundUser.todos.splice(foundTodo);

  return response.status(204).json(foundUser);
});

module.exports = app;