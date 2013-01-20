$(start)

var canvas = null;
var ctx = null;
var ship = null;
var width = 800;
var height = 600;
var size = 32;
var theGrid = new Array();
var currentPlayer = null;
var player = new Array();

var hintScreen = null;
var ctxHint = null;
var hint = null;


var player1View = $('<div>Player1: <b id="p1p">0</div></div>')
var player2View = $('<div>Player2: <b id="p2p">0</div></div>')

function start()
{
	width = 16*size;
	height= 16*size;
	
	newHint();
	
	player.push({name:"player1",color:"red",id:2})
	player.push({name:"player2",color:"green",id:3})
	currentPlayer = 1;
	
	prepareGrid(16,16);
	prepareScreen();	
	
	gameLoop();
	//window.setInterval("gameLoop()",10);
}

function contains(arr,el)
{
	for(var i in arr){
		if(arr[i] == el) return true;
	}
	return false;
}

function aiClick()
{
	var field = {x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*16)}
	while(!isValidMove(field.x,field.y)){
		field = {x:Math.floor(Math.random()*16),y:Math.floor(Math.random()*16)}
	}	
	clickAt(field.x,field.y)	
}

function isValidMove(x,y){
	if(theGrid[x][y] == player[currentPlayer].id) return false;
	var partner = 0
	try{ if(theGrid[x-1][y] == 1) partner++; } catch(e) {}
	try{ if(theGrid[x+1][y] == 1) partner++; } catch(e) {}
	try{ if(theGrid[x][y+1] == 1) partner++; } catch(e) {}
	try{ if(theGrid[x][y-1] == 1) partner++; } catch(e) {}
	if(partner == 0) return false
	return true;
}

function getComponent(x,y) 
{
	var todo = new Array();
	todo.push({x:x,y:y})
	var done = new Array();

	while(todo.length > 0){
		var current = todo.pop();
		for(var dx = -1; dx<2; dx++){
			for(var dy = -1; dy<2; dy++){
				if((dx == 0 && dy == 0) || Math.abs(dx)+Math.abs(dy) > 1) continue;
				try{
					var x = current.x+dx;
					var y = current.y+dy;
					var field = {x:x,y:y}
					if(theGrid[x][y] != 0 && !contains(done,field) && !contains(todo.field)){
						todo.push(field)		
					}
				}
				catch(e){}
			}
		}
	}
	
	return done;
}


function prepareScreen()
{
	canvas = $('<canvas id="gameScreen"/>');
	hintScreen = $('<canvas style="margin-left:50px;" id="hintScreen"/>');
	
	$('body').append(player1View)
	$('body').append(player2View)
	$('body').append(canvas);
	$('body').append(hintScreen);

	
	ctx = canvas[0].getContext('2d');
	canvas[0].width = width;
	canvas[0].height = height;		
	
	hintScreen[0].width = 3*32;
	hintScreen[0].height = 3*32;
	ctxHint = hintScreen[0].getContext('2d');
	
	canvas.bind('click',click)	
}

function prepareGrid(x,y)
{
	for( var i=0; i<x; i++){
		theGrid.push(new Array());
		for( var j=0; j<y; j++){
			if(Math.random() < 0.7) {theGrid[i].push(0);}
			else {theGrid[i].push(1);}
		}	
	}
}

function drawBackground()
{
	ctx.fillStyle = "navy";	
	ctx.fillRect(0,0,width,height);	
	
	ctxHint.fillStyle = "black";	
	ctxHint.fillRect(0,0,3*32,3*32);
	ctxHint.fillStyle = "grey";	
	for(var x=0; x<4; x++){
		for(var y=0; y<4; y++){
			ctxHint.fillRect(x*32+4,y*32+4,24,24);
		}
	}	
	
	ctxHint.fillStyle = player[currentPlayer].color;
	ctxHint.fillRect(32+4,32+4,24,24);
	ctxHint.fillStyle = "yellow";
	ctxHint.fillRect((hint.x+1)*32+8,(hint.y+1)*32+8,16,16);
}

function drawGrid()
{	
	for( var x=0; x<theGrid.length; x++)
	{		
		for( var y=0; y<theGrid[x].length; y++)
		{
			
			if(0 == theGrid[x][y])
			{
				ctx.fillStyle = "navy";
				ctx.fillRect(x*32,y*32,32,32)
				ctx.fillStyle = "blue";
				ctx.fillRect(x*32+4,y*32+4,24,24)
			}
			else
			{
				ctx.fillStyle = "black";
				ctx.fillRect(x*32,y*32,32,32)
				switch(theGrid[x][y])				
				{
					case 2 : ctx.fillStyle = "darkred"; break;
					case 3 : ctx.fillStyle = "darkgreen"; break;
					default : ctx.fillStyle = "grey"; break;
				}
				
				ctx.fillRect(x*32+8,y*32+8,16,16)
				
				switch(theGrid[x][y])				
				{
					case 2 : ctx.fillStyle = "red"; break;
					case 3 : ctx.fillStyle = "green"; break;
					default : ctx.fillStyle = "white"; break;
				}
				
				ctx.fillRect(x*32+12,y*32+12,8,8)
			}			
		}	
	}		
}

function gameLoop()
{		
	nextPlayer();
	newHint();			
	
	drawBackground();
	drawGrid();	
	
	var p1Points = 0;
	var p2Points = 0;
	var free = 0;
	
	for( var x=0; x<theGrid.length; x++){
		for( var y=0; y<theGrid[x].length; y++){
			if(theGrid[x][y] == player[0].id) p1Points++;
			else if(theGrid[x][y] == player[1].id) p2Points++;
			else if(theGrid[x][y] == 1) free++;
		}	
	}
	
	p1Points -= 40;
	
	$('#p1p').html(p1Points)
	$('#p2p').html(p2Points)
	
	if(free == 0){
		var winner = "Player Red";
		if(p1Points < p2Points){
			winner ="Player Green";
		}else if(p1Points == p2Points){
			winner ="no one! Draw!";
		}
		$('body').append($('<div style="position:absolute;top:20;left:150;"><b>GAME OVER : Winner is '+winner+'</b></div>'))
		
		return;
	}
	
	if(currentPlayer == 1){
		aiClick();
	}	
}

function click(evt)
{
	fieldX = Math.floor((evt.pageX-canvas[0].offsetLeft)/size);
	fieldY = Math.floor((evt.pageY-canvas[0].offsetTop)/size);
	
	clickAt(fieldX,fieldY)
}

function clickAt(fieldX,fieldY)
{
	console.log(fieldX,fieldY,player[currentPlayer].color)

	var UNTOUCHED = 0;
	var TOUCHED = 1;
	
	if(theGrid[fieldX][fieldY] == player[currentPlayer].id) return;

	if(theGrid[fieldX][fieldY] == 0) {
		var counter = 0;
		/** you can only click on water if there is something to catch! **/
		for(var dx = -1; dx<2; dx++){
			for(var dy = -1; dy<2 && counter == 0; dy++){
				if((dx == 0 && dy == 0) || Math.abs(dx)+Math.abs(dy) > 1) continue;
				try{
					x = fieldX+dx;
					y = fieldY+dy;
					if(theGrid[x][y] == 1){
						counter = 1;
					}
				}
				catch(e){}
			}
		}
		if(counter == 0) return;
	}

	
	var checkGrid = new Array();
	for(var x=0; x<theGrid.length; x++){
		checkGrid.push(new Array())
		for(var y=0; y<theGrid[x].length; y++){
			checkGrid[x][y] = UNTOUCHED;
		}
	}
	
	var touched = new Array();	
	touched.push({x:fieldX,y:fieldY})
	var newlyTouched = new Array();	
	var enemyTouched = new Array();	
	var enemyPotentials = new Array();	
	ownTouchedNum = 0;
	enemyTouchedNum = 0;
	
	while(touched.length > 0){		
		var current = touched.pop();
		theGrid[current.x][current.y] = player[currentPlayer].id;	
		ownTouchedNum++;
		for(var dx = -1; dx<2; dx++){
			for(var dy = -1; dy<2; dy++){
				if((dx == 0 && dy == 0) || Math.abs(dx)+Math.abs(dy) > 1) continue;
				try{
					x = current.x+dx;
					y = current.y+dy;
					if(theGrid[x][y] == 1 && checkGrid[x][y] == UNTOUCHED){
						newlyTouched.push({x:x,y:y})		
					}else if(theGrid[x][y] == getEnemyId()){
						enemyTouched.push({x:x,y:y})		
					}
				}
				catch(e){}
			}
		}
		
		checkGrid[current.x][current.y] = TOUCHED;	
		while(newlyTouched.length > 0){
			touched.push(newlyTouched.pop());
		}
	}
	
	while(enemyTouched.length > 0){		
		var current = enemyTouched.pop();	
		enemyPotentials.push(current)
		enemyTouchedNum++;
		for(var dx = -1; dx<2; dx++){
			for(var dy = -1; dy<2; dy++){
				if((dx == 0 && dy == 0) || Math.abs(dx)+Math.abs(dy) > 1) continue;
				try{
					x = current.x+dx;
					y = current.y+dy;
					if(theGrid[x][y] == getEnemyId() && checkGrid[x][y] == UNTOUCHED){
						enemyTouched.push({x:x,y:y})	
					}
				}
				catch(e){}
			}
		}
		
		checkGrid[current.x][current.y] = TOUCHED;	
	}

	if(enemyTouchedNum < ownTouchedNum){
		for(o in enemyPotentials){
			theGrid[enemyPotentials[o].x][enemyPotentials[o].y] = player[currentPlayer].id
		}
	}
	
	try{
		theGrid[fieldX+hint.x][fieldY+hint.y] = 0;
	}catch(e){}
	
	gameLoop();	
}

function newHint()
{
	hint = {x:Math.floor(Math.random()*3)-1,y:Math.floor(Math.random()*3)-1}
	while(hint.x == 0 && hint.y == 0){
		hint = {x:Math.floor(Math.random()*3)-1,y:Math.floor(Math.random()*3)-1}
	}
}

function getEnemyId()
{
	if(currentPlayer==0){ return player[1].id}else{return player[0].id}
}

function nextPlayer()
{
	if(currentPlayer==0){currentPlayer=1}else{currentPlayer=0}
}
