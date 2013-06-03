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
// badges:
chrome.browserAction.setBadgeText({text:"1/1"});
chrome.browserAction.setBadgeBackgroundColor(#2980b9);
var rosterCounter = 0;
var triggered = false;
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

		//update the badge
		var rosterLength = roster.length>1 ? (""+(roster.length)) : "1";
		chrome.browserAction.setBadgeText({text:""+(rosterCounter+1)+"/"+rosterLength});
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
	});
}
/////////////////////////////////////////////////////////////////////////////////////////