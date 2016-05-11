var express = require('express');
var bodyParser = require('body-parser');
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
	var returnResponse;

	todos.forEach(function (todo){
		if(todoId == todo.id){
			returnResponse = todo;
		}
	});
	if(returnResponse){
		res.json(returnResponse)
	}else{
		res.status(404).send();
	}
});

//POST request /todos
app.post('/todos', function (req, res) {
	//Add the id field
	//Add the todo field
	var body = req.body;
	var newTodo = {
		id: todoNextId++,
		description: body.description,
		completed: body.completed
	}
	todos.push(newTodo);
	res.json(todos);

});

app.listen(PORT, function () {
	console.log("Express listening on port"+ PORT + "!");
})