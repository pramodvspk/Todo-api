//Initializing the required npm modules
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js')
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

// GET /todos?completed=true&q=house - todo items with conditions
// GET /todos - all the todo items
app.get('/todos', function (req, res){
	var queryParams = req.query;
	var filteredTodos = todos;
	if (queryParams.hasOwnProperty("completed") && queryParams.completed === "true"){
		filteredTodos = _.where(filteredTodos, {completed: true});
	}else if(queryParams.hasOwnProperty("completed") && queryParams.completed === "false") {
		filteredTodos = _.where(filteredTodos, {completed: false});
	}

	if (queryParams.hasOwnProperty("q") && queryParams.q.length>0){
		filteredTodos = _.filter(filteredTodos, function(todo){
			return(todo.description.toLowerCase().indexOf(queryParams.q.toLowerCase()) > -1);
		});
	}

	res.json(filteredTodos);
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
	var newTodo = _.pick(body,'description','completed');
	db.todo.create(newTodo).then(function(todo){
		res.json(todo.toJSON());
	}).catch(function (e){
		res.status(400).json(e);
	});

/*	if (!_.isBoolean(body.completed) || !_.isString(body.description) || body.description.trim().length === 0) {
		return res.status(400).send();
	}else{
		var newTodo = _.pick(body,'description','completed');
		newTodo.id = todoNextId++;
		todos.push(newTodo);
		res.json(todos);
	}*/
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


// PUT /todos/:id
// Update a todo item
app.put('/todos/:id', function (req, res) {
	var body = req.body;
	var todoId = parseInt(req.params.id, 10);
	var matchedTodo = _.findWhere(todos, {id:todoId});
	var body = _.pick(body,'description','completed');
	var validAttributes = {};

	//Handling the not found request
	if (! matchedTodo){
		return res.status(404).send();
	}

	//Handling the bad syntax request
	if (body.hasOwnProperty('completed') && _.isBoolean(body.completed)){
		validAttributes.completed = body.completed;
	}else if (body.hasOwnProperty('completed')){
		//Runs if the attribute completed has been provided and is not valid
		return res.status(400).send();
	}

	if (body.hasOwnProperty('description') && _.isString('description') && body.description.trim().length > 0){
		validAttributes.description = body.description;
	}else if (body.hasOwnProperty('description')) {
		//Runs if the attribute description has been provided and is not valid
		return res.status(400).send();
	}

	/*
	New underscore method extend which has source and destination
	_.extend(destination, *sources)
	_.extend({name: 'moe'}, {age: 50});
	=> {name: 'moe', age: 50}
	Here the source is validAttributes and the destination is todos item where is going to be updated
	*/

	_.extend(matchedTodo, validAttributes);
	res.json(matchedTodo);

});

db.sequelize.sync().then(function (){
	app.listen(PORT, function () {
		console.log("Express listening on port"+ PORT + "!");
	});
});
