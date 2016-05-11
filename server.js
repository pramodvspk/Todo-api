var express = require('express');
var app = express();
var PORT = process.env.PORT || 3000;
var todos = [{
	id: 1,
	description: "Meet mom for lunch",
	completed: false
}, {
	id: 2,
	description: "Goto to market",
	completed: false
}, {
	id:3,
	description: "Complete Node.js course",
	completed: true
}];

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

app.listen(PORT, function () {
	console.log("Express listening on port"+ PORT + "!");
})