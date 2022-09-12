
var  monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

var d = new Date();
var month = monthNames[d.getMonth()];
var date = d.getDate();
var year = d.getFullYear();

// document.getElementById("date101").innerHTML  =  d.getDate();
// document.getElementById("month101").innerHTML = month;
// document.getElementById("year101").innerHTML  = year;
	


// Comments
 // $(document).ready(function() { 
$(".comment").click(function(){
	
	$(".startHidden").fadeToggle();
});
 // });

