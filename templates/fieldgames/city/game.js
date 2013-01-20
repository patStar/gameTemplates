
function Floor(name, type) {this.name = name, this.type = type}
Floor.LIVING = "LIVING"
Floor.SHOP = "SHOP"
Floor.PUBLICS = "PUBLICS"
Floor.PUBLICS = "OFFICE"

function Field(type,x,y)
{ 
	this.type=type; 
	this.x=x; 
	this.y=y;
	
	this.floors = new Array();
}

Field.PARK = "PARK"
Field.BUILDING = "BUILDING"
Field.PLACE = "PLACE"

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
	seen:false,
	explored:false,
	fogOfWar:true,
	
	floors:null,
	
	containsFloorType:function(type){
		for(var i in this.floors){
			if(this.floors[i].type == type) return true;
		}
		return false;
	}
}

$(start)

var news = new Array({x:-1,y:0,name:"left"},{x:1,y:0,name:"right"},{x:0,y:-1,name:"bottom"},{x:0,y:+1,name:"top"});
var minimeImg = new Image();
minimeImg.src = "img/minime.png";

var canvas = null;
var ctx = null;

var width = null;
var height = null;
var mapHeight = null;
var size = 32;
var sizeX = 24;
var sizeY = 14;

var selectedField = null;

var theGrid = new Array();

var player = {x:null,y:null}

var playerSelected = false;

function start()
{
	initFloors();
	
	mapHeight = sizeY * size;
	
	width = sizeX*size;
	height= mapHeight+6*size;
	
	prepareGrid(sizeX,sizeY);
	
	prepareScreen();	
	updateScreen();
}

var floors = new Object();

function initFloors(){
	floors[Floor.LIVING] = [];
	floors[Floor.LIVING].push(new Floor("Wohnungen",Floor.LIVING))
	
	floors[Floor.OFFICE] = [];	
	var office = "Fahrschule|Steuerbüro|Kanzlei|Architekt|Versicherung".split("|")
	for(var i in office){
		floors[Floor.OFFICE].push(new Floor(office[i],Floor.OFFICE))
	}
	
	floors[Floor.SHOP] = [];	
	var shops = "Waffenladen|Gartencenter|Skateshop|Handyladen|Fahradladen|Supermarkt|Musikgeschäft|Fischrestaurant|Tabakwarenladen|Comicbuchladen|Café|Bar|Discothek|Pub|Kneipe|Wäscherei|Feinkostladen|Zeitschriftenladen|Schuhladen|Asiashop|Pizzaria|Schuhmacher|Juwelier|Spielwarenladen|Süßwarenladen|Zoohandlung|Créperia|Döneria|Apotheke|Kiosk|Imbiss|Fastfoodrestaurant|Elektroladen|Elektroladen|Buchladen|Gemischtwarenladen|Werkzeuggeschäft|Sportgeschäft".split("|")
	for(var i in shops){
		floors[Floor.SHOP].push(new Floor(shops[i],Floor.SHOP))
	}
	
	floors[Floor.PUBLICS] = [];	
	var publics = "Schwimmhalle|Labor|Sporthalle|Rathaus|Grundschule|Gymnasium|Kindergarten|Universität|Bibliothek|Polizeirevier|Finanzamt|Bank|Museum|Krankenhaus|Feuerwache|Kirche|Verkehrsamt|Gericht".split("|")
	for(var i in publics){
		floors[Floor.PUBLICS].push(new Floor(publics[i],Floor.PUBLICS))
	}
}

function updateScreen() 
{			
	drawBackground();
	drawGrid();	
	drawPlayer();
	drawInfoBar();
}

function drawInfoBar(){

	// draw bar
	ctx.fillStyle="grey"
	ctx.fillRect(0,14*size,width,2)
	ctx.fillStyle="white"
	ctx.fillRect(0,14*size+2,width,1)
	ctx.fillStyle="lightgrey"
	ctx.fillRect(0,14*size+3,width,height-14*size+3)
	
	// draw info window
	ctx.fillStyle="darkgrey"
	ctx.fillRect(20,14*size+23,100,height-(14*size+23+20))
	ctx.fillStyle="grey"
	ctx.fillRect(20+2,14*size+23+2,100-4,height-(14*size+23+20+4))
	
	ctx.font = "8px Verdana"
	
	if(selectedField != null){
		
		if( selectedField.explored){
			// draw floors	
			var we = 100-4-10;
			var he = 24;
			var bottom = height-50;
				
			for(var i=0; i<selectedField.floors.length; i++){
				if(selectedField.floors[i].type == Floor.SHOP){
					ctx.fillStyle="red"
				}else if(selectedField.floors[i].type == Floor.PUBLICS){
					ctx.fillStyle="blue"
				}else if(selectedField.floors[i].type == Floor.OFFICE){
					ctx.fillStyle="yellow"
				}else{
					ctx.fillStyle="khaki"
				}
				
				ctx.fillRect(20+2+5,bottom-(i*(he+5)),we,he)
				if(selectedField.floors[i].type != Floor.SHOP){
					for(var j=0; j<3; j++){
						ctx.fillStyle="black"
						ctx.fillRect(j*28+20+2+5+3,bottom-(i*(he+5))+3,22,he-6)
						ctx.fillStyle="white"
						ctx.fillRect(j*28+20+2+5+4,bottom-(i*(he+5))+4,20,he-8)
					}
				}else{
					ctx.fillStyle="black"
					ctx.fillRect(20+2+5+3,bottom-(i*(he+5))+3,we-8,he-6)
					ctx.fillStyle="white"
					ctx.fillRect(20+2+5+4,bottom-(i*(he+5))+4,we-8,he-8)
				}
				ctx.fillStyle="black"
				ctx.fillText(selectedField.floors[i].name,30,bottom-(i*(he+5))+14)
			}	
		}
		
		// write info text		
		ctx.fillStyle="black"
		ctx.font = "10px Verdana"

		var fieldName = "";
		switch(selectedField.type){
			case Field.PARK : fieldName = "Park"; break;
			case Field.BUILDING : fieldName = "Gebäude"; break;
		}
		
		var attributes = [];
		
		if(selectedField.top || selectedField.left || selectedField.right || selectedField.bottom){
			attributes.push("Teil")
		}
		
		if(!selectedField.explored){
			attributes.push("unerforscht")
		}
			
		var attributeString = attributes.join(", ")	
		if(attributeString.length > 0){
			fieldName += " ["+attributeString+"]"
		}
		
		ctx.fillText(fieldName,140,14*size+23+12)
	}
}

function prepareScreen()
{
	canvas = $('<canvas id="gameScreen"/>');

	$('body').append(canvas);

	ctx = canvas[0].getContext('2d');
	canvas[0].width = width;
	canvas[0].height = height;		
	
	canvas.bind('click',click)	
	canvas.bind('mousemove',mouseMove)
}

function getRandom(arr){	
	return arr[Math.floor(Math.random()*arr.length)];	
}

function drawPlayer()
{
	ctx.drawImage(minimeImg,player.x*size+10,player.y*size+6)
}

function prepareGrid()
{
	for( var x=0; x<sizeX; x++){
		theGrid.push(new Array());
		for( var y=0; y<sizeY; y++){
			var field = null
			var rnd = Math.random() 
			if(rnd < 0.05){
				field = new Field(Field.PUBLICS,x,y);				
				var floor = getRandom(floors[Floor.PUBLICS])
				var floorNum = 2+Math.floor(Math.random()*2)
				for(var i=0; i<floorNum; i++){
					field.floors.push(floor)
				}
			}else if (rnd < 0.15){
				field = new Field(Field.PARK,x,y);				
			}else{
				field = new Field(Field.BUILDING,x,y);								
				var floorNum = 1+Math.floor(Math.random()*3)
				if(Math.random() < 0.25){
					field.floors.push(getRandom(floors[Floor.SHOP]))					
				}
				if(Math.random() < 0.1){
					field.floors.push(getRandom(floors[Floor.OFFICE]))					
				}
				
				for(var i=0; i<floorNum; i++){
					field.floors.push(floors[Floor.LIVING][0])
				}
			}
			theGrid[x].push(field);				
			renderField(x,y)
		}	
	}		
	
	setPlayer(8,8)
}

function setPlayer(x,y){
	
	player.x = x;
	player.y = y;

	theGrid[player.x][player.y].owner = player;
	theGrid[player.x][player.y].seen = true;
	theGrid[player.x][player.y].explored = true;
	
	for(var i in news){
		try{
			theGrid[player.x+news[i].x][player.y+news[i].y].seen = true;
		}catch(e){}
	}
}

function equals(fieldA,fieldB)
{
	return fieldA.type == fieldB.type;	
}

function renderField(x,y) 
{	
	var field = theGrid[x][y];
	
	try{ 
		var equal = equals(field,theGrid[x+1][y])
		if(equal && field.type != Field.PARK) equal = equal && (Math.random() < 0.3)		
		field.right = equal;
		theGrid[x+1][y].left = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x-1][y]) 
		if(equal && field.type != Field.PARK) equal = equal && (Math.random() < 0.3)		
		field.left = equal;
		theGrid[x-1][y].right = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x][y+1]) 	
		if(equal && field.type != Field.PARK) equal = equal && (Math.random() < 0.3)		
		field.bottom = equal;
		theGrid[x][y+1].top = equal;
	} catch(e) {}
	
	try{ 
		var equal = equals(field,theGrid[x][y-1])
		if(equal && field.type != Field.PARK) equal = equal && (Math.random() < 0.3)		
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
			
			ctx.fillStyle = "#333333";				
			ctx.fillRect(x*size,y*size,size,size);										
			
			if(!field.seen){				
				ctx.fillStyle = "black";							
				ctx.fillRect(x*size+1,y*size+1,size-2,size-2);										
				continue;
			}							
			
			var top = 0;
			if(!field.top) {top = size/8}
			var bottom = 0;
			if(!field.bottom) {bottom = size/8}
			var left = 0;
			if(!field.left) {left = size/8}
			var right = 0;
			if(!field.right) {right = size/8}										
						
			if(field.type == Field.PARK )
			{			
				if(!field.explored){	
					ctx.fillStyle = "#004400";
				}else{
					ctx.fillStyle = "gray";				
					ctx.fillRect(x*size,y*size,size,size);	
					ctx.fillStyle = "green";
				}
				ctx.fillRect(x*size+left,y*size+top,size-left-right,size-top-bottom);			
			}
			else
			{
				if(!field.explored){	
					ctx.fillStyle = "#555555";
				}else{
					ctx.fillStyle = "gray";
					ctx.fillRect(x*size,y*size,size,size);	
					ctx.fillStyle = "lightgray";
				}				
				ctx.fillRect(x*size+left,y*size+top,size-left-right,size-top-bottom);				
			}	
			
			var shift = 0;
			if(field.explored && field.containsFloorType(Floor.SHOP)){
				ctx.fillStyle = "red";
				ctx.fillRect(x*size+4+shift,y*size+4,6,6);	
				shift+=6
			}
			
			if(field.explored && field.containsFloorType(Floor.PUBLICS)){
				ctx.fillStyle = "blue";
				ctx.fillRect(x*size+4+shift,y*size+4,6,6);	
				shift+=6
			}	

			if(field.explored && field.containsFloorType(Floor.OFFICE)){
				ctx.fillStyle = "yellow";
				ctx.fillRect(x*size+4+shift,y*size+4,6,6);	
				shift+=6
			}			
		}	
	}	

	if(mouseOver != null){
		ctx.beginPath();
		ctx.strokeStyle = "white"
		ctx.strokeRect(mouseOver.x*size,mouseOver.y*size,size,size);
		ctx.closePath();
	}
	
	if(selectedField != null){
		ctx.beginPath();
		ctx.strokeStyle = "white"
		ctx.strokeRect(selectedField.x*size,selectedField.y*size,size,size);
		ctx.closePath();
	}
}

function click(evt)
{
	x = Math.floor((evt.pageX-canvas[0].offsetLeft));
	y = Math.floor((evt.pageY-canvas[0].offsetTop));
	
	clickAt(x,y);
}

var mouseOver = null;
function mouseMove(evt)
{	
	x = Math.floor((evt.pageX-canvas[0].offsetLeft)/size);
	y = Math.floor((evt.pageY-canvas[0].offsetTop)/size);		
	
	if(x>=0 && x<=sizeX && y>=0 && y<=sizeY){
		mouseOver = {x:x,y:y}
	}else{		
		mouseOver = null;
	}
	
	updateScreen();	
}

/**
 * The window of the infobar that shows informations of the currently selected field.
 **/
function InfoBarWindow(){}
InfoBarWindow.prototype = 
{
	/** The field to display information for in the window. **/
	selectedField : null,
	
	
}

function clickAt(x,y)
{
	var fieldX = Math.floor(x/size)
	var fieldY = Math.floor(y/size)

	if(fieldX>=0 && fieldX<=sizeX && fieldY>=0 && fieldY<=sizeY)
	{
		// klicked at the map!
		if(fieldX == player.x && fieldY == player.y){
			playerSelected = !playerSelected;
		}else if(playerSelected){
			playerSelected = false;
			setPlayer(fieldX,fieldY)
		}
		
		selectedField = theGrid[fieldX][fieldY]
	}else{
		// clicked at the infobar
		
	}
	
	updateScreen();		
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
				if($.inArray(done,field) < 0 && $.inArray(todo,field) < 0){
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
				if((null == field.owner || field.owner == owner) && $.inArray(done,field) < 0 && $.inArray(todo,field) < 0){
					todo.push(field)		
				}
			}
			catch(e){}		
		}
		
		done.push(current)		
	}	
	return done;
}