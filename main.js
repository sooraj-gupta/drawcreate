function $( query )
{
	var els = document.querySelectorAll( query );
	return els.length == 1 ? document.querySelector( query ) : els;
}

var saved = true; 

$("#showsidebar").onclick = function()
{
	$("#sidebar").classList.toggle("show");
	$("#bottombar").classList.toggle("show");
	this.classList.toggle("show");
}

$("#save").onclick = function()
{
	for( var i = 0; i < data.length; i++ )
	{
		dataS += "{\"x\":"+data[i].x+",\"y\":"+data[i].y+",\"lastX\":"+data[i].lastX+",\"lastY\":"+data[i].lastY+",\"end\":"+data[i].end+",\"c\":\""+data[i].c+"\"}";
		if( i != data.length - 1)
		{
			dataS+= ",";
		}
	}
	dataS += "]";
	console.log( dataS );
	localStorage.setItem("data", dataS);
	dataS = '[';
	saved = true;
	showMessage("Saved!");
}
$("#download").onclick = function()
{
	var link = document.getElementById('link');
	link.setAttribute('download', $("input").value+'.png');
	link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
}

function showMessage( msg )
{
	$("#message").innerHTML = msg;
	$("#message").classList.remove("movedown");
	void $("#message").offsetWidth;
	$("#message").classList.add("movedown");
}

var colBtns = $( ".col" );
colBtns.forEach
(
	function( currentValue )
	{
		currentValue.onclick = function( )
		{
			col = this.innerHTML;
			for( var i = 0; i < colBtns.length; i++ )
			{
				colBtns[i].classList.remove( "disabled" );
			}
			this.classList.add("disabled");
		}
	}
)


$("#undo").onclick = function()
{
	if( data.length > 0 ){
		var idx = -1;
		for( var i = data.length-2; i > 0; i-- )
		{
			if( data[i]["end"] )
			{
				idx = i;
				break;
			}
		}
		var temp = [];
		for( var i = 0; i <= idx; i++ )
		{
			temp.push( data[i] );
		}
		for ( var i = idx + 1; i < data.length; i++ )
		{
			future.push( data[i] );
		}
		data = temp;
		bg(bgCol);
		setup();
		showMessage("Undo!");
	}
}

$("#redo").onclick = function()
{
	if( future.length > 0 )
	{
		var idx = -1;
		for( var i = future.length-2; i >= 0; i-- )
		{
			if( future[i]["end"] )
			{
				idx = i;
				break;
			}
		}
		var temp = [];
		for( var i = 0; i <= idx; i++ )
		{
			temp.push( future[i] );
		}
		for ( var i = idx + 1; i < future.length; i++ )
		{
			data.push( future[i] );
		}
		future = temp;
		bg(bgCol);
		setup();
		showMessage("Redo!");
	}
	
}
var mouseX = 0;
var mouseY = 0;
var lastX = -1;
var lastY = -1;
let isDrawing = false;



$("#clear").onclick = function()
{
	clear();
	updateSideBar();
}

var can = document.getElementById("canvas");
var c = can.getContext("2d");
c.canvas.width  = window.innerWidth;
c.canvas.height = window.innerHeight;

window.onresize = function()
{
	c.canvas.width  = window.innerWidth;
	c.canvas.height = window.innerHeight;
}


var col = stringColor( 255, 255, 0 );

var bgCol =  stringColor( 0,0,0);
	
function stringColor( r, g, b )
{
	return `rgb( ${r}, ${g}, ${b} )`;
}
function bg( color )
{
//	c.fillStyle = color;
//	c.fillRect( 0, 0, c.canvas.width, c.canvas.height );
	c.clearRect(0,0,c.canvas.width, c.canvas.height );
}
function clear()
{	
	data = [];
	data.length = 0;
	dataS = "[";
	lastX = -1;
	lastY = -1;
	c.clearRect(0,0,c.canvas.width, c.canvas.height );
	bg( bgCol);
	showMessage("Cleared!");
}


bg( bgCol );


window.onbeforeunload = () => { return saved; } ;

document.addEventListener( "mousedown", event =>
{
	isDrawing = true;
	c.beginPath();
});
document.addEventListener( "touchstart", event =>
{
	isDrawing = true;
	c.beginPath();
});
						  
document.addEventListener( "mousemove", event =>
{
	
	if( isDrawing )
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
		saved = false;
		draw();
	}	
});
document.addEventListener( "touchmove", event =>
{
	
	if( isDrawing )
	{
		mouseX = event.touches[0].clientX;
		mouseY = event.touches[0].clientY;
		saved = false;
		draw();
	}	
});

document.addEventListener( "mouseup", event =>
{
	isDrawing = false;
	draw();
	c.closePath();
	lastX = -1;
	lastY = -1;
});
document.addEventListener( "touchend", event =>
{
	isDrawing = false;
	draw();
	c.closePath();
	lastX = -1;
	lastY = -1;
});

var dataS = "[";

function updateSideBar()
{
	if( data.length )
		$("#clear").classList.remove("disabled");
	else
		$("#clear").classList.add("disabled");
}
function setup()
{
	
	updateSideBar();
	var lastCol = data.length ? data[0].c : stringColor(255,255,255);
	c.beginPath();
	for( var i = 0; i < data.length; i++ )
	{
		col = data[i].c
		if( col != lastCol )
		{
			c.closePath();
			c.stroke();			
			c.beginPath();
			lastCol = col;
		}
		if( col == "black" || col == "#000" || col == "#000000" )
			col = "white";
		c.strokeStyle = col;
		c.moveTo( data[i].lastX, data[i].lastY );
		c.lineTo( data[i].x, data[i].y);
		//console.log( !data[i].end ? "" :data[i].end );
	}
	c.closePath();
	c.stroke();	
		
}
function draw()
{
	
	c.strokeStyle = col;
	
	if( lastX != -1 )
	{
		c.moveTo(lastX, lastY);
		c.lineTo(mouseX, mouseY);
		c.stroke();
		data.push( {"x": mouseX, "y": mouseY, "lastX": lastX, "lastY": lastY, "end": !isDrawing, "c":col } );
		updateSideBar();
	}
	lastX = mouseX;
	lastY = mouseY;
	
}

setup();
