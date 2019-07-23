// Create the benchmark table

exports.up = function(knex, Promise) {
	return knex.schema.createTable('benchmark', table => {
		table.increments('id')
		table.datetime('create_time')
		table.string('commit_hash', 8)
		table.string('branch_name')
		table.string('os', 10)
		table.float('cpu')
		table.float('mem')
		table.string('note')
	});
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('benchmark');
};