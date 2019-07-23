// This app sends data for the datatable

require('dotenv').config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const connection = require('./database')

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

// handler for datatable
app.get('/benchmark', function(req, res, next) {
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

// port
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`App listening on port ${PORT}`);
});