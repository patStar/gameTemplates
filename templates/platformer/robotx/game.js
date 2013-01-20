$(start)

var player;
var screenWidth = 1300;
var screenHeight = 700;
var ground = screenHeight - 10;

var jumping = false;
var nextJump = true;
var yAcc = 0
var xAcc = 0;
var direction = 1;
var docked;
var actionColor = "red"

var collidableWorldObjects = null;

var canvas;
var ctx;

var level;

function start()
{
	canvas = $('<canvas id="gameScreen" style="background-color:black"/>');

	$('body').append(canvas);
	
	ctx = canvas[0].getContext('2d');
	canvas[0].width = screenWidth;
	canvas[0].height = screenHeight;		
	
	window.setInterval(tick,0)
	
	level = new Level1();
	level.init();
}

function tick(){
	draw(ctx);
	move();
}

function addCollidableWorldObject(el){

	if(el.collection){
		for(var i in el.collection){
			collidableWorldObjects.push(el.collection[i]);
		}
	}else{
		collidableWorldObjects.push(el);
	}
}

function WorldObject(x,y,width,height,color){
	this.x = x;
	this.y = y;
	this.type = "std"
	this.width = width;
	this.height = height;
	this.color = color;
	this.blocksRight = true;
	this.blocksLeft = true;
	this.blocksTop = true;
	this.blocksBottom = true;
	this.draw = function(ctx){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y-this.height,this.width,this.height)
	}
	this.touch = function(){}
	this.hasKineticBindingX = false
	this.hasKineticBindingY = false
}

/**
 * A small red box Object.
 **/
function Box(x,y,width,height){
	this.x = x;
	this.y = y;
	this.type = Box.type;
	if(width) this.width = width;
	if(height) this.height = height;
	this.hasKineticBindingX = true;
	this.hasKineticBindingY = true;
}
Box.type = "box";
Box.prototype = new WorldObject(0,0,30,30);
Box.prototype.draw = function(ctx){
	ctx.fillStyle = "darkred"
	ctx.fillRect(this.x,this.y-this.height,this.width,this.height)
	ctx.fillStyle = "red"
	var border = 4;
	ctx.fillRect(this.x+border,this.y-this.height+border,this.width-2*border,this.height-2*border)
}

/**
 * A grip Object.
 **/
function Grip(x,y,width,height){
	this.x = x;
	this.y = y;
	this.type = Box.type;
	if(width) this.width = width;
	if(height) this.height = height;
	this.hasKineticBinding = true;
	this.blocksRight = false;
	this.blocksLeft = false;	
	this.blocksTop = false;
	this.blocksBottom = false;
}
Grip.type = "Grip";
Grip.prototype = new WorldObject(0,0,10,10);
Grip.prototype.draw = function(ctx){
	ctx.fillStyle = "orange"
	ctx.fillRect(this.x,this.y-this.height,this.width,this.height)
	ctx.fillStyle = "yellow"
	var border = 2;
	ctx.fillRect(this.x+border,this.y-this.height+border,this.width-2*border,this.height-2*border)
}

/**
 * A portal gun.
 **/
 function HelperDrone(x,y){
	this.x = x;
	this.y = y;
	this.type = HelperDrone.type;
	this.rotation = 0;
	this.active = false;
	this.distance = 90;	
	this.blocksRight = false;
	this.blocksLeft = false;	
	this.blocksTop = false;
	this.blocksBottom = true;
}
HelperDrone.type = "HelperDrone";
HelperDrone.prototype = new WorldObject(0,0,12,4);
HelperDrone.prototype.draw = function(ctx){

	ctx.fillStyle = "blue"
	ctx.fillRect(this.x,this.y-this.height,this.width,this.height)
	ctx.fillStyle = "white"
	ctx.fillRect(this.x,this.y-this.height,this.width,2)
	ctx.fillStyle = "blue"
	
	if(this.active){
	
		if(this.x - player.x > 40){
			this.x--
		}else if(player.x - this.x > 40){
			this.x++
		}
		
		if(this.y - player.y > 90){
			this.y--
		}else if(player.y - this.y > 50){
			this.y++
		}

		ctx.translate(this.x+this.width/2,this.y-this.height/2);
		ctx.save()
		ctx.rotate(this.rotation)
		ctx.fillRect(-this.width/2,-this.height/2,this.width,this.height)
		ctx.restore()
		ctx.translate(-(this.x+this.width/2),-(this.y-this.height/2));
		this.rotation += 1;
	}
}
HelperDrone.prototype.activate = function(){
	this.active = true;
}

/**
 * A stasis chamber object.
 **/
function StasisChamber(x,y,containment){
	this.x = x;
	this.y = y;
	this.type = StasisChamber.type;
	this.on = true;	
	this.containment = containment
	this.blocksRight = false;
	this.blocksLeft = false;	
	this.blocksBottom = true;
	this.blocksTop = false;
}
StasisChamber.type = "StasisChamber";
StasisChamber.prototype = new WorldObject(0,0,25,50);
StasisChamber.prototype.draw = function(ctx)
{	
	ctx.fillStyle = "grey"
	ctx.fillRect(this.x,this.y-this.height,this.width,5)	
	if(this.on){
		if(Math.random() < 0.5){
			ctx.fillStyle = "lightblue"			
		}else if(Math.random() < 0.5){
			ctx.fillStyle = "lightgreen";
		}else{
			ctx.fillStyle = "orange"
		}
		ctx.fillRect(this.x,this.y-this.height+5,this.width,this.height-10)
	}	
	ctx.fillStyle = "grey"
	ctx.fillRect(this.x,this.y-5,this.width,5)
}
StasisChamber.prototype.remoteCall = function(){
	this.on = !this.on;
	if(!this.on && this.containment){
		this.containment.activate();
		this.containment = null;
	}
}

/**
 * A controll console object.
 **/
function ControllConsole(x,y,controlledObject){
	this.x = x;
	this.y = y;
	this.type = ControllConsole.type;
	this.on = false;	
	this.controlledObject = controlledObject;
	this.lastTouched = null;
	this.blocksRight = false;
	this.blocksLeft = false;	
	this.blocksBottom = false;
	this.blocksTop = false;
}
ControllConsole.type = "ControllConsole";
ControllConsole.prototype = new WorldObject(0,0,8,15);
ControllConsole.prototype.draw = function(ctx)
{			
	ctx.fillStyle = "darkgrey"
	ctx.fillRect(this.x,this.y-this.height,this.width,this.height)
}
ControllConsole.prototype.touch = function()
{			
	if(this.controlledObject && this.lastTouched != lastEnter){
		this.lastTouched = lastEnter;
		this.controlledObject.remoteCall();
	}
}

function CapturedDrone(x,y)
{
	this.x = x;
	this.y = y;
	this.type = ControllConsole.type;
	this.collection = [];
	
	var drone = new HelperDrone(this.x+16,this.y-24);
	var stasisChamber = new StasisChamber(this.x+10,this.y,drone);	
	var console = new  ControllConsole(this.x,this.y,stasisChamber)
	
	this.collection.push(stasisChamber)
	this.collection.push(console)
	this.collection.push(drone)
	
}
CapturedDrone.prototype = new WorldObjectCollection();
CapturedDrone.type = "CapturedDrone";

function WorldObjectCollection(){};



function Level1(){}
Level1.prototype.init = function()
{	
	player = new WorldObject(10,400,16,32,"white")
	
	collidableWorldObjects = [];
	
	//ceiling
	addCollidableWorldObject(new WorldObject(0,10,1300,10,"green"))
	
	addCollidableWorldObject(new WorldObject(-300,700,600,300,"green"))
	addCollidableWorldObject(new WorldObject(600,700,100,400,"green"))
	addCollidableWorldObject(new WorldObject(800,700,100,500,"green"))
	addCollidableWorldObject(new WorldObject(980,120,400,20,"green"))
	addCollidableWorldObject(new WorldObject(1000,700,400,450,"green"))
	addCollidableWorldObject(new WorldObject(50,20,10,10,"lightgrey"))	
	addCollidableWorldObject(new WorldObject(200,300,300,20,"green"))
	addCollidableWorldObject(new CapturedDrone(440,280))
	addCollidableWorldObject(new Grip(10,300,100))
	addCollidableWorldObject(new Grip(10,250,100))
	addCollidableWorldObject(new Box(40,50))
	addCollidableWorldObject(new Box(90,400))
	addCollidableWorldObject(new Box(650,230,100,15))
	addCollidableWorldObject(new WorldObject(930,200,40,10,"blue"))	
	addCollidableWorldObject(new WorldObject(0,700,1300,200,"yellow"))	
}

function draw(ctx)
{
	ctx.fillStyle = "black"	
	ctx.fillRect(0,0,screenWidth,screenHeight)
	
	for(var i in collidableWorldObjects){
		collidableWorldObjects[i].draw(ctx);
	}
	
	player.draw(ctx)	
		
	if(keymap['key_'+ENTER_KEY]){
		// draw arm
		if(direction===1){
			ctx.fillRect(player.x + player.width,player.y-player.height/2,6,6)			
		}else{
			ctx.fillRect(player.x - 6			,player.y-player.height/2,6,6)
		}		
		// set eye color
		ctx.fillStyle = actionColor;
	}else{
		// set eye color
		ctx.fillStyle = "grey"
	}
		
	if(direction===1){
		ctx.fillRect(player.x+10,player.y-28,6,6)
	}else{
		ctx.fillRect(player.x,player.y-28,6,6)
	}
	
}

function getGround()
{		
	var nextGround = getGroundBlock();
	return nextGround.y-nextGround.height;
}

function getCeiling()
{		
	var nextCeiling = getCeilingBlock();
	return nextCeiling.y;
}

function getRight()
{		
	var nextRight = getRightBlock();
	return nextRight.x;
}

function getLeft()
{		
	var nextLeft = getLeftBlock();
	return nextLeft.x+nextLeft.width;
}

function getGroundBlock()
{		
	var nextGround = {y:ground, height:0};
	for(var i in collidableWorldObjects){	
		var o = collidableWorldObjects[i]
		if(o === docked || !o.blocksBottom) continue;
		if(isIntersecting(player.x,player.x+player.width,o.x,o.x+o.width) &&		
			o.y-o.height >= player.y && o.y-o.height < nextGround.y-nextGround.height){
			nextGround = o;			
		}
	}
	return nextGround;
}

function getCeilingBlock()
{		
	var nextCeiling = {y:0, height:0};
	for(var i in collidableWorldObjects){	
		var o = collidableWorldObjects[i]
		if(o === docked || !o.blocksTop) continue;
		if(isIntersecting(player.x,player.x+player.width,o.x,o.x+o.width) && o.y <= (player.y-player.height) && o.y > nextCeiling.y){
			nextCeiling = o;			
		}
	}
	return nextCeiling;
}

function getRightBlock()
{		
	var nextRight = {x:screenWidth, width:0};
	for(var i in collidableWorldObjects){	
		var o = collidableWorldObjects[i]
		if(o === docked || !o.blocksRight) continue;
		if(isIntersecting(player.y-player.height,player.y,o.y-o.height,o.y) && o.x >= (player.x+player.width) && o.x < nextRight.x){
			nextRight = o;			
		}
	}
	return nextRight;
}

function getLeftBlock()
{		
	var nextLeft = {x:0, width:0};
	for(var i in collidableWorldObjects){		
		var o = collidableWorldObjects[i]
		if(o === docked || !o.blocksLeft) continue;
		if(isIntersecting(player.y-player.height,player.y,o.y-o.height,o.y) && o.x <= player.x && o.x > nextLeft.x){
			nextLeft = o;			
		}
	}
	return nextLeft;
}

function canTouch( el )
{
	var touchables = [Box.type,ControllConsole.type,HelperDrone.type]
	return $.inArray(el.type,touchables) > -1;
}

function canDock( el )
{
	var dockables = [Grip.type,Box.type]
	return $.inArray(el.type,dockables) > -1;
}

function isIntersecting(a1,b1,a2,b2){
	return(b1 > a2 && b2 > a1)
}

function touches(docked)
{		
	if(isIntersecting(player.y-player.height/2,player.y-player.height/2+6,docked.y-docked.height,docked.y))
	{		
		if(direction == 1 && isIntersecting(player.x+player.width,player.x+player.width+6,docked.x,docked.x+docked.width)){
			return true;							
		}else if(direction == -1 && isIntersecting(player.x-6,player.x,docked.x,docked.x+docked.width)){
			return true;					
		}
	}

	return false;
}


function move(){	

	var directionChanged = false;
	
	xAcc = 0;	
	
	if(keymap['key_'+RIGHT_KEY]){
		xAcc = 1
		directionChanged = (direction == -1)
		direction = +1;		
	}
	if(keymap['key_'+LEFT_KEY]){		
		xAcc = 1
		directionChanged = (direction == +1)
		direction = -1;
	}
	
	if(jumping){
		xAcc *= 0.5;
	}
	
	if(docked && keymap['key_'+ENTER_KEY]){
	
		if(directionChanged && docked.hasKineticBindingX){
			docked.x = 2*(player.x+8)-docked.x-docked.width
		}
		else if(!touches(docked,true)){
			docked = null;
		}
	}
	else if(keymap['key_'+ENTER_KEY]){
		for(var i in collidableWorldObjects){
			if(canTouch(collidableWorldObjects[i]) && touches(collidableWorldObjects[i])){
				collidableWorldObjects[i].touch();
				if(canDock(collidableWorldObjects[i])){
					docked = collidableWorldObjects[i];		
				}
			}
		}		
		
		if(keymap['key_'+DOWN_KEY] && getGroundBlock().color === "blue" && player.y > getCeiling() + player.height){					
			getGroundBlock().y -= 1;
			player.y -= 1;
		}
	}else{
		docked = null;
	}
		
	if(player.y == getGround() && keymap['key_'+UP_KEY]  && yAcc == 0 && player.y == getGround() && nextJump){		
		jumping = true;
		yAcc = -20;		
		nextJump = true;
	}	
	
	if((yAcc != 0 || player.y < getGround()) && nextJump) {
		if(docked){
			if(docked.hasKineticBindingY){
				docked.y = Math.min(Math.max(Math.min(docked.y+yAcc,getGround()), getCeiling() + player.height),screenHeight)
				player.y = Math.min(Math.max(Math.min(player.y+yAcc,getGround()), getCeiling() + player.height),screenHeight)
			}
		}else{
			player.y = Math.min(Math.max(Math.min(player.y+yAcc,getGround()), getCeiling() + player.height),screenHeight)
		}
		if(yAcc <= 0){
			yAcc+=3;		
		}else{
			yAcc++;		
		}
		nextJump = false;
		if(player.y == getGround()){			
			xAcc = 0;
			window.setTimeout(function(){
				nextJump = true
				jumping = false;
				yAcc = 0;			
			;},100);
		}else{
			window.setTimeout(function(){nextJump = true;},30);
		}
	}	
	
	player.x = Math.max(Math.min(player.x + direction * xAcc,getRight()-player.width),getLeft());	
	if(docked && docked.hasKineticBindingX){
		docked.x = Math.max(Math.min(docked.x + direction * xAcc,screenWidth-docked.width),0);
	}		
		
	if(player.y == getGround() && getGroundBlock().color === "yellow"){
		level.init();
	}
}

var lastEnter = null;

var keymap = new Object();

var LEFT_KEY = 37;
var UP_KEY = 38;
var RIGHT_KEY = 39;
var DOWN_KEY= 40;
var ENTER_KEY = 13;

window.onkeypress = function(event) {
	keymap['key_'+event.keyCode] = true;	
	if(event.keyCode == ENTER_KEY){
		lastEnter = new Date().getTime();
	}	
};	

window.onkeyup = function(event) {
	keymap['key_'+event.keyCode] = false;	
	if(event.keyCode == ENTER_KEY){
		lastEnter = null;
	}
}