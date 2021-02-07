var data = [];
var future = [];
if( localStorage.getItem("data") )
{
	//console.log( localStorage.getItem("data") );
	data = JSON.parse(localStorage.getItem("data"));
}