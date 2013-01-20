
/*****************************************************************************/

function Field(type,x,y){ this.type=type; this.x=x; this.y=y;}

Field.SEA = 0;
Field.LAND = 1;

Field.getSeaField = function() { return new Field(Field.SEA); }
Field.getLandField = function() { return new Field(Field.LAND); }

Field.prototype =
{
	x:null,
	y:null,
	type: null,
	top:false,
	left:false,
	right:false,
	bottom:false,
	owner:null,
}

/*****************************************************************************/

function Player(color){ this.color=color;}
Player.prototype =
{
	color: null
}

/*****************************************************************************/

$(start)

var news = new Array({x:-1,y:0,name:"left"},{x:1,y:0,name:"right"},{x:0,y:-1,name:"bottom"},{x:0,y:+1,name:"top"});

var canvas = null;
var ctx = null;

var width = 800;
var height = 600;
var size = 32;
var sizeX = 16;
var sizeY = 16;

var theGrid = new Array();

var currentPlayer = 0;
var player = new Array();

function start()
{
	width = sizeX*size;
	height= sizeY*size;
	
	player.push(new Player("green"))
	player.push(new Player("red"))
	
	prepareGrid(sizeX,sizeY);
	
	prepareScreen();	
	updateScreen();
}

function updateScreen() 
{	
	drawBackground();
	drawGrid();	
}

/**
 * Switches to the next player.
 **/
function nextPlayer()
{
	currentPlayer = (currentPlayer+1)%player.length;
	$('#nextButton').css('background-color',getCurrentPlayer().color);
}

function prepareScreen()
{
	canvas = $('<canvas id="gameScreen"/>');

	$('body').append(canvas);
	$('body').append($('<input id="nextButton" style="background-color:'+getCurrentPlayer().color+'" type="button" value="next" onClick="nextPlayer()"/>'));

	ctx = canvas[0].getContext('2d');
	canvas[0].width = width;
	canvas[0].height = height;		
	
	canvas.bind('click',click)	
}

function prepareGrid()
{
	for( var x=0; x<sizeX; x++){
		theGrid.push(new Array());
		for( var y=0; y<sizeY; y++){
			if(Math.random() < 0.7) {
				theGrid[x].push(new Field(0,x,y));				
			}else{
				theGrid[x].push(new Field(1,x,y));
			}
			renderField(x,y)
		}	
	}		
}

function equals(fieldA,fieldB)
{
	return fieldA.type == fieldB.type && fieldA.owner == fieldB.owner;	
}

function renderField(x,y) 
{	
	var field = theGrid[x][y];
	
	try{ 
		var equal = equals(field,theGrid[x+1][y])
		field.right = equal;
		theGrid[x+1][y].left = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x-1][y])
		field.left = equal;
		theGrid[x-1][y].right = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x][y+1])
		field.bottom = equal;
		theGrid[x][y+1].top = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x][y-1])
		field.top = equal;
		theGrid[x][y-1].bottom = equal;
	} catch(e) {}			
}

function drawBackground()
{
	ctx.fillStyle = "navy";	
	ctx.fillRect(0,0,width,height);	
}

function drawGrid()
{	
	for( var x=0; x<theGrid.length; x++)
	{		
		for( var y=0; y<theGrid[x].length; y++)
		{		
			var field = theGrid[x][y];
			if(field.type == 0)
			{
				ctx.fillStyle = "navy";
				ctx.fillRect(x*size,y*size,size,size);
				ctx.fillStyle = "blue";				
			}
			else
			{
				if(field.owner){
					ctx.fillStyle = field.owner.color;
				}else{
					ctx.fillStyle = "grey";
				}
				ctx.fillRect(x*size,y*size,size,size);				
				ctx.fillStyle = "khaki"; 				
			}			
			
			if(!field.top){
				ctx.fillRect(x*size,y*size,size,size/8);
			}
			if(!field.bottom){
				ctx.fillRect(x*size,y*size+(size-size/8),size,size/8);
			}
			if(!field.left){
				ctx.fillRect(x*size,y*size,size/8,size);
			}
			if(!field.right){
				ctx.fillRect(x*size+(size-size/8),y*size,size/8,size);
			}
		}	
	}		
}

function getCurrentPlayer()
{
	return player[currentPlayer];
}

function click(evt)
{
	x = Math.floor((evt.pageX-canvas[0].offsetLeft)/size);
	y = Math.floor((evt.pageY-canvas[0].offsetTop)/size);
	
	clickAt(x,y);
}

function clickAt(x,y)
{
	if(theGrid[x][y].type == Field.SEA){
		theGrid[x][y].type = Field.LAND;
	}
	
	var component = getNewOwnerComponent(x,y,getCurrentPlayer());
	
	for(var i in component){
		var field = component[i];
		field.owner = getCurrentPlayer();
	}
	
	renderField(x,y);
	
	updateScreen();
	nextPlayer();
}

function contains(arr,el)
{
	for(var i in arr){
		if(arr[i] == el) return true;
	}
	return false;
}

function getComponent(x,y) 
{
	var todo = new Array();	
	var done = new Array();	
	
	todo.push(theGrid[x][y])
	
	while(todo.length > 0)
	{
		var current = todo.pop();				
		for(var i in news){
			try{
				var field = theGrid[current.x+news[i].x][current.y+news[i].y]
				if(field.type != Field.SEA && !contains(done,field) && !contains(todo,field)){
					todo.push(field)		
				}
			}
			catch(e){}		
		}
		done.push(current)
	}	
	return done;
}

function getNewOwnerComponent(x,y,owner) 
{
	var todo = new Array();	
	var done = new Array();
	var news = new Array({x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:+1});
	
	todo.push(theGrid[x][y])
	
	while(todo.length > 0)
	{
		var current = todo.pop();				
		for(var i in news){
			try{
				var field = theGrid[current.x+news[i].x][current.y+news[i].y]
				if(field.type != Field.SEA && (null == field.owner || field.owner == owner) && !contains(done,field) && !contains(todo,field)){
					todo.push(field)		
				}
			}
			catch(e){}		
		}
		
		done.push(current)		
	}	
	return done;
}

