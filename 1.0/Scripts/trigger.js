/////////////////////////////////////////////////////////////////////////////////////////
// handle everything that happens when ctrl+shift+x is pressed
function trigger(){
	console.log("------------------------------------------------");
	console.log("triggered by shift+x");

	// get all the unpinned tabs:
	var len = 0;
	var unPinnedTabs = [];
	chrome.tabs.query({pinned:false, currentWindow:true}, function(tabs) {
		len = tabs.length;
		//Deal with the possible situations the browser can go into:
		if(len == 0){
			is_empty_to_next();
		} 
		else if(len !=0){
			non_empty_to_next(tabs);
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