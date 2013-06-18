//////////////////////////////////////////////////////////////////////////////////////
// Cluster class definition:
// A "cluster" of tabs is a group of tabs that pins and unpins concurrently
function Cluster(){
	this.tabs = []; // the list of tabs this Cluster handles
	this.activeId = 0; // the id of the active tab in this cluster
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// Initializations
var roster = [];
roster[0] = new Cluster();
var rosterCounter = 0;
var triggered = false;
var badge_on = true;
// on install/update, check to see if they have already installed it and have a preference
// so if no existing preference, make it on. otherwise leave it alone
if (!localStorage.getItem("badge_toggle")) {
	localStorage.setItem("badge_toggle", "on");
}

// badges:
// the background color is the same no matter what
chrome.browserAction.setBadgeBackgroundColor({color:"#2980B9"});
update_badge();
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// refresh all tabs on install and update
chrome.runtime.onInstalled.addListener(function(details) {
	triggered = true;
	refresh_all();
	open_website_install();
});
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// open website to the install page
function open_website_install() {
	chrome.tabs.create({url:"http://www.tabteamext.com/install"});
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// Update the badge text. Even if the user has the badge toggled off, this will just 
// do nothing, so call it every time anyway.
function update_badge() {
	// they have it stored as on, so turn it on
	if (localStorage.getItem("badge_toggle") == "on") {
		var rosterLength = roster.length>1 ? (""+(roster.length)) : "1";
		chrome.browserAction.setBadgeText({text:""+(rosterCounter+1)+"/"+rosterLength});
	}
	// they have it turned off, so turn it off
	else if (localStorage.getItem("badge_toggle") == "off") {
		chrome.browserAction.setBadgeText({text: ""});
	}
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// Detect key event messages from key_event.js. distinguish between 
// the ctrl+shift+X keypress and the ctrl+shift+Z keypress and act accordingly 
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.greeting == "trigger" && !triggered){
			triggered = true;
			trigger();
		} else if (request.greeting == "left_trigger" && !triggered){
			triggered = true;
			left_trigger();
		}
});
/////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// Detect button event messages from popup.html. distinguish between 
// the various buttons and act accordingly 
chrome.extension.onMessage.addListener(
	function(request, sender, sendResponse) {
		if(request.greeting == "xclick" && !triggered){
			triggered = true;
			trigger();
		} else if (request.greeting == "zclick" && !triggered){
			triggered = true;
			left_trigger();
		} else if (request.greeting == "uclick" && !triggered){
			triggered = true;
			unpin_all();
		} else if (request.greeting == "bclick" && !triggered){
			triggered = true;
			badge_toggle();
		} else if (request.greeting == "rclick" && !triggered){
			triggered = true;
			refresh_all();
		} else if (request.greeting == "vclick" && !triggered) {
			triggered = true;
			open_website_home();
		}
});
/////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// open the website to the home page
function open_website_home() {
	console.log("------------------------------------------------");
	console.log("triggered by vbutton");
	chrome.tabs.create({url:"http://www.tabteamext.com"});
	triggered = false; 
}
/////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// unpin all tabs
function unpin_all() {
	console.log("------------------------------------------------");
	console.log("triggered by ubutton");
	chrome.tabs.query({currentWindow:true}, function(tabs) {
		for(var tab = tabs.length-1; tab>=0; tab--){
			chrome.tabs.update(tabs[tab].id, {pinned:false});
			console.log(tabs[tab].id + " unpinned");
		}
	console.log("completed unpinning");
	// clear the roster so there are no groups
	console.log("clearing roster...");
	roster.length = 0;
	roster[0] = new Cluster();
	rosterCounter = 0;
	// reset badge as well
	update_badge();
	console.log("roster cleared");
	triggered = false;
	}); 
}
/////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// toggle badge on or off
function badge_toggle() {
	console.log("------------------------------------------------");
	console.log("triggered by bbutton");
	if (badge_on == true)
	{
		chrome.browserAction.setBadgeText({text:""});
		// save preference to local storage
		localStorage.setItem("badge_toggle", "off");
		badge_on = false;
	} else {
		localStorage.setItem("badge_toggle", "on");
		badge_on = true;
		update_badge();
	}
	triggered = false;
	}
/////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// refresh all tabs (except chrome://extensions/ because that messes things up)
function refresh_all() {
	console.log("------------------------------------------------");
	console.log("triggered by rbutton");
	chrome.tabs.query({currentWindow:true}, function(tabs) {
		for(var tab = 0; tab<tabs.length; tab++){
			if(tabs[tab].url != "chrome://extensions/"){
				chrome.tabs.reload(tabs[tab].id, null, null);
				console.log(tabs[tab].id + " refreshed");
			}
		}
		triggered = false;
	});
	console.log("completed refreshing");
}
/////////////////////////////////////////////////////////////////////////////////////////