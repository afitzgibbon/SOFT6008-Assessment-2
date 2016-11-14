var colorSelectors = document.getElementsByClassName("colorSelector");
for (var i=0; i<colorSelectors.length; i++) {
	colorSelectors[i].addEventListener("click", function() { selectColor(this); });
}

var activeColorSelector;
$("div#colorPalette").hide();

var colorPresets = document.getElementsByClassName("colorPreset");
for (var i=0; i<colorPresets.length; i++) {
	colorPresets[i].addEventListener("click", function() { addColorToSelection(this); });
}

var xStart, yStart, xEnd, yEnd;
var mouseDown = false;
var canvas = document.getElementById("canvasLayer");
//canvas.width = canvas.offsetWidth;
//canvas.height = canvas.offsetHeight;
canvas.width = 510;
canvas.height = 454;
var ctx = canvas.getContext("2d");
var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

//var background = new Image();
//background.src = "./images/t-shirt.png";
//background.onload = function() { ctx.drawImage(background,0,0); }

//document.getElementById('tshirt').ondragstart = function() { return false; }; // disable image drag

canvas.addEventListener("mousedown", function(e) { setStartCoordinates(e); });
canvas.addEventListener("mousemove", function(e) { drawLine(e); });
canvas.addEventListener("mouseup", calculateAngle);

//canvas.addEventListener("click", function() { alert("i am the canvas"); });
//document.getElementById("tshirt").addEventListener("click", function() { alert("i am the image"); }); 

//document.getElementById("tshirt").addEventListener("mousedown", function(e) { setStartCoordinates(e); });
//document.getElementById("tshirt").addEventListener("mousemove", function(e) { drawLine(e); });
//document.getElementById("tshirt").addEventListener("mouseup", calculateAngle);

function addColorToSelection(colorBox) {
	$("div#colorPalette").slideUp(500);
	$(activeColorSelector).css("background-color", colorBox.children[0].value);
	activeColorSelector.children[0].value = colorBox.children[0].value;
	$(activeColorSelector).addClass("colorSelected");
	paintTShirt(0); // '0' specifies the default no angle gradient
}

function calculateAngle() {
	if (!mouseDown) { return; }
	mouseDown = false; // reset flag
	
	// the line is only an indicator, so clear it after it has been drawn
	ctx.putImageData(imageData, 0, 0);
	
	// find the length of the adjacent side
	var adjLength = 0;
	if (yEnd > yStart) {
		adjLength = yEnd - yStart;
	}
	else {
		adjLength = yStart - yEnd;
	}
	
	// find the length of the hypotenuse side, which is the line drawn on screen
	var hypLength = Math.sqrt(Math.pow(xEnd - xStart, 2) + Math.pow(yEnd - yStart, 2));
	// get angle with cosA = adj/hyp and convert it to degrees
	var angle = Math.round(Math.acos(adjLength/hypLength) * (180/Math.PI));
	
	if (yStart < yEnd) {
		angle = 180 - angle; // for angles gt 90 & lt 270 (y in negative quadrant)
	}
	if (xStart > xEnd) {
		angle = 360 - angle; // for angles gt 180 & lt 360 (x in negative quadrant)
	}
	
	paintTShirt(angle);
	
	//print("End   : (" + xEnd + ", " + yEnd + ")");
}

function drawLine(e) {
	if (!mouseDown || $("input[name=gradient]").attr("disabled") == "disabled") { return; }
	
	xEnd = getMousePos(e).x;
	yEnd = getMousePos(e).y;
	
	ctx.putImageData(imageData, 0, 0); // clear the canvas, this deletes previously drans line
	ctx.beginPath();
	ctx.moveTo(xStart, yStart);
	ctx.lineTo(xEnd, yEnd);
	ctx.stroke();
}

function enableColorBox(colorBox) {
	colorBox.children[1].textContent = "";
	activeColorSelector = colorBox;
	//$(colorBox).addClass("colorSelected");
	$("div#colorPalette").slideDown(500);
}

function getMousePos(e) {
	var rect = canvas.getBoundingClientRect();
	return {
		x: Math.round(e.clientX - rect.left),
		y: Math.round(e.clientY - rect.top)
	};
}

function paintTShirt(angle) {
	var selectedColors = document.getElementsByClassName("colorSelected");
	
	//if (selectedColors.length == 1) {
	//	$("div#displayContainer").css("background-color", colorSelectors[0].children[0].value);
	//}
	//else {
	
	if (selectedColors.length == 0) {
		document.getElementById("canvasParent").style.background = "white";
	}
	else if (selectedColors.length == 1) {
		$("div#displayContainer").css("background", "white"); // resets any background gradient
		$("div#displayContainer").css("background-color", colorSelectors[0].children[0].value);
	}
	else {
		if (angle == 0) {
			startPoint = 0;
			endPoint = 100;
		}
		else if (angle > 45 && angle < 135) { // horizontal line, left to right
			startPoint = Math.round((xStart / canvas.width) * 100);
			endPoint = Math.round((xEnd / canvas.width) * 100);
		}
		else if (angle >= 135 && angle <= 225) { // vertical line, top to bottom
			startPoint = Math.round((yStart / canvas.height) * 100);
			endPoint = Math.round((yEnd / canvas.height) * 100);
		}
		else if (angle > 225 && angle < 315) { // horizontal line, right to left
			startPoint = Math.round(((canvas.width - xStart) / canvas.width) * 100);
			endPoint = Math.round(((canvas.width - xEnd) / canvas.width) * 100);
		}
		else { // vertical line, bottom to top
			startPoint = Math.round(((canvas.height - yStart) / canvas.height) * 100);
			endPoint = Math.round(((canvas.height - yEnd) / canvas.height) * 100);
		}
		
		var colorString = "";
		if (document.getElementById("rbLinear").checked) {
			colorString = "linear-gradient(" + angle + "deg, ";
		
			for (var i=0; i<selectedColors.length; i++) {
				var percentagePoint = Math.round(((endPoint - startPoint) / (selectedColors.length - 1) * i) + startPoint);
				colorString += selectedColors[i].children[0].value + " " + percentagePoint + "%";
				if (i != selectedColors.length - 1 ? colorString += ", " : colorString += ")");
			}
		}
		else {
			colorString = "radial-gradient(at " + Math.round((xStart / canvas.width) * 100) + "% " + Math.round((yStart / canvas.height) * 100) + "%, ";
			
			for (var i=0; i<selectedColors.length; i++) {
				var percentagePoint = Math.round(((endPoint - startPoint) / (selectedColors.length - 1) * i) + startPoint);
				colorString += selectedColors[i].children[0].value + " " + percentagePoint + "%";
				if (i != selectedColors.length - 1 ? colorString += ", " : colorString += ")");
			}			
		}
		
//		colorString = "linear-gradient(" + angle + "deg,";
		
//		for (var i=0; i<selectedColors.length; i++) {
//			var percentagePoint = Math.round(((endPoint - startPoint) / (selectedColors.length - 1) * i) + startPoint);
//			colorString += selectedColors[i].children[0].value + " " + percentagePoint + "%";
//			if (i != selectedColors.length - 1 ? colorString += ", " : colorString += ")");
//		}
		
		//alert("x=" + Math.round((xStart / canvas.width) * 100) + "%   y=" + Math.round((yStart / canvas.height) * 100) + "%");
		//alert(colorString);
		$("div#displayContainer").css({"background" : colorString});
		
		//alert($("input[name=gradient]").attr("disabled"));
		$("input[name=gradient]").removeAttr("disabled");
		//alert($("input[name=gradient]").attr("disabled"));
	}
	//}
	
	/*
	var activeBoxes = 0;
	
	for (var i=0; i<colorSelectors.length; i++) {
		if (colorSelectors[i].textContent == "x") {
			break;
		}
		else {
			activeBoxes++;
		}
	}
	
	if (activeBoxes == 1) {
		$("div#displayContainer").css("background-color", colorSelectors[0].children[0].value);
	}
	else {
		$("input[name=gradient]").removeAttr("disabled");
	}
	*/
}

function selectColor(colorBox) {
	var parent = colorBox.parentNode;
	for (var i=0; i<parent.children.length; i++) {
		if (parent.children[i] == colorBox) {
			if (i == 0) {
				enableColorBox(colorBox);
			}
			else {
				var previous = parent.children[i - 1];
				if (previous.textContent == "") {
					enableColorBox(colorBox);
				}
			}			
			break;
		}
	}
}

function setStartCoordinates(e) {
	xEnd = xStart = getMousePos(e).x; //initialise xEnd=xStart, othewise it may be undefined
	yEnd = yStart = getMousePos(e).y;
	//print("Start : (" + xStart + ", " + yStart + ")");
	
	mouseDown = true;
}

function print(msg) { 
	var text = document.getElementById("output").innerHTML;
	document.getElementById("output").innerHTML = text + "<br>" + msg;
}