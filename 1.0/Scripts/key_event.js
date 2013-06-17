if (window == top) {
 	window.addEventListener('keydown', doKeyPress, false); //add the keyboard handler
}

//document.onKeyDown = doKeyPress;

var left_trigger_key = 90; // (shift+)z key
var trigger_key =  88; // (shift+)x key
function doKeyPress(e){
	if (e.ctrlKey && e.shiftKey && e.keyCode == left_trigger_key){
		chrome.extension.sendMessage({greeting: "left_trigger"}); 
	} else if(e.ctrlKey && e.shiftKey && e.keyCode == trigger_key){
		chrome.extension.sendMessage({greeting: "trigger"});
	}
}