//Initializing the required npm modules
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
//Setting up the port on which the application is going to run
var PORT = process.env.PORT || 3000;

var todos = [];
var todoNextId = 1;

// Middleware call to bodyParser, so that it converts all the incoming data into JSON format
app.use(bodyParser.json());

// GET /
// GET the home page, which returns a welcome string 
app.get('/', function (req, res){
	res.send('Todo API root');
});

// GET /todos
// GET all the todo items
app.get('/todos', function (req, res){
	res.json(todos);
});

// GET /todos/:id
// GET todo items by Id
app.get('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	if (matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}
});

//POST /todos
//POST a todo item
app.post('/todos', function (req, res) {
	var body = req.body;
	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}else{
		var newTodo = _.pick(body,'description','completed')
		newTodo.id = todoNextId++;
		todos.push(newTodo);
		res.json(todos);
	}
});

// DELETE /todos/:id
// DELETE a todo item and return it back to the user
app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	if (matchedTodo){
		todos = _.without(todos, matchedTodo);
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}
});
app.listen(PORT, function () {
	console.log("Express listening on port"+ PORT + "!");
})