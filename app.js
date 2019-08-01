// This app sends data for the datatable

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database')
const rateLimit = require("express-rate-limit");

// Rate Limiter
const limiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 1000 // limit each IP to 10-0 requests per windowMs
});

// serve frontend files
app.use(express.static('public'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Store total rows, query filtered rows
function totalRows(err, rows, fields, req, res, names, searchquery) {
	if (err) throw err;
	recordsTotal = rows[0].total;

	connection.query(
	"SELECT COUNT(*) AS total FROM benchmark"+searchquery,
	(err, rows, fields) => {filteredRows(err, rows, fields, req, res, recordsTotal, searchquery, names)});
}

// Store filtered rows, query table data
function filteredRows(err, rows, fields, req, res, recordsTotal, searchquery, names) {
	if (err) throw err;
	
	recordsFiltered = rows[0].total;;
	
	direction = (req.query.order[0].dir == "asc" ? "asc" : "desc");
	
	sqlquery = "SELECT * FROM benchmark"+searchquery+" ORDER BY "+names[req.query.order[0].column]+" "+ direction +" LIMIT "+parseInt(req.query.length)+" OFFSET "+parseInt(req.query.start);
	
	connection.query(sqlquery, 
		(err, results, fields) => {selectData(err, results, fields, req, res, recordsTotal, recordsFiltered)});
}

// Send back table data
function selectData(err, results, fields, req, res, recordsTotal, recordsFiltered) {
	if (err) throw err;

	// Convert object to array, format datetime
	arr = [];
	for(i = 0; i < results.length; i++) {
		arr.push(Object.values(results[i]));
		arr[i][1] = arr[i][1].toLocaleString();
	}

	sendback = {
		"draw": req.query.draw,
		"recordsTotal": recordsTotal,
		"recordsFiltered": recordsFiltered,
		"data": JSON.parse(JSON.stringify(arr))
	}

	res.send(sendback);
}


// handler to send back filtered row data
function getData(req, res) {

	if(req.query.startTime != undefined && req.query.startTime != undefined) {

		let starttime = new Date(req.query.startTime);
		let endtime = new Date(req.query.endTime);

		let sqlquery = "SELECT * FROM benchmark WHERE create_time BETWEEN ? AND ? ORDER BY create_time desc";
		let values = [starttime, endtime];

		connection.query(sqlquery, values, function(err, result) {
			if(err) {
				throw err;
				res.send("Data not found.")
				res.status(404);
			}
			else {
				res.send(result);
				res.status(200);
			}
		})
	}
	else {
		console.log("Invalid query.");
		res.send("Invalid query.");
		res.status(400)
	}

}

// Insert data into benchmark
function insertData(req, res) {
	let sqlquery = "INSERT INTO benchmark(create_time, commit_hash, branch_name, os, cpu, mem, note) VALUES(?, ?, ?, ?, ?, ?, ?)";
	let new_datetime = new Date(); 
	
	// validate body
	if(req.body.commit_hash==undefined || req.body.branch_name==undefined || req.body.os==undefined || req.body.cpu==undefined || req.body.mem==undefined) {
		console.log("Invalid query.");
		res.send("Invalid query.");
		res.status(400);
	}
	else {
		let values = [new_datetime, req.body.commit_hash, req.body.branch_name, req.body.os, req.body.cpu, req.body.mem, req.body.note];

		// insert data
		connection.query(sqlquery, values, function(err, result) {
			if (err) {
				throw err;
				res.send("Could not insert data.");
				res.status(503);
			}
			else {
				// console.log("Inserted: ", values);
				res.send("Inserted data.");
				res.status(201);
			}
		});
	}
}

// handler for datatable
app.get('/datatable', function(req, res, next) {
	searchquery = "";
	const names = ['id', 'create_time', 'commit_hash', 'branch_name', 'os', 'cpu', 'mem', 'note'];
	
	// create query if searching for value
	if(req.query.search.value != "") {
		searchstring = "%" + connection.escape(req.query.search.value).slice(1,-1) + "%";
		searchquery = " WHERE "
		for(i = 0; i < names.length; i++) {
			searchquery += names[i] + " LIKE '" + searchstring + "'";
			if(i != names.length - 1) searchquery += " OR ";
		}
	}

	// Query total rows from database
	connection.query("SELECT COUNT(*) AS total FROM benchmark", 
		(err, rows, fields) => {totalRows(err, rows, fields, req, res, names, searchquery)});
});

app.route('/data')
	.get(getData) // handler for querying
	.post(insertData); // handler for inserting

app.post('/')

// port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});