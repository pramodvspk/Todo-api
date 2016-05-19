// A specific format since we load using sequelize.imports
var bcrypt = require('bcryptjs');
var _ = require('underscore');
var cryptojs = require('crypto-js');
var jwt = require('jsonwebtoken');

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
			// The set function actually sets the password by encrypting it
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
				},
				generateToken: function (type) {
					// new encrypted token which is returned back to the user
					if(!_.isString(type)){
						// If the type is not string then return it back
						return undefined;
					}
					
					try {
						//Encrypting user information as well as creating new JSON web token
						// Takes the user JSON data and converts it into a string beacuse AES encrypt only knows how to encrypt a string
						var stringData = JSON.stringify({id: this.get('id'), type: type});
						// This returns our encrypted string
						var encryptedData = cryptojs.AES.encrypt(stringData,'abc123@!@#').toString();
						// Encrypting user information inside of a secret token and should return it
						var token = jwt.sign({
							token: encryptedData
						}, 'qwerty098');

						return token;
					} catch (e) {
						console.error(e);
						return undefined;
					}
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
				},
				findByToken: function(token) {
					return new Promise(function (resolve, reject) {
						try {
							// Since data was encrypted and token was created, now will have to decode the token and decrypt the data
							// Decoding the token using verify method which takes the token and the secret key
							var decodedJWT = jwt.verify(token, 'qwerty098');
							var bytes = cryptojs.AES.decrypt(decodedJWT.token, 'abc123@!@#');
							var tokenData = JSON.parse(bytes.toString(cryptojs.enc.Utf8));

							//so finally tokenData contains the id and the authentication type
							/*
							3 reasons to reject
							1. If try catch fails if the token is not in a valid format
							2. findById fails if the database wasnt proprtly connected
							3. or if the id provided doesnt exist in the database
							*/
							user.findById(tokenData.id).then(function (user) {
								if(user){
									resolve(user);
								} else{
									console.log("Here at 3");
									reject();
								}
							}, function (e) {
								console.log("Here at 2");
								reject();
							})
						} catch (e) {
							console.error(e);
							reject();
						}
					});
				}
			}
		});
	return user;
}