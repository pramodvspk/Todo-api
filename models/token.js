var cryptojs = require('crypto-js');

module.exports = function (sequelize, Datatypes) {

	return sequelize.define('token', {
		token: {
			type: Datatypes.VIRTUAL,
			allowNull: false,
			validation: {
				len: [1]
			},
			// The set function actually sets the password by encrypting it
			set: function (value) {
				var hash = cryptojs.MD5(value).toString();
				this.setDataValue('token', value);
				this.setDataValue('tokenHash', hash);
			}
		},
		tokenHash: Datatypes.STRING
	});
};