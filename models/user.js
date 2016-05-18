// A specific format since we load using sequelize.imports
var bcrypt = require('bcryptjs');
var _ = require('underscore');

module.exports = function (sequelize, Datatypes) {
	var user = sequelize.define('user', {
		email: {
			type : Datatypes.STRING,
			allowNull : false,
			unique : true,
			validate : {
				isEmail : true
			}
		},
		salt: {
			type: Datatypes.STRING
		},
		password_hash: {
			type: Datatypes.STRING
		},
		password : {
			type : Datatypes.VIRTUAL,
			allowNull : false,
			validate : {
				len : [7,991]
			},
			set: function (value) {
				var salt = bcrypt.genSaltSync(10);
				var hashedPassword = bcrypt.hashSync(value, salt);

				this.setDataValue('password', value);
				this.setDataValue('salt', salt);
				this.setDataValue('password_hash', hashedPassword);
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
			},
			instanceMethods:{
				toPublicJSON: function () {
					var json = this.toJSON();
					return _.pick(json, "id", "email","createdAt","updatedAt");
				}
			},
			classMethods:{
				authenticate: function (body) {
					return new Promise(function (resolve, reject) {
						if(!typeof(body.email) == "string" || !typeof(body.password) == "string"){
							console.log("Rejecting because not strings");
							return reject();
						}else{
							user.findOne({where:{email : body.email.toLowerCase()}}).then(function (user) {
								if (!user || !bcrypt.compareSync(body.password, user.get('password_hash'))){
									//Unauthorized response
									console.log("Rejecting because pwd didnt match");
									return reject();
								}
								resolve(user);
							}),function (e) {	
								return reject();
							}
						}
					});
				}
			}
		});
	return user;
}