//////////////////////////////////////////////////////////////////////////////////////
// Cluster class definition:
// A "cluster" of tabs is a group of tabs that pins and unpins concurrently
function Cluster(){
	this.tabs = []; // the list of tabs this Cluster handles
	this.activeId = 0; // the id of the active tab in this cluster
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// given a cluster and a boolean, either pin or unPin all the tabs in the cluster
// pinOrunPin == true ? pin : unPin
function pinTabs(cluster, pinOrunPin){
	clusterTabs = cluster.tabs;
	if(clusterTabs!=null){
		if(!pinOrunPin){
			for(var tabIndex = clusterTabs.length-1; tabIndex>=0; tabIndex--){
				chrome.tabs.update(clusterTabs[tabIndex].id, {pinned:pinOrunPin});
			}
		} else {
			for(var tabIndex = 0; tabIndex<clusterTabs.length; tabIndex++){
				chrome.tabs.update(clusterTabs[tabIndex].id, {pinned:pinOrunPin});
			}
		}
	}
}
//////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////
// Initializations
var roster = [];
roster[0] = new Cluster();
var rosterCounter = 0;
var triggered = false;
var badge_on = true;
localStorage.setItem("badge_toggle", "on");

// badges:
// the background color is the same no matter what
chrome.browserAction.setBadgeBackgroundColor({color:"#2980B9"});
update_badge();


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
		}
});
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
// refresh all tabs
function refresh_all() {
	console.log("------------------------------------------------");
	console.log("triggered by rbutton");
	chrome.tabs.query({currentWindow:true}, function(tabs) {
		for(var tab = 0; tab<tabs.length; tab++){
			chrome.tabs.reload(tabs[tab].id, null, null);
			console.log(tabs[tab].id + " refreshed");
		}
	});
	console.log("completed refreshing");
	triggered = false;
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// handle everything that happens when ctrl+shift+x is pressed
function trigger(){
	console.log("------------------------------------------------");
	console.log("triggered by shift+x");

	// get all the unpinned tabs:
	var len = 0;
	var unPinnedTabs = [];
	chrome.tabs.query({pinned:false}, function(tabs) {
		for(var tab = 0; tab<tabs.length; tab++){
			unPinnedTabs[tab] = tabs[tab];
		} 
		len = unPinnedTabs.length;
		//Deal with the possible situations the browser can go into:
		if(len == 0){
			is_empty_to_next();
		} 
		else if(len !=0){
			non_empty_to_next(unPinnedTabs);
		}

		update_badge();
	});
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// we're not on the empty cluster, but all unpinned tabs were closed, so we have to unpin
// the next cluster of tabs and get rid of this now-empty spot on the roster
function is_empty_to_next(){
	console.log("there are no unpinned tabs");
	roster.splice(rosterCounter,1); 
	rosterCounter = rosterCounter % roster.length;

	pinTabs(roster[rosterCounter], false);
	chrome.tabs.update(roster[rosterCounter].activeId, {active:true}, function(tab){
		triggered = false;
	});
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// this is sort of the default or expected occurrence: we are not on the empty cluster
// and there are open tabs that need to be saved in a cluster, then they need to be pinned
// and the next cluster needs to be brought out.
function non_empty_to_next(unPinnedTabs){
	console.log("there are unpinned tabs");
	var newCluster = new Cluster();
	newCluster.tabs = unPinnedTabs;
	roster[rosterCounter] = newCluster;
	pinTabs(roster[rosterCounter], true);
	//find the tab that is active:
	chrome.tabs.query({active:true, windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
		newCluster.activeId = tabs[0].id; // tabs[0] should be the only tab in tabs
	});
	rosterCounter = (1+rosterCounter) % roster.length;
	
	pinTabs(roster[rosterCounter], false);
	chrome.tabs.update(roster[rosterCounter].activeId, {active:true}, function(tab){
		triggered = false;
	});
	update_badge();
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// handle everything that happens when ctrl+shift+z is pressed
function left_trigger(){
	console.log("------------------------------------------------");
	console.log("triggered by shift+z");

	// get all the unpinned tabs:
	var len = 0;
	var unPinnedTabs = [];
	chrome.tabs.query({pinned:false}, function(tabs) {
		for(var tab = 0; tab<tabs.length; tab++){
			unPinnedTabs[tab] = tabs[tab];
		} 
		len = unPinnedTabs.length;

		if(len != 0){
			pin_tabs_to_left(unPinnedTabs);
		}
	});
	//update the badge
	// if the badge is turned on
	// TODO: figure out why this is not updating the badge like it should
		// the function below is properly updating the badge but for some reason
		// the roster length or something is not updated at this point
		// because the number is always off by 1. 
		// although it seems that it should be because of pin_tabs_to_left
		// which is called above. 
		// if you switch away to another cluster and come back, everything is fine.
		// any ideas, ben?
}
/////////////////////////////////////////////////////////////////////////////////////////

/////////////////////////////////////////////////////////////////////////////////////////
// pin all tabs to the left of the active tab
function pin_tabs_to_left(unPinnedTabs){
	chrome.tabs.query({active: true}, function(tabs){
		var active_tab = tabs[0]; // should be the only tab in tabs

		var tabs_to_pin = [];
		var index = 0;
		while (unPinnedTabs[index].id != active_tab.id){
			tabs_to_pin[index] = unPinnedTabs[index];
			index+=1;
		}

		var tabs_to_keep_unpinned = [];
		while (index < unPinnedTabs.length){
			tabs_to_keep_unpinned[index] = unPinnedTabs[index];
			index+=1;
		}

		if(tabs_to_pin.length > 0){
			var new_cluster = new Cluster();
			new_cluster.tabs = tabs_to_pin
			pinTabs(new_cluster, true);
			// potentially change this so that if the active id was previously in this group,
			// then keep that one
			new_cluster.activeId = tabs_to_pin[0].id;

			var new_unpinned_cluster = new Cluster();
			new_unpinned_cluster.tabs = tabs_to_keep_unpinned;
			chrome.tabs.query({active:true, windowId:chrome.windows.WINDOW_ID_CURRENT}, function(tabs){
				new_unpinned_cluster.activeId = tabs[0].id; // tabs[0] should be the only tab in tabs
			});

			roster.splice(rosterCounter, 1, new_cluster, new_unpinned_cluster);
			rosterCounter = (rosterCounter + 1) % roster.length;
		}

		triggered = false;
		update_badge();
	});
}
/////////////////////////////////////////////////////////////////////////////////////////