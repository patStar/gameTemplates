var canvas = null;
var ctx = null;

var width = 800;
var height = 600;

var shipY = height/2;
var shipX = 30;

var bullets = new Array();

var enemies = new Array();
var deadEnemies = new Array();

var enemyBullets = new Array();

var bulletWidth = 8;
var bulletHeight = 4;

var stars = new Array();

var starColors = ["gold","white","lightblue","orange","lightred","lightgreen"];
var lastMouseDown = null;
var mouseIsDown = false;

var shipWeapon = 0;
var ship = new Image();
ship.src = "img/fighter.png";

var lastEnemyAdd = new Date();


function EnemyPart(x,y,img)
{
	this.lastMove = new Date();
	
	this.x = x;
	this.y = y;
	
	this.rotation = 0;
	this.spin = Math.random() * 20 - 10;
	this.dy = Math.random()*5 - 2;
	this.dx = Math.random()*5 - 2;
	
	this.img = img;
}

EnemyPart.UFO_FRONT = new Image();
EnemyPart.UFO_FRONT.src = "img/ufo_yellow_broken_part_1.png";
EnemyPart.UFO_CENTER = new Image();
EnemyPart.UFO_CENTER.src = "img/ufo_yellow_broken_part_2.png";
EnemyPart.UFO_BACK = new Image();
EnemyPart.UFO_BACK.src = "img/ufo_yellow_broken_part_3.png";
EnemyPart.UFO_BASE = new Image();
EnemyPart.UFO_BASE.src = "img/ufo_yellow_broken.png";

EnemyPart.prototype =
{
	width:16,
	height:16,
	x:null,
	y:null,	
	dy:null,
	dx:null,	
	rotation:null,
	spin:null,
	
	img : null,
	
	draw : function(ctx) 
	{
		ctx.save();
		ctx.translate(this.x, this.y);
		ctx.rotate(this.rotation * Math.PI / 180);
		ctx.drawImage(this.img,-10,-10);
		ctx.translate(-this.x, -this.y);
		ctx.restore();
	},
	move : function() 
	{		
		this.rotation += this.spin;
		this.x += this.dx;
		this.y += this.dy;
		this.lastMove = new Date();
	},
};

function Enemy()
{
	this.lastMove = new Date();
	this.lastDirectionChange = new Date();
	this.dy = -1;
	this.dx = -1;
	this.hitPoints = 100;
	
	this.img = new Image();
	this.img.src = "img/ufo_yellow.png";

	this.lastShot = new Date();
	this.points = 50;
}
Enemy.prototype =
{
	width:47,
	height:18,
	x:null,
	y:null,	
	dy:null,
	dx:null,
	lastMove:null,
	lastShot:null,
	points:null,
	
	hitPoints:null,
	
	img : null,
	
	draw : function(ctx) 
	{
		ctx.drawImage(this.img,this.x,this.y);
		
		ctx.fillStyle = "gold";
		ctx.fillRect(this.x,this.y+this.height+5,this.width,6);
		ctx.fillStyle = "red";
		ctx.fillRect(this.x+1,this.y+this.height+6,this.width-2,4);
		ctx.fillStyle = "green";
		ctx.fillRect(this.x+1,this.y+this.height+6,(this.width-2)*(this.hitPoints/100),4);
	},
	move : function() 
	{			
		if(new Date().getTime() - this.lastDirectionChange > 500 && Math.random() < 0.01){
			this.dy *= -1;
			this.lastDirectionChange = new Date();
		}
		this.y = Math.min(height-200,Math.max(100,this.y + this.dy));
		this.x += this.dx;
		this.lastMove = new Date();
		
		if(new Date().getTime() - this.lastShot > 2000 && Math.random() < 0.1)
		{
			enemyBullets.push({x:this.x,y:this.y,lastMoved:new Date()});
			this.lastShot = new Date();
		}		
	},
};

$(start);

function start(){
	initScreen();
}	

var timer = null;
var hitPoints = 100;

function initScreen()
{
	canvas = $('<canvas id="gameScreen">');
	ctx = canvas[0].getContext('2d');
	
	canvas[0].width = width;
	canvas[0].height = height;
	canvas.css({'background-color':'black','cursor':'none'});
	
	canvas.bind('mousemove',mouseMove);
	canvas.bind('mousedown',mouseDown);
	canvas.bind('mouseup',mouseUp);
	
	$('body').append(canvas);	
	
	timer = window.setInterval(tick,0);
	
	for(var i=0; i< 100; i++){
		var star = {x:Math.random()*width,y:Math.random()*height,color:starColors[Math.floor(Math.random()*starColors.length)]};
		stars.push(star);
	}
}

function handleEnemies() {
	
	var newEnemies = new Array();
	for(var i in enemies)
	{			
		if(new Date().getTime() - enemies[i].lastMove > 10){
			enemies[i].move();
		}
		enemies[i].draw(ctx);
		
		if(enemies[i].x < width && enemies[i].x > 0 && enemies[i].y < height && enemies[i].y > 0 ){
			newEnemies.push(enemies[i]);
		}
	}	
	enemies = newEnemies;
	
	var newDeadEnemies = new Array();
	for(var i in deadEnemies)
	{			
		if(new Date().getTime() - deadEnemies[i].lastMove > 100){
			deadEnemies[i].move();
		}
		deadEnemies[i].draw(ctx);
		
		if(deadEnemies[i].x < width && deadEnemies[i].x > 0 && deadEnemies[i].y < height && deadEnemies[i].y > 0 ){
			newDeadEnemies.push(deadEnemies[i]);
		}
	}	
	deadEnemies = newDeadEnemies;
}

function addEnemy() 
{	
	var enemy = new Enemy();
	enemy.x = 700;
	enemy.y = 100+Math.floor(Math.random()*(height-200));
	enemies.push(enemy);
}

function drawBackground()
{
	ctx.fillStyle = "black";
	ctx.fillRect(0,0,width,height);
	
	ctx.fillStyle = "white";
	ctx.fillText(points+" C",15,20);
	
	handleStars();
}

var points = 0;
var newStars = 0;

function gameOver()
{
	window.clearInterval(timer);
	ctx.fillStyle="white";
	ctx.strokeStyle="black";		
	ctx.font = "bold 120px Verdana";
	ctx.fillText("GAME",200,200);
	ctx.strokeText("GAME",200,200);
	ctx.fillText("OVER",200,330);
	ctx.strokeText("OVER",200,330);
	ctx.font = "bold 30px Verdana";	
	ctx.fillText("SCORE: "+points+" Creds",230,390);
	ctx.strokeText("SCORE: "+points+" Creds",230,390);
}

function handleStars()
{	
	var removeableStars = new Array();
	for(var i in stars){
		ctx.fillStyle = stars[i].color;
		ctx.fillRect(stars[i].x,stars[i].y,Math.round(1+Math.random()*2),Math.round(1+Math.random()*2));
		stars[i].x--;
		if(stars[i].x < -1){
			removeableStars.push(stars[i]);
		}
	}
	
	newStars += removeableStars.length;
	
	for(var i in removeableStars){
		removeFromArray(stars,removeableStars[i]);
	}
	
	if(Math.random() < 0.1){
		for(var i=0; i< newStars; i++){
			if(Math.random() < 0.05){
				var star = {x:Math.random()*width,y:Math.random()*height,color:starColors[Math.floor(Math.random()*starColors.length)]};
				stars.push(star);
				newStars--;
				break;
			}
		}
		
	}
}

/** collision detection ---- slooooow */
function checkHits()
{
	// do enemy bullets hit me or scrap?
	var hitEnemyBullets = new Array();
	for(var e in enemyBullets){
		var bullet = enemyBullets[e];		
		for(var i in deadEnemies){
			var enemy = deadEnemies[i];
			if((bullet.x + bulletWidth >= enemy.x && bullet.x <= enemy.x + enemy.width) &&
			   (bullet.y + bulletHeight >= enemy.y && bullet.y <= enemy.y + enemy.height)){
				hitEnemyBullets.push(bullet);
				bullet.checked = true;
				enemy.dx--;
			}
		}
		
		if(!bullet.checked && (bullet.x + 5 >= shipX && bullet.x <= shipX + 20) &&
		   (bullet.y + 5 >= shipY-10 && bullet.y <= shipY + 10)){				
				hitPoints -= 20;
				hitEnemyBullets.push(bullet);
				if(hitPoints < 0){
					gameOver();
					return;
				}
		}	
	}	
	for(var i in hitEnemyBullets){
		removeFromArray(enemyBullets,hitEnemyBullets[i]);
	}

	// does scrab hit me or enemies?
	var hitBullets = new Array();
	var hitEnemies = new Array();
	
	for(var i in deadEnemies){	
		var deadEnemy = deadEnemies[i];
		for(var e in enemies){
			var enemy = enemies[e];
			if(!enemy.hitByADeadEnemy && (deadEnemy.x + 10 >= enemy.x && deadEnemy.x <= enemy.x + enemy.width) &&
			   (deadEnemy.y + 10 >= enemy.y && deadEnemy.y <= enemy.y + enemy.height)){	
					if(Math.random() < 0.5){
						enemy.hitPoints-=1;
					}
					
					if(enemy.hitPoints <= 0){
						hitEnemies.push(enemy);
						enemy.hitByADeadEnemy = true;
						deadEnemies.push(new EnemyPart(enemy.x,enemy.y,EnemyPart.UFO_FRONT));
						deadEnemies.push(new EnemyPart(enemy.x+10,enemy.y,EnemyPart.UFO_CENTER));
						deadEnemies.push(new EnemyPart(enemy.x+20,enemy.y,EnemyPart.UFO_BACK));
						deadEnemies.push(new EnemyPart(enemy.x+10,enemy.y,EnemyPart.UFO_BASE));
					}
			}
		}
	
		if((deadEnemy.x + 10 >= shipX && deadEnemy.x <= shipX + 20) &&
		   (deadEnemy.y + 10 >= shipY-10 && deadEnemy.y <= shipY + 10)){
				hitPoints -= 1;
				if(hitPoints < 0){
					gameOver();
					return;
				}
		}			
	}
		
	for(var b in bullets){
		var bullet = bullets[b];
		for(var e in enemies){
			var enemy = enemies[e];
			if(!enemy.hitByADeadEnemy && (bullet.x + bulletWidth >= enemy.x && bullet.x <= enemy.x + enemy.width) &&
			   (bullet.y + bulletHeight >= enemy.y && bullet.y <= enemy.y + enemy.height)){	
	
				bullet.checked = true;
				hitBullets.push(bullet);
				enemy.hitPoints -= 20;
			   
				if(enemy.hitPoints <= 0){			   
					hitEnemies.push(enemy);
					deadEnemies.push(new EnemyPart(enemy.x,enemy.y,EnemyPart.UFO_FRONT));
					deadEnemies.push(new EnemyPart(enemy.x+10,enemy.y,EnemyPart.UFO_CENTER));
					deadEnemies.push(new EnemyPart(enemy.x+20,enemy.y,EnemyPart.UFO_BACK));
					deadEnemies.push(new EnemyPart(enemy.x+10,enemy.y,EnemyPart.UFO_BASE));
					points += enemy.points;
					break;
				}
			}
		}
		
		if(!bullet.checked){
			for(var e in deadEnemies){
				var enemy = deadEnemies[e];
				if((bullet.x + bulletWidth >= enemy.x && bullet.x <= enemy.x + enemy.width) &&
				   (bullet.y + bulletHeight >= enemy.y && bullet.y <= enemy.y + enemy.height)){						
						hitBullets.push(bullet);
						bullet.checked = true;
						enemy.dx++;
						break;
				}
			}
		}
	}
	
	for(var i in hitEnemies){
		removeFromArray(enemies,hitEnemies[i]);
	}
	
	for(var i in hitBullets){
		removeFromArray(bullets,hitBullets[i]);
	}
}

function removeFromArray(arr,el)
{
	for(var i in arr){
		if(arr[i] == el){
			arr.splice(i,1);
			break;
		}
	}
}

function tick()
{	
	if(new Date().getTime() - lastEnemyAdd > 4000){
		addEnemy();
		lastEnemyAdd = new Date();
	}
	drawBackground();
	handleEnemies();
	mouseDownCheck();
	drawShip();
	drawBullets();
	checkHits();
}

function drawBullets()
{
	var newBullets = new Array();
	for(var i in bullets)
	{
		if((new Date()).getTime() - bullets[i].lastMoved.getTime() > 100){
			bullets[i].x ++;
		}
		ctx.save();
		ctx.fillStyle="white";
		ctx.fillRect(bullets[i].x,bullets[i].y-2,bulletWidth,bulletHeight);
		ctx.restore();
		
		if(bullets[i].x < width && bullets[i].x > 0){
			newBullets.push(bullets[i]);
		}
	}
	
	bullets = newBullets;
	
	var newEnemyBullets = new Array();
	for(var i in enemyBullets)
	{
		if((new Date()).getTime() - enemyBullets[i].lastMoved.getTime() > 10){
			enemyBullets[i].x -=2;
		}
		ctx.save();
		ctx.fillStyle="red";
		ctx.fillRect(enemyBullets[i].x,enemyBullets[i].y-2,5,5);
		ctx.fillStyle="yellow";
		ctx.fillRect(enemyBullets[i].x,enemyBullets[i].y-2,3,3);
		ctx.restore();
		
		if(enemyBullets[i].x < width && enemyBullets[i].x > 0){
			newEnemyBullets.push(enemyBullets[i]);
		}
	}
	
	enemyBullets = newEnemyBullets;
}

function drawShip()
{	
	ctx.drawImage(ship,shipX,shipY-10);

	ctx.fillStyle = "gold";
	ctx.fillRect(shipX,shipY+15,30,6);
	ctx.fillStyle = "red";
	ctx.fillRect(shipX+1,shipY+16,30-2,4);
	ctx.fillStyle = "green";
	ctx.fillRect(shipX+1,shipY+16,(30-2)*(hitPoints/100),4);
}

function handleMouseMove(x,y)
{
	shipY = Math.max(100,Math.min(height-100,y));
	shipX = Math.max(10,Math.min(width-10,x));
}

function mouseMove(evt)
{	
	handleMouseMove(evt.pageX - canvas[0].offsetLeft ,evt.pageY - canvas[0].offsetTop);
}

function mouseDown(evt)
{	
	mouseIsDown = true;
	lastMouseDown = new Date();
	shoot();
}

function mouseUp(evt) { mouseIsDown = false; }

function shoot(){
	if(shipWeapon == 0){
		bullets.push({x:shipX+20,y:shipY,lastMoved:new Date()});
	}else if(shipWeapon == 1){
		bullets.push({x:shipX+28,y:shipY+5,lastMoved:new Date()});
		bullets.push({x:shipX+20,y:shipY-5,lastMoved:new Date()});
	}else if(shipWeapon == 2){
		bullets.push({x:shipX+20,y:shipY+10,lastMoved:new Date()});
		bullets.push({x:shipX+28,y:shipY,lastMoved:new Date()});
		bullets.push({x:shipX+20,y:shipY-10,lastMoved:new Date()});
	}
}

function mouseDownCheck()
{
	if(mouseIsDown && (new Date()).getTime() - lastMouseDown > (200 + shipWeapon*150)){
		shoot();
		lastMouseDown = new Date();
	}
}