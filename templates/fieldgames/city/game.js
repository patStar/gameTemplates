
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
var screenComponents = [];
var infobar = null;
var infoWindow = null;
var selectedField = null;
var floors = new Object();
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
	initScreenComponents();
	
	prepareScreen();	
	updateScreen();
}

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

function FloorComponent(floor,color)
{
	this.floor = floor;
	this.x = 10;
	this.y = 10;
	this.width = 80;
	this.height = 24;
	this.color = color;	
	
	this.draw = function(context,x,y)
	{	
		x = x ? x + this.x : this.x;
		y = y ? y + this.y : this.y;
		
		context.fillStyle="black";
		context.font = "8px Verdana";
		
		context.fillStyle = this.color;			
		context.fillRect(x,y,this.width,this.height);				
		context.fillStyle="black";
		context.fillText(this.floor.name,x+10,y+14);
	};
	
};


function updateInfoWindow() 
{
	infoWindow.childNodes = [];
	if(selectedField)
	{
		for(var i=0; i<selectedField.floors.length; i++)
		{
			var color = null
			if(selectedField.floors[i].type == Floor.SHOP){
				color="red"
			}else if(selectedField.floors[i].type == Floor.PUBLICS){
				color="blue"
			}else if(selectedField.floors[i].type == Floor.OFFICE){
				color="yellow"
			}else{
				color="khaki"
			}		
			
			var floorComponent = new FloorComponent(selectedField.floors[i],color);
			floorComponent.y = infoWindow.height - 30 - i*28;
			floorComponent.level = 2;
			infoWindow.childNodes.push(floorComponent);
		}
	}
}

function ScreenComponent(x,y,width,height){
	this.x = x;
	this.y = y;
	this.width = width;
	this.height = height;
	this.level = 0;
	this.draw = function(ctx){};
	this.childNodes = [];
	this.drawChildNodes = function(context,x,y)
	{
		for(var i in this.childNodes){
			this.childNodes[i].draw(context,x,y);			
		}
	};
}

function initScreenComponents()
{
	infoBar = new ScreenComponent(0,14*size,width,height-14*size);
	infoBar.draw = function(context,x,y)
	{
		x = x ? x + this.x : this.x;
		y = y ? y + this.y : this.y;
		context.fillStyle="grey";
		context.fillRect(x,y,this.width,2);
		context.fillStyle="white";
		context.fillRect(x,y+2,this.width,1);
		context.fillStyle="lightgrey";
		context.fillRect(x,y+3,this.width,this.height-3);
		
		this.drawChildNodes(context, x, y);
	};
	
	infoWindow = new ScreenComponent(20,20,100,150);
	infoWindow.level = 1;
	infoWindow.draw = function(context,x,y)
	{
		x = x ? x + this.x : this.x;
		y = y ? y + this.y : this.y;
		context.fillStyle="darkgrey";
		context.fillRect(x,y,this.width,this.height);
		context.fillStyle="grey";
		context.fillRect(x+2,y+2,this.width-4,this.height-4);
		
		this.drawChildNodes(context,x,y);		
	};
	
	infoBar.childNodes.push(infoWindow);
	
	screenComponents.push(infoBar);
		
}

function drawInfoBar(){

	for(var i in screenComponents){
		screenComponents[i].draw(ctx);
	}
		
	if(selectedField != null){
	
		ctx.font = "8px Verdana";			
		
		// write info text		
		ctx.fillStyle="black";
		ctx.font = "10px Verdana";

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
	
	if((evt.pageY-canvas[0].offsetTop) <= mapHeight && x>=0 && x<=sizeX && y>=0 && y<=sizeY){
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

	if(y <= mapHeight && fieldX>=0 && fieldX<=sizeX && fieldY>=0 && fieldY<=sizeY)
	{
		// klicked at the map!
		if(fieldX == player.x && fieldY == player.y){
			playerSelected = !playerSelected;
		}else if(playerSelected){
			playerSelected = false;
			setPlayer(fieldX,fieldY)
		}
		
		selectedField = theGrid[fieldX][fieldY]
		updateInfoWindow();
	}else{
		// clicked at the infobar
		if(x >= infoWindow.x+infoBar.width && x <= infoWindow.x+infoBar.width+infoWindow.width && y >= infoWindow.y+infoBar.y && y <= infoWindow.y+infoBar.y+infoWindow.height)
		{
			alert(1)
		}
	}
	
	updateScreen();		
}
