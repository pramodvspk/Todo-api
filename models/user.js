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
				len : [7,991]
			}
		}
	},{
		// Add the hooks object after the user is defined
			hooks: {
				beforeValidate : function (user, options){
					//user.email should be lowered
					if (typeof(user.email) == "string"){
						user.email = user.email.toLowerCase();
					}
				}
			}
		});
}