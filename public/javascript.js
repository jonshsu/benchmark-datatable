$(document).ready(function() {
    $('#datatable').DataTable({
    	"processing": true,
    	"serverSide": true,
    	"ajax": "/benchmark",
    	
    	// make row red
    	"createdRow": function( row, data, dataIndex, cells ) {
			if ( parseFloat(data[5]) > 30 ) {
				$(row).addClass('table-danger');
			}
		},
		"order": [[ 1, "desc" ]]
    });
});