var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var app = express();
var PORT = process.env.PORT || 3000;
/*var todos = [{
	id: 1,
	description: "Meet mom for lunch",
	completed: false
	}];
*/

var todos = [];
var todoNextId = 1;

app.use(bodyParser.json());

app.get('/', function (req, res){
	res.send('Todo API root');
});

// GET /todos
// GET /todos/1
app.get('/todos', function (req, res){
	res.json(todos);
});

app.get('/todos/:id', function (req, res){
	var todoId = parseInt(req.params.id,10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	if (matchedTodo){
		res.json(matchedTodo);
	}else{
		res.status(404).send();
	}
});

//POST request /todos
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

app.delete('/todos/:id', function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	if (matchedTodo){
		todos = _.without(todos, matchedTodo);
		console.log("The removed todo item is " + matchedTodo);
		res.json(todos);
	}else{
		res.status(404).send();
	}
});
app.listen(PORT, function () {
	console.log("Express listening on port"+ PORT + "!");
})