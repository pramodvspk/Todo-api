// A specific format since we load using sequelize.imports

module.exports = function (sequelize, Datatypes) {
	return sequelize.define('user', {
		email: {
			type : Datatypes.STRING,
			allowNull : false,
			unique : true,
			validate : {
				isEmail : true
			}
		},
		password : {
			type : Datatypes.STRING,
			allowNull : false,
			validate : {
				len : [7,90]
			}
		}
	});
}