function $( query )
{
	var els = document.querySelectorAll( query );
	return els.length == 1 ? document.querySelector( query ) : els;
}

var saved = true; 

var lineMode = false;

$("#showsidebar").onclick = function()
{
	$("#sidebar").classList.toggle("show");
	$("#bottombar").classList.toggle("show");
	this.classList.toggle("show");
}

$("#save").onclick = function()
{
	dataS = JSON.stringify(data);
	console.log( dataS );
	localStorage.setItem("data", dataS);
	dataS = "";
	saved = true;
	showMessage("Saved!");
}

$("#share").onclick = function()
{
	var dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data));
	var dlAnchorElem = document.getElementById('link');
	dlAnchorElem.setAttribute("href",     dataStr     );
	dlAnchorElem.setAttribute("download", $("#title").value + ".drawcreate");
	dlAnchorElem.click();
}

function onChange(event) {
	event.preventDefault();
        var reader = new FileReader();
        reader.onload = onReaderLoad;
        reader.readAsText(event.target.files[0]);
    }

    function onReaderLoad(event){
        var obj = JSON.parse(event.target.result);
        data = obj;
		setup();
    }
 
    document.getElementById('file').addEventListener('change', onChange);


$("#download").onclick = function()
{
	var link = document.getElementById('link');
	link.setAttribute('download', $("#title").value+'.png');
	link.setAttribute('href', canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"));
	link.click();
}

$("#line").onclick = function()
{
	lineMode = !lineMode;
	this.classList.toggle( "disabled");
	showMessage("Line Mode " + ( !lineMode ?  "On!" : "Off!" )) ;
}
let keysPressed = {};
document.addEventListener( "keydown", event => {
	if( event.keyCode == 76 ){
		lineMode = !lineMode;
		$("#line").classList.toggle( "disabled");
		showMessage("Line Mode " + ( lineMode ?  "On!" : "Off!" )) ;
	}
	keysPressed[event.key] = true;

	if (keysPressed['Meta'] && keysPressed['Shift'] && event.key == 'z') {
	   redo();
	}
	else if (keysPressed['Meta'] && event.key == 'z') {
		event.preventDefault();
	   undo();
	}
	
	if( event.keyCode == 90 && event.keyCode == 91 ){
		undo();
	}
});
document.addEventListener('keyup', (event) => {
   delete keysPressed[event.key];
});

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
	undo();
}

function undo(){
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
function redo()
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
$("#redo").onclick = function()
{
	redo();
	
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
	dataS = "";
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
	if( !isDrawing )
	{
		lineSX = event.clientX;
		lineSY = event.clientY;
	}
	lineEX = lineSX;
	lineEY = lineSY;
	isDrawing = true;
	c.beginPath();
});

document.addEventListener( "touchstart", event =>
{
	if( !isDrawing )
	{
		lineSX = event.touches[0].clientX;;
		lineSY = event.touches[0].clientY;;
	}
	lineEX = lineSX;
	lineEY = lineSY;
	isDrawing = true;
	c.beginPath();
});
	
var lineSX = -1;
var lineSY = -1;
var lineEX = -1;
var lineEX = -1;
document.addEventListener( "mousemove", event =>
{
	
	if( isDrawing )
	{
		mouseX = event.clientX;
		mouseY = event.clientY;
		lineEX = Math.abs ( mouseX - lineSX ) > 10 ? mouseX : lineSX;
		lineEY = Math.abs ( mouseY - lineSY ) > 10 ? mouseY : lineSY;
		saved = false;
		draw();
	}	
});

$("#bottombar").addEventListener("mousemove", event => {
	isDrawing = false;
} );

$("#bottombar").addEventListener("touchmove", event => {
	isDrawing = false;
} );
$("#sidebar").addEventListener("mousemove", event => {
	isDrawing = false;
} );

$("#sidebar").addEventListener("touchmove", event => {
	isDrawing = false;
} );

document.addEventListener( "touchmove", event =>
{
	
	if( isDrawing )
	{
		mouseX = event.touches[0].clientX;
		mouseY = event.touches[0].clientY;
		lineEX = Math.abs ( mouseX - lineSX ) > 10 ? mouseX : lineSX;
		lineEY = Math.abs ( mouseY - lineSY ) > 10 ? mouseY : lineSY;
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

var dataS = "";

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
	var curCol = lastCol;
	c.beginPath();
	for( var i = 0; i < data.length; i++ )
	{
		curCol = data[i].c
		if( curCol != lastCol )
		{
			c.closePath();
			c.stroke();			
			c.beginPath();
			lastCol = col;
		}
		if( col == "black" || col == "#000" || col == "#000000" )
			col = "white";
		c.strokeStyle = curCol;
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
		if( !lineMode )
		{
			c.moveTo(lastX, lastY);
			c.lineTo(mouseX, mouseY);
			c.stroke();
			data.push( {"x": mouseX, "y": mouseY, "lastX": lastX, "lastY": lastY, "end": !isDrawing, "c":col } );
		}
		else
		{
		
			if( isDrawing )
			{
				bg( 0,0,0 );
				setup();
				c.strokeStyle = col;
				c.beginPath();
				c.moveTo( lineSX, lineSY );
				c.lineTo(lineEX, lineEY);
				c.stroke();
			}
			if( !isDrawing && ( lineSX - lineEX != lineEY - lineSY ) )
			{
				data.push( {"x": lineEX, "y": lineEY, "lastX": lineSX, "lastY": lineSY, "end": !isDrawing, "c":col } );
				c.closePath();
			}
		
		}
		updateSideBar();
	}
	lastX = mouseX;
	lastY = mouseY;
	
}

setup();
