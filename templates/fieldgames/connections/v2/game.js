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

function Player(midColor,topColor){ this.midColor=midColor; this.topColor=topColor; this.points=0}
Player.prototype =
{
	midColor: null,
	topColor: null,
	points: null,
}


/*****************************************************************************/

$(start)

var news = new Array({x:-1,y:0},{x:1,y:0},{x:0,y:-1},{x:0,y:+1});
var inews= new Array({x:-1,y:-1},{x:1,y:-1},{x:1,y:1},{x:-1,y:1});

var canvas = null;
var ctx = null;

var width = 800;
var height = 800;
var size = 32;
var sizeX = 16;
var sizeY = 16;
var freeStones = 60;

var info = null;

var theGrid = new Array();

var currentPlayer = 0;
var player = new Array();

function start()
{
	width = sizeX*size;
	height= sizeY*size+10+3*size;
	
	player.push(new Player("#004400","green"))
	player.push(new Player("darkred","red"))	
	
	prepareGrid(sizeX,sizeY);	
	prepareScreen();	
	nextInfo();
		
	updateScreen();
}

function moveTheEarth()
{
	if(Math.random() < 0.5)
	{
		var col = Math.floor(Math.random()*sizeX);
		var field = getField(col,0);
		for(var y=0; y<sizeY-1; y++){
			theGrid[col][y] = theGrid[col][y+1]; 
			theGrid[col][y].y = y;
		}
		theGrid[col][sizeY-1] = field;
		theGrid[col][sizeY-1].y = sizeY-1
	}else{
		var row = Math.floor(Math.random()*sizeY);
		var field = getField(0,row);
		for(var x=0; x<sizeX-1; x++){
			theGrid[x][row] = theGrid[x+1][row]; 
			theGrid[x][row].x = x;
		}
		theGrid[x][sizeX-1] = field;
		theGrid[x][sizeX-1].x = sizeX-1
	}
}

function getFreeStones()
{
	var stones = new Array();

	for( var x=0; x<theGrid.length; x++)
	{		
		for( var y=0; y<theGrid[x].length; y++)
		{
			var field = getField(x,y);
			if(field.owner == null && field.type == Field.LAND) stones.push(field);
		}
	}
	
	return stones;
}

function freeFieldsAvailable()
{
	for( var x=0; x<theGrid.length; x++)
	{		
		for( var y=0; y<theGrid[x].length; y++)
		{
			var field = getField(x,y);
			if(field.owner == null && field.type == Field.LAND) return true;
		}
	}
	
	return false;
}

function nextTurn(again){	

	if(!freeFieldsAvailable()){
		// Game Over
		updateScreen();	
		return;
	}
	
	moveTheEarth()
	if(!again) nextPlayer();
	nextInfo();
	updateScreen();	
}

function updateScreen() 
{	
	drawBackground();
	drawGrid();	
	drawInfo();
}

function drawInfo()
{
	var baseY = size*sizeY+10;
	
	ctx.fillStyle = "#444444";
	ctx.fillRect(0,baseY,3*size,3*size);
				
	for(var x=0; x<3; x++){	
		for(var y=0; y<3; y++){
		
			var border = 0;			
			if(x==1 && y==1){				
				ctx.fillStyle = "black";
				ctx.fillRect(x*size+border,baseY+y*size+border,size-2*border,size-2*border);
				ctx.fillStyle = getCurrentPlayer().midColor;
				var innerBorder = 8;
				ctx.fillRect(x*size+border+innerBorder,baseY+y*size+border+innerBorder,size-2*(border+innerBorder),size-2*(border+innerBorder));
				ctx.fillStyle = "white"
				ctx.fillRect(x*size+border+innerBorder,baseY+y*size+border+innerBorder,2,2);
				ctx.fillStyle = getCurrentPlayer().topColor;
				innerBorder = 10;
				ctx.fillRect(x*size+border+innerBorder,baseY+y*size+border+innerBorder,size-2*(border+innerBorder),size-2*(border+innerBorder));
			} else if (x-1 == info.x && y-1 == info.y) {
				border = 0;
				ctx.fillStyle = "navy";
				ctx.fillRect(x*size+border,baseY+y*size+border,size-2*border,size-2*border);	
				border = 4;
				ctx.fillStyle = "blue";
				ctx.fillRect(x*size+border,baseY+y*size+border,size-2*border,size-2*border);	
			} else {
				border = 2;
				ctx.fillStyle = "grey";
				ctx.fillRect(x*size+border,baseY+y*size+border,size-2*border,size-2*border);				
				ctx.fillStyle = "white";
				ctx.fillRect(x*size+border,baseY+y*size+border,2,2);				
				border = 4;
				ctx.fillStyle = "lightgrey";
				ctx.fillRect(x*size+border,baseY+y*size+border,size-2*border,size-2*border);				
			}
		}
	}

	ctx.font = "bold 80px Verdana"
	ctx.fillStyle = player[0].topColor
	ctx.fillText(""+player[0].points,size*3+20,baseY+80);
	
	ctx.fillStyle = player[1].topColor
	ctx.fillText(""+player[1].points,size*3+220,baseY+80);
}

function getRandom(arr){
	return arr[Math.floor(Math.random()*arr.length)];
}

function nextInfo(){
	if(Math.random() < 0.5){
		info = getRandom(news)
	}else{
		info = getRandom(inews)
	}
}

/**
 * Switches to the next player.
 **/
function nextPlayer()
{
	currentPlayer = (currentPlayer+1)%player.length;	
}

function prepareScreen()
{
	$('body').css('margin-left','100px');

	canvas = $('<canvas id="gameScreen"/>');

	$('body').append(canvas);
	$('body').css('background-color','black')

	ctx = canvas[0].getContext('2d');
	canvas[0].width = width;
	canvas[0].height = height;		
	
	canvas.bind('click',click)	
}

function getRandomField()
{
	return getRandom(getRandom(theGrid));
}

function prepareGrid()
{
	for( var x=0; x<sizeX; x++){
		theGrid.push(new Array());
		for( var y=0; y<sizeY; y++){
			theGrid[x].push(new Field(Field.SEA,x,y));			
		}	
	}

	for(var i=0; i<freeStones; i++){
		var done = false;
		while(!done){
			done = true;
			var field = getRandomField();
			if(field.type == Field.SEA){
				field.type = Field.LAND;
			}else{
				done = false;
			}
		}
	}
}

function drawBackground()
{
	ctx.fillStyle = "black";	
	ctx.fillRect(0,0,width,height);	
	
	ctx.fillStyle = "navy";	
	ctx.fillRect(0,0,width,size*sizeY);	
}

function drawGrid()
{	
	for( var x=0; x<theGrid.length; x++)
	{		
		for( var y=0; y<theGrid[x].length; y++)
		{		
			var field = theGrid[x][y];
			var borderSize = size/8;
			if(field.type == 0)
			{
				ctx.fillStyle = "blue";
				ctx.fillRect(x*size,y*size,size,size);
				ctx.fillStyle = "navy";				
			}
			else
			{
				var midColor = "grey";
				var topColor = "white";
				borderSize *= 2;
				if(field.owner){
					midColor = field.owner.midColor;
					topColor = field.owner.topColor;
				}
				ctx.fillStyle = midColor;
				ctx.fillRect(x*size,y*size,size,size);				
				ctx.fillStyle = "white";
				ctx.fillRect(x*size+borderSize,y*size+borderSize,2,2);				
				ctx.fillStyle = topColor;
				ctx.fillRect(x*size+borderSize+2,y*size+borderSize+2,12,12);				
				ctx.fillStyle = "black"; 				
			}			
			
			if(!field.top){
				ctx.fillRect(x*size,y*size,size,borderSize);
			}
			if(!field.bottom){
				ctx.fillRect(x*size,y*size+(size-borderSize),size,borderSize);
			}
			if(!field.left){
				ctx.fillRect(x*size,y*size,borderSize,size);
			}
			if(!field.right){
				ctx.fillRect(x*size+(size-borderSize),y*size,borderSize,size);
			}
		}	
	}		
}

function getCurrentPlayer()
{
	return player[currentPlayer];
}

function getEnemyPlayer()
{
	return player[(currentPlayer+1)%2];
}

function click(evt)
{
	x = Math.floor((evt.pageX-canvas[0].offsetLeft)/size);
	y = Math.floor((evt.pageY-canvas[0].offsetTop)/size);
	
	clickAt(x,y);
}

function contains(arr,el)
{
	for(var i in arr){
		if(arr[i] == el) return true;
	}
	return false;
}

function getComponent(x,y,owner) 
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
		
		if(current.type != Field.SEA && (null == current.owner || current.owner == owner)){
			done.push(current)		
		}
	}	
	return done;
}

function getField(x,y){
	return theGrid[x][y];
}

function getTop(field){
	return theGrid[field.x][field.y-1]
}
function getBottom(field){
	return theGrid[field.x][field.y+1]
}
function getLeft(field){
	return theGrid[field.x-1][field.y]
}
function getRight(field){
	return theGrid[field.x+1][field.y]
}
function getNeighbours(field){
	var neighbours = new Array();
	try{neighbours.push(getLeft(field))}catch(e){}
	try{neighbours.push(getRight(field))}catch(e){}
	try{neighbours.push(getTop(field))}catch(e){}
	try{neighbours.push(getBottom(field))}catch(e){}
	return neighbours;
}

function hasNeutralLandNeighbours(field, owner){
	try{		
		var left = getLeft(field);
		if(left.owner == null && left.type == Field.LAND) return true;
	}catch(e){}
	try{
		var right = getRight(field);
		if(right.owner == null && right.type == Field.LAND) return true;
	}catch(e){}
	try{
		var top = getTop(field);
		if(top.owner == null && top.type == Field.LAND) return true;
	}catch(e){}
	try{
		var bottom = getBottom(field);
		if(bottom.owner == null && bottom.type == Field.LAND) return true;
	}catch(e){}
	return false;
}

function clickAt(x,y)
{
	var field = getField(x,y);
	
	// no owned fields!
	if(field.owner != null) {
		console.log("Not possible: AREA HAS AN OWNER.")
		return;
	}
	// no sea fields without neighbouring land!
	if(field.type == Field.SEA){		
		if(!hasNeutralLandNeighbours(field)){
			console.log("Not possible: NO NEUTRAL NEIGHBOURS.")
			return;
		}
	}	

	if(theGrid[x][y].type == Field.SEA){
		theGrid[x][y].type = Field.LAND;
	}
	
	var component = getComponent(x,y,getCurrentPlayer());
	
	var counter = 0;
	for(var i in component){
		var field = component[i];				
		if(field.owner != getCurrentPlayer()){
			getCurrentPlayer().points++;
			field.owner = getCurrentPlayer();			
		}
		counter++;
	}
	
	var enemyComponent = getComponent(x,y,getEnemyPlayer());

	if(enemyComponent.length > 0){
		if(enemyComponent.length < counter){
			for(var i in enemyComponent){
				var field = enemyComponent[i];
				field.owner = getCurrentPlayer();
				getCurrentPlayer().points++;
				getEnemyPlayer().points--;			
			}	
		}			
	}
	
	try{
		theGrid[x+info.x][y+info.y].type = Field.SEA;
		if(theGrid[x+info.x][y+info.y].owner){
			theGrid[x+info.x][y+info.y].owner.points--;
			theGrid[x+info.x][y+info.y].owner = null;
		}			
	}catch(e){}
	
	nextTurn();	
}