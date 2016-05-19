//Initializing the required npm modules
var express = require('express');
var bodyParser = require('body-parser');
var _ = require('underscore');
var db = require('./db.js');
var app = express();
var middleware = require('./middleware.js')(db);
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
app.get('/todos', middleware.requireAuthentication, function (req, res){
	var query = req.query;
	// The where condition for querying
	var where ={};

	if (query.hasOwnProperty("completed") && query.completed === "true"){
		where.completed = true;
	} else if (query.hasOwnProperty("completed") && query.completed === "false"){
		where.completed = false;
	}

	if (query.hasOwnProperty("q") && query.q.length>0){
		where.description = {
			$like: "%"+query.q+"%"
		};
	}

	db.todo.findAll({where: where}).then(function (todos) {
		res.json(todos);
	}, function (e){
		res.status(500).send();
	});
});

// GET /todos/:id
// GET todo items by Id
app.get('/todos/:id', middleware.requireAuthentication, function (req, res){
	var todoId = parseInt(req.params.id,10);
	db.todo.findById(todoId).then(function (todo) {
		//truthy value
		if(!!todo){
			res.json(todo.toJSON());	
		}else {
			res.status(404).send();
		}
	}).catch(function (e){
		// Issue with the server and all
		res.status(500).json(e);
	})
});

//POST /todos
//POST a todo item
app.post('/todos', middleware.requireAuthentication, function (req, res) {
	var body = req.body;
	var newTodo = _.pick(body,'description','completed');
	db.todo.create(newTodo).then(function(todo){
		/* 	Create the association between the user and the todo
			Update the todo item
			Return the new todo item to the api caller	*/
		req.user.addTodo(todo).then(function () {
			return todo.reload();
		}).then(function (todo) {
			res.json(todo.toJSON());
		});
	}).catch(function (e){
		res.status(400).json(e);
	});
});

// DELETE /todos/:id
// DELETE a todo item and return it back to the user
app.delete('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var todoId = parseInt(req.params.id, 10);
	var where = {id : todoId};
	db.todo.destroy({where}).then(function (rowsDeleted) {
		if(rowsDeleted == 0){
			return res.status(404).json({
				error: "No todo found with id "+todoId
			});
		}else {
			// 204 signifies that no content need to be sent along with the OK Status
			res.json()
		}
	}, function (e) {
		res.status(500).send();
	});
});


// PUT /todos/:id
// Update a todo item
app.put('/todos/:id', middleware.requireAuthentication, function (req, res) {
	var body = req.body;
	var todoId = parseInt(req.params.id, 10);
	var body = _.pick(body,'description','completed');
	var attributes = {};

	// The attribute validation is being done with the model, like the datatype check
	if (body.hasOwnProperty('completed')){
		attributes.completed = body.completed;
	}

	if (body.hasOwnProperty('description')){
		attributes.description = body.description;
	}

	db.todo.findById(todoId).then(function (todo) {
		if (todo) {
			todo.update(attributes).then(function (todo) {
				res.json(todo.toJSON());
			}, function (e) {
					res.status(400).json(e);
			});
		} else {	
			res.status(404).send();
		}
	}, function () {
		res.status(500).send();
		// The below promises are if the todo update goes well and if it doesnt go well
	})

});

//POST /users
//Create a user account
app.post('/users', function (req, res) {
	var body = req.body;
	var newUser = _.pick(body,'email','password');
	db.user.create(newUser).then(function (user) {
		res.json(user.toPublicJSON());
	},function (e) {
		res.status(400).json(e);
	});
});

//POST /users/login
//Login a user 
app.post('/users/login', function (req, res) {
	var body = _.pick(req.body, "email", "password");

	db.user.authenticate(body).then(function (user) {
		var token = user.generateToken('authentication');
		if (token){
			res.header('Auth', token).json(user.toPublicJSON());	
		} else {
			res.status(401).send();
		}
	}, function () {
		res.status(401).send();
	});
});

db.sequelize.sync({force: true}).then(function (){
	app.listen(PORT, function () {
		console.log("Express listening on port"+ PORT + "!");
	});
});
