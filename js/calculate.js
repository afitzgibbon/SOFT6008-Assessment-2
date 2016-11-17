var colorSelectors = document.getElementsByClassName("colorSelector");
for (var i=0; i<colorSelectors.length; i++) {
	colorSelectors[i].addEventListener("click", function() { selectColor(this); });
}

var activeColorSelector = colorSelectors[0]; // stores the currently selected colour
//$("div#colorPalette").hide();

var colorPresets = document.getElementsByClassName("colorPreset");
for (var i=0; i<colorPresets.length; i++) {
	colorPresets[i].addEventListener("click", function() { addColorToSelection(this); });
}

$("button#btnResetColors").click(function() {
	for (var i=1; i<colorSelectors.length; i++) {
		colorSelectors[i].style.backgroundColor = "transparent";
		colorSelectors[i].children[0].value = "";
		colorSelectors[i].children[1].src = "./images/x_icon.png";
		$("div.colorSelector").removeClass("colorSelected");
		//colorSelectors[i].removeClass("colorSelected");
		//$(activeColorSelector).addClass("colorSelected");
	}
	
	activeColorSelector = colorSelectors[0];
	addColorToSelection(colorPresets[0]);         
	
	$("input[name=gradient]").attr("disabled", "disabled");
	/*
	activeColorSelector = colorSelectors[0];
	activeColorSelector.style.backgroundColor = "white";
	activeColorSelector.children[0].value = white;
	$(activeColorSelector).addClass("colorSelected");
	paintTShirt(0);
	*/
});

var xStart, yStart, xEnd, yEnd;
var scaleFactor = 1; // factor to be used for calculating resizing
var mouseDown = false;
var imageWidth = document.getElementById("imageLayer").width;
var imageHeight = document.getElementById("imageLayer").height;
var canvas = document.getElementById("canvasLayer");
canvas.width = imageWidth;
canvas.height = imageHeight;
var ctx = canvas.getContext("2d");
var imageData = ctx.getImageData(0, 0, imageWidth, imageHeight);

canvas.addEventListener("mousedown", function(e) { setStartCoordinates(e); });
canvas.addEventListener("mousemove", function(e) { drawLine(e); });
canvas.addEventListener("mouseup", calculateAngle);

$("input:radio[name=gradient]").change(function() { paintTShirt(0); });

//canvas.addEventListener("click", function(e) {
//	alert(getMousePos(e).y); 
//});

document.getElementById("selectSize").addEventListener("change", function() { changeSize(this); });

document.getElementById("selectLogo").addEventListener("change", function() { changeLogo(this); });

$("input:radio[name=logoColor]").change(function() { changeLogo(this); });

//var el = document.getElementById("selectLogo");
//$("select#selectLogo").change(function() { alert("ok"); });
//alert("x");

$("textarea#inputSlogan").bind("input propertychange", function() { addTextToTShirt(this); });
$("input:radio[name=textColor]").change(function() { $("span#textDisplay").css("color", this.value); });

$("aside#formContainer").hide();
$("button#btnContinue").click(function() {
	$("aside#configContainer").fadeOut(500);       
	$("aside#formContainer").fadeIn(500);
});

$("button#btnBack").click(function() {
	$("aside#formContainer").fadeOut(500);
	$("aside#configContainer").fadeIn(500);
});

function addColorToSelection(colorBox) {
	//$("div#colorPalette").slideUp(500);
	$(activeColorSelector).css("background-color", colorBox.children[0].value);
	activeColorSelector.children[0].value = colorBox.children[0].value;
	$(activeColorSelector).addClass("colorSelected");
	paintTShirt(0); // '0' specifies the default no angle gradient
	validatePrice();
}

function addTextToTShirt(el) {
	var inputText = el.value;
	
	if (inputText.length > 40) {
		alert("You are not allowed more than 40 characters!");
		inputText = inputText.substring(0, inputText.length - 1); // remove last char entered
		$("textarea#inputSlogan").text(inputText);
	}
	else if (inputText.length == 0) {
		$("span#textDisplay").css("padding", "0px");
	}
	else {
		$("span#textDisplay").css("padding", "5px");
	}
	
	$("span#textDisplay").text(inputText);
	
	validatePrice();
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
}

function changeLogo(el) {
	var brand, color;
	
	if (el.type == "select-one") {
		brand = el.value;
		color = $("input:radio[name=logoColor]:checked").val();
		if (brand == "none") {
			$("img#logoLayer").attr("src", "");
			validatePrice();
			return;
		}
	}
	else if (el.type == "radio") {
		var src = $("img#logoLayer").attr("src");
		if (src == null || src == "") { return; }
		
		brand = $("#selectLogo").val();
		
		if (src.indexOf("black") != -1)
			color = "white";
		else color = "black";
	}
	
	$("img#logoLayer").attr("src", "./images/" + brand + "_logo_" + color + ".png");
	validatePrice();
}

function changeSize(el) {
	switch (el.value) {
	case "small": 	scaleFactor = 0.7; break;
	case "medium":	scaleFactor = 0.8; break;
	case "large":	scaleFactor = 0.9; break;
	case "xlarge":	scaleFactor = 1.0; break;
	default: alert("Error: default condition in changeSize()"); return;
	}
	resize();
	validatePrice();
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
	//colorBox.children[1].textContent = "";
	colorBox.children[1].src = "";
	//colorBox.style.backgroundColor = "white";
	activeColorSelector = colorBox;
	if (colorBox.style.backgroundColor == "" || colorBox.style.backgroundColor == "transparent") {
		addColorToSelection(colorPresets[0]);
	}
	//$("div#colorPalette").slideDown(500);
}

function getMousePos(e) {
	// scaleFactor takes into account if the image has been resized and is used to 
	// return an x/y value relative to that 
	var rect = canvas.getBoundingClientRect();
	return {
		x: Math.round((e.clientX - rect.left)/scaleFactor),
		y: Math.round((e.clientY - rect.top)/scaleFactor)
	};
}

function paintTShirt(angle) {
	var selectedColors = document.getElementsByClassName("colorSelected");
	if (selectedColors.length == 1) {
		$("div#backgroundLayer").css("background", "white"); // resets any background gradient
		$("div#backgroundLayer").css("background-color", colorSelectors[0].children[0].value);
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
		
		$("div#backgroundLayer").css({"background" : colorString});
		$("input[name=gradient]").removeAttr("disabled"); // gradients are now enabled
	}
}

function resize() {
	var newWidth = Math.round(imageWidth * scaleFactor);
	var newHeight = Math.round(imageHeight * scaleFactor);
	var offsetLeft = Math.round((imageWidth - newWidth) / 2);
	var offsetTop = Math.round((imageHeight - newHeight) / 2);
	
	$("img#imageLayer").height(newHeight);
	$("img#imageLayer").width(newWidth);
	$("img#imageLayer").css({ top : offsetTop + "px" });
	$("img#imageLayer").css({ left : offsetLeft + "px" });
	
	$("canvas#canvasLayer").height(newHeight);
	$("canvas#canvasLayer").width(newWidth);
	$("canvas#canvasLayer").css({ top : offsetTop + "px" });
	$("canvas#canvasLayer").css({ left : offsetLeft + "px" });
	
	$("div#backgroundLayer").height(newHeight);
	$("div#backgroundLayer").width(newWidth);
	$("div#backgroundLayer").css({ top : offsetTop + "px" });
	$("div#backgroundLayer").css({ left : offsetLeft + "px" });
	
	newWidth = Math.round(75 * scaleFactor);
	newHeight = Math.round(52 * scaleFactor);
	offsetTop = parseInt($("img#imageLayer").css("top")) + (110*scaleFactor);
	offsetLeft = parseInt($("img#imageLayer").css("left")) + (300*scaleFactor);

	$("img#logoLayer").width(newWidth);
	$("img#logoLayer").height(newHeight);
	$("img#logoLayer").css({ top : offsetTop + "px" });
	$("img#logoLayer").css({ left : offsetLeft + "px" });
	
	newWidth = Math.round(200 * scaleFactor);
	newHeight = Math.round(100 * scaleFactor);
	offsetLeft = Math.round((imageWidth - newWidth) / 2);
	offsetTop = Math.round((imageHeight - newHeight) / 2);
	//offsetLeft = Math.round(((imageWidth * scaleFactor) - newWidth) / 2);
	//offsetTop = Math.round(((imageHeight * scaleFactor) - newHeight) / 2);
	
	$("div#textLayer").width(newWidth);
	$("div#textLayer").height(newHeight);
	$("div#textLayer").css({ top : offsetTop + "px" });
	$("div#textLayer").css({ left : offsetLeft + "px" });
	
	$("span#textDisplay").css("font-size", (25 * scaleFactor) + "px");
}

function selectColor(colorBox) {
	/*
	if ((colorBox.children[1].src).indexOf("x_icon.png") != -1) {
		alert("has icon");
	}
	else alert("no icon");
	alert(colorBox.children[1].src);
	*/
	var parent = colorBox.parentNode;
	for (var i=0; i<parent.children.length; i++) {
		if (parent.children[i] == colorBox) {
			if (i == 0) {
				enableColorBox(colorBox);
			}
			else {
				var previous = parent.children[i - 1];
				//if (previous.textContent == "") {
				//	enableColorBox(colorBox);
				//}
				if ((previous.children[1].src).indexOf("x_icon.png") == -1) {
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
	
	mouseDown = true; // start tracking mouse position while mouse button is held
}

function validatePrice() {
	var price = 0.0;
	var selectedColors = document.getElementsByClassName("colorSelected");
	price = (selectedColors.length - 1) * 0.50;
	
	switch ($("select#selectSize").val()) {
	case "small": price += 5; break;
	case "medium": price += 6; break;
	case "large": price += 7; break;
	case "xlarge": price += 8; break;
	default: // do nothing
	}
	
	switch ($("select#selectLogo").val()) {
	case "adidas":
	case "nike":
	case "puma":
	case "reebok": price += 7.5; break;
	default: // do nothing
	}
	
	if ($("textarea#inputSlogan").val() != "") {
		price += 5;
	}
	
	$("input#priceDisplay").val("\u20AC" + price.toFixed(2));
}
