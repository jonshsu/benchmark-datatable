# Benchmark Datatable
[Website Link](https://solid-daylight-247504.appspot.com/)  
This website displays a sortable, searchable, paginated datatable with server-side processing and randomly seeded benchmark data. Rows where CPU % > 30 are highlighted red. 

### Tools used
Frontend:
 - [DataTables](https://datatables.net/) jQuery library
 - Bootstrap
 - `index.html` and `javascript.js` in `/public`

Backend: 
 - Google App Engine
 - Node.js/Express
 - [Knex](https://www.npmjs.com/package/knex)/MySQL for migration, seeding and querying
 - [Faker.js](https://www.npmjs.com/package/faker) for random data
 - `app.js` is main server with request handlers, `database.js` connects to the database, `knexfile.js` sets up Knex for seeding/migration

Database: 
 - Google Cloud Sql (MySql)
 - Seed can be found in [`seeds/benchmark.js`](https://github.com/jonshsu/benchmark-datatable/blob/master/seeds/benchmark.js)
 - Migration can be found in [`migrations/20190722011936_benchmark.js`](https://github.com/jonshsu/benchmark-datatable/blob/master/migrations/20190722011936_benchmark.js)

### Summary
The DataTable is initialized with the jQuery library and sends an Ajax request to get data. The request contains parameters: search value, column sort order, page length, offset. 

The server queries the database for: total number of rows, number of rows after filtering (searching), entry (row) data. These are sent back and the table is populated. 

### Notes
Default sort is by time. 1/10 of entries have CPU > 30%. 1/10 of entries have Notes. Search by time using the format `2006-04-25T23:59:03.244Z`. Search uses basic string matching. 