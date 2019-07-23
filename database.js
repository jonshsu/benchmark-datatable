
// connect to the MySql database

const mysql = require('mysql');

config = {
	// host: process.env.DB_HOST,
	socketPath: `/cloudsql/${process.env.DB_INSTANCE_NAME}`,
	user: process.env.DB_USER,
	database: process.env.DB_DATABASE,
	password: process.env.DB_PASS
};

if (
  process.env.DB_INSTANCE_NAME &&
  process.env.NODE_ENV === 'production'
) {
  config.socketPath = `/cloudsql/${process.env.DB_INSTANCE_NAME}`;
}

let connection = mysql.createConnection(config);

connection.connect(function(err) {
	if (err) {
		console.error('Error connecting: ' + err.stack);
		return;
	}
	console.log('Connected as thread id: ' + connection.threadId);
});

module.exports = connection;