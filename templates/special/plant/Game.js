// Adding the canvas object to the body when the page is completely loaded.

var water;
var minerals;
var energy;

var dWater;
var dMinerals;
var dEnergy;

var canvas;
var plantNodes;
var virtualPlantNodes;
var selectedPlantnode;
var axes;

$(function(){
	canvas = new Canvas();
	$('body').append(canvas.canvas)
	canvas.canvas.bind('click',click)
	
	plantNodes = [];
	virtualPlantNodes = [];
	axes = [];
	
	water = 2;
	minerals = 2;
	energy = 2;
	
	dWater = 0;
	dMinerals = 0;
	dEnergy = 0;
	
	plantNodes.push(new PlantNode(400,300,"khaki",PlantNode.SPORE_TYPE,0))
	
	updateScreen()
})

function Axis(x,y,x2,y2)
{
	this.x = x;
	this.y = y;
	this.x2 = x2;
	this.y2 = y2;
	this.draw = function(ctx)
	{
		if(y2 >= 300){
			ctx.strokeStyle = "red";
		}else{
			ctx.strokeStyle = "lightgreen";
		}
		ctx.beginPath();
		ctx.moveTo(this.x,this.y);
		ctx.lineTo(this.x2,this.y2);		
		ctx.closePath();		
		ctx.stroke();
	}
}

function PlantNode(x,y,color,type,distance)
{
	this.x = x;
	this.y = y;
	this.type = type;
	this.distance = distance;
	this.color = color;
	this.draw = function(ctx)
	{
		ctx.fillStyle = this.color;
		ctx.strokeStyle = this.color;
		ctx.beginPath();
		ctx.arc(this.x,this.y,3,0,2*Math.PI,true)
		ctx.closePath();		
		ctx.fill();
		ctx.beginPath();
		ctx.arc(this.x,this.y,5,0,2*Math.PI,true)
		ctx.closePath();		
		ctx.stroke();
	}
}
PlantNode.SPORE_TYPE = "spore";
PlantNode.COLLECTOR_TYPE = "collector";

function updateScreen()
{
	canvas.ctx.fillStyle= "black"
	canvas.ctx.fillRect(0,0,800,600);
	
	canvas.ctx.fillStyle = "darkgreen";
	canvas.ctx.fillRect(0,300,800,5);
	canvas.ctx.fillStyle = "#555522";
	canvas.ctx.fillRect(0,305,800,295);
		
	for(var i in axes)
	{
		axes[i].draw(canvas.ctx)
	}
	
	for(var i in plantNodes)
	{
		plantNodes[i].draw(canvas.ctx)
	}

	for(var i in virtualPlantNodes)
	{
		virtualPlantNodes[i].draw(canvas.ctx)
	}
	
	canvas.ctx.fillStyle= "blue"
	canvas.ctx.fillRect(10,10,10,10);
	canvas.ctx.fillStyle= "white"
	canvas.ctx.fillText("Water:",30,20);
	canvas.ctx.fillText(water,90,20);
	canvas.ctx.fillText((dWater>=0?"+":"")+dWater,110,20);
	
	canvas.ctx.fillStyle= "grey"
	canvas.ctx.fillRect(10,30,10,10);
	canvas.ctx.fillStyle= "white"
	canvas.ctx.fillText("Minerals:",30,40);
	canvas.ctx.fillText(minerals,90,40);
	canvas.ctx.fillText((dMinerals>=0?"+":"")+dMinerals,110,40);
	
	canvas.ctx.fillStyle= "yellow"
	canvas.ctx.fillRect(10,50,10,10);
	canvas.ctx.fillStyle= "white"
	canvas.ctx.fillText("Energy:",30,60);
	canvas.ctx.fillText(energy,90,60);
	canvas.ctx.fillText((dEnergy>=0?"+":"")+dEnergy,110,60);
	
}

function Canvas()
{
	this.width = 800;
	this.height = 600;
	this.backgroundColor = 'black';
	this.canvas = $('<canvas id="mainCanvas"></canvas>').css({'width':this.width+'px','height':this.height+'px','background-Color':this.backgroundColor});
	this.canvas[0].width = this.width;
	this.canvas[0].height = this.height;
	this.ctx = this.canvas[0].getContext('2d');
}

function getPlantNode(x,y){
	for(var i in plantNodes)
	{
		if(Math.abs(plantNodes[i].x-x) < 6 && Math.abs(plantNodes[i].y-y) < 6){
			return plantNodes[i];
		}
	}
	return null;
}

function getVirtualPlantNode(x,y){
	for(var i in virtualPlantNodes)
	{
		if(Math.abs(virtualPlantNodes[i].x-x) < 6 && Math.abs(virtualPlantNodes[i].y-y) < 6){
			return virtualPlantNodes[i];
		}
	}
	return null;
}

function click(evt){

	var x = evt.pageX - canvas.canvas[0].offsetLeft;
	var y = evt.pageY - canvas.canvas[0].offsetTop;
	
	var node = getPlantNode(x,y)
	if(node !== null)
	{
		if(node.type == PlantNode.SPORE_TYPE)
		{
			virtualPlantNodes = [];
			selectedPlantnode = node;
			if(getPlantNode(x+40,y) === null){
				virtualPlantNodes.push(new PlantNode(node.x+40,node.y,"white"))
			}
			if(getPlantNode(x+40,y+40) === null){
				virtualPlantNodes.push(new PlantNode(node.x+40,node.y+40,"white"))
			}
			if(getPlantNode(x-40,y+40) === null){
				virtualPlantNodes.push(new PlantNode(node.x-40,node.y+40,"white"))
			}
			if(getPlantNode(x-40,y) === null){
				virtualPlantNodes.push(new PlantNode(node.x-40,node.y,"white"))
			}
			if(getPlantNode(x,y+40) === null){
				virtualPlantNodes.push(new PlantNode(node.x,node.y+40,"white"))
			}
			if(getPlantNode(x,y-40) === null){
				virtualPlantNodes.push(new PlantNode(node.x,node.y-40,"white"))
			}
			if(getPlantNode(x+40,y-40) === null){
				virtualPlantNodes.push(new PlantNode(node.x+40,node.y-40,"white"))
			}
			if(getPlantNode(x-40,y-40) === null){
				virtualPlantNodes.push(new PlantNode(node.x-40,node.y-40,"white"))
			}
		}else if(node.type == PlantNode.COLLECTOR_TYPE){
			virtualPlantNodes = []
			if(node.y <= 300)
			{
				if(getPlantNode(x+20,y) === null){
					virtualPlantNodes.push(new PlantNode(node.x+16,node.y,"darkgreen"))
				}
				if(getPlantNode(x-20,y) === null){
					virtualPlantNodes.push(new PlantNode(node.x-16,node.y,"khaki"))
				}
			}
		}
	}else if(virtualPlantNodes.length > 0)
	{
		var node = getVirtualPlantNode(x,y);
		if(node !== null){
			if((water > 0 && minerals > 0 && node.y <= 300) || (node.y > 300 && energy > 0)){		
				if(node.y <= 300){
					plantNodes.push(new PlantNode(node.x,node.y,"green",PlantNode.COLLECTOR_TYPE,selectedPlantnode.distance+1));
					dEnergy+=2;					
					dWater-= (selectedPlantnode.distance+1);
					dMinerals-= (selectedPlantnode.distance+1);
				}else{
					plantNodes.push(new PlantNode(node.x,node.y,"orange",PlantNode.COLLECTOR_TYPE,selectedPlantnode.distance+1));
					dEnergy-= (selectedPlantnode.distance+1);
					dWater+=2;
					dMinerals+=2;
				}
				axes.push(new Axis(selectedPlantnode.x,selectedPlantnode.y,node.x,node.y));
				selectedPlantnode = null;		
				virtualPlantNodes = [];
				
				water--;
				minerals--;
				
				water = Math.max(0,Math.min(water+dWater,dWater+1));
				minerals = Math.max(0,Math.min(minerals+dWater,dMinerals+1));;
				energy = Math.max(0,Math.min(energy+dWater,dEnergy+1));;
			}			
		}
	}

	updateScreen();
}
