// initialize datatable
var mytable;

$(document).ready(function() {
    mytable = $('#datatable').DataTable({
    	"processing": true,
    	"serverSide": true,
    	"ajax": "/datatable",
    	
    	// make row red
    	"createdRow": function( row, data, dataIndex, cells ) {
			if ( parseFloat(data[5]) > 30 ) {
				$(row).addClass('table-danger');
			}
		},
		"order": [[ 1, "desc" ]]
    });
});

// get references to DOM elements
let commit_hash = document.getElementById("commit_hash");
let branch_name = document.getElementById("branch_name");
let os = document.getElementById("os");
let cpu = document.getElementById("cpu");
let mem = document.getElementById("mem");
let note = document.getElementById("note");

let startTime = document.getElementById("startTime");
let endTime = document.getElementById("endTime");

// generate random data for inserting
function randomizeFields() {
    commit_hash.value = (Math.random()*1e32).toString(32).slice(0,8);             // random alphanumeric hash string
    branch_name.selectedIndex = Math.floor(Math.random() * Math.floor(3));    // half Master, half Dev branch
    os.selectedIndex = Math.floor(Math.random() * Math.floor(2));            // half Android, half iOS
    cpu.value = (Math.random() < 0.1 ? Math.random() * 5 + 30 : Math.random() * 30).toFixed(2);;   // 1/10 greater than 30, 9/10 less than 30
    mem.value = (Math.random() < 0.1 ? Math.random() * 10 + 10 : Math.random() * 10).toFixed(2);;  // 1/10 greater than 10, 9/10 less than 10
    note.value = "Lorem Ipsum";
}

// Create the XHR object.
function createCORSRequest(method, url) {
    let xhr = new XMLHttpRequest();
    xhr.open(method, url, true);  // call its open method
    return xhr;
}


// insert field data into database
function insertRow() {
    let mydata = {
        "commit_hash": commit_hash.value,
        "branch_name": branch_name.value,
        "os": os.value,
        "cpu": cpu.value,
        "mem": mem.value,
        "note": note.value
    };
    let url = "/data";

    // checking if browser does CORS
    let xhr = createCORSRequest('POST', url);
    if (!xhr) { throw new Error('CORS not supported'); }
    xhr.setRequestHeader('Content-type', 'application/json');

    xhr.onload = function() {
        let responseStr = xhr.responseText;
        let status = xhr.status;
        console.log(responseStr,status);

        if(status == 400) { // failure
            // document.getElementById("errormessage").textContent = "Invalid username or password";
        }
        else if(status == 200) { 
            // clear fields
            commit_hash.value = "";
            branch_name.selectedIndex = 0;
            os.selectedIndex = 0;
            cpu.value = "";
            mem.value = "";
            note.value = "";

            // reload table
            mytable.draw();
        }
        else {
            console.log("should not happen");
        }
    };

    xhr.onerror = function() { alert('Error occured.'); };

    xhr.send(JSON.stringify(mydata));
}

// place current time in text boxes
function fillTimes() {
    let now = new Date();
    startTime.value = now.toLocaleDateString("en-US") +" "+ now.toTimeString().slice(0,8);
    endTime.value = now.toLocaleDateString("en-US") +" "+ now.toTimeString().slice(0,8);
}

fillTimes();

// get the data for the rows
function queryRows() {
    queried = true;
    document.getElementById("mychart").style.height = "auto";
    let parsedStart = new Date(startTime.value);
    let parsedEnd = new Date(endTime.value);
    let url = "/data?startTime="+parsedStart+"&endTime="+parsedEnd;

    // checking if browser does CORS
    let xhr = createCORSRequest('GET', url);
    if (!xhr) { throw new Error('CORS not supported'); }

    xhr.onload = function() {
        let responseStr = xhr.responseText;
        let status = xhr.status;
        console.log(responseStr,status);

        if(status == 400) { // failure
            // document.getElementById("errormessage").textContent = "Invalid username or password";
        }
        else if(status == 200) { 
            let mydata = JSON.parse(xhr.responseText);
            
            // re-format row data for chart
            let cpu_time = [];
            let mem_time = [];
            for(let i = 0; i < mydata.length; i++) {
                cpu_time.push({
                    t : new Date(mydata[i].create_time),
                    y : mydata[i].cpu
                });
                mem_time.push({
                    t : new Date(mydata[i].create_time),
                    y : mydata[i].mem
                });
            }

            // calculate moving avg
            let cpu_avg = [];
            let mem_avg = []
            for (var i = 2; i < cpu_time.length-2; i++)
            {
                let avg = (cpu_time[i].y + cpu_time[i+1].y + cpu_time[i+2].y + cpu_time[i-1].y + cpu_time[i-2].y)/5.0;
                cpu_avg.push({
                    t: cpu_time[i].t,
                    y: avg
                });
                avg = (mem_time[i].y + mem_time[i+1].y + mem_time[i+2].y + mem_time[i-1].y + mem_time[i-2].y)/5.0;
                mem_avg.push({
                    t: mem_time[i].t,
                    y: avg
                });
            }
            
            // console.log(cpu_time);
            generateChart(cpu_time, cpu_avg, mem_time, mem_avg);
        }
        else {
            console.log("should not happen");
        }
    };

    xhr.onerror = function() { alert('Error occured.'); };

    xhr.send();
}

// generate chart using chartjs
function generateChart(cpu_data, cpu_avg, mem_data, mem_avg) {
    // reset canvas
    let chartcontainer = document.getElementById("chart_container");
    chartcontainer.removeChild(document.getElementById("mychart"));
    
    let newchart = document.createElement("canvas");
    newchart.width = 800;
    newchart.height = 400;
    newchart.id="mychart";
    chartcontainer.appendChild(newchart);
    let context = newchart.getContext('2d');

    // create datasets/lines
    cpu_dataset = {
        label: 'CPU %',
        borderColor: 'rgba(100,149,237, 0.0)',
        pointBackgroundColor: 'rgba(100,149,237, 0.3)',
        data: cpu_data,
        showline: false,
        borderWidth: 0,
        fill: false
    }
    cpu_avg_dataset = {
        label: 'CPU Average',
        borderColor: 'rgba(100,149,237, 0.6)',
        data: cpu_avg,
        fill: false,
        showline: true,
        pointRadius: 0,
        type: 'line'
    }
    mem_dataset = {
        label: 'Memory %',
        borderColor: 'rgba(205,92,92, 0.0)',
        pointBackgroundColor: 'rgba(205,92,92, 0.3)',
        showline: false,
        borderWidth: 0,
        data: mem_data,
        fill: false
    }
    mem_avg_dataset = {
        label: 'Memory Average',
        borderColor: 'rgba(205,92,92, 0.6)',
        data: mem_avg,
        showline: true,
        pointRadius: 0,
        fill: false,
        type: 'line'
    }

    // create the chart
    var myChart = new Chart(context, {
        type: 'line',
        data: { datasets: [cpu_dataset, cpu_avg_dataset, mem_dataset, mem_avg_dataset] },
        options: {
            responsive: true,
            title: {
                display: true,
                text: 'CPU/Memory Usage'
            },
            bezierCurve: false,
            scales: {
                xAxes: [{
                    type: 'time',
                    distribution: 'series',
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Time'
                    },
                    time: {
                        unit: 'hour',
                        // unitStepSize: 1,
                        displayFormats: {
                            'minute': 'HH:mm',
                            'hour': 'MMM DD HH:mm',
                            'day': 'MMM DD YYYY',
                            min: '00:00',
                            max: '23:59'
                        }
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'Percentage'
                    },
                    ticks: {
                        beginAtZero: true,
                        steps: 10,
                        stepValue: 10,
                        max: 100
                    }
                }]
            }
        }
    });
}

