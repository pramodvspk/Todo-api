// Load all the models into sequelize and return the database connection to server.js
// Added the heroku postgres addon 
// Installed 
var Sequelize = require('sequelize');
var env = process.env.NODE_ENV || 'development';
var sequelize;

if (env === 'production') {
	sequelize = new Sequelize(process.env.DATABASE_URL, {
		dialect: 'postgres'
	});
} else {
	sequelize = new Sequelize(undefined, undefined, undefined, {
	dialect: 'sqlite',
	'storage': __dirname+ '/data/dev-todo-api.sqlite'
});
}


var db = {};

db.todo = sequelize.import(__dirname+ '/models/todo.js');
db.user = sequelize.import(__dirname+ '/models/user.js');
db.token = sequelize.import(__dirname+ '/models/token.js');
db.sequelize = sequelize;
db.Sequelize = Sequelize;

/*
Adding the one to many relationship between the user and the todo
--A todo belongs to a user
db.todo.belongsTo(db.user);
--A user has many todos
db.user.hasMany(db.todo);
*/
db.todo.belongsTo(db.user);
db.user.hasMany(db.todo);
module.exports = db;