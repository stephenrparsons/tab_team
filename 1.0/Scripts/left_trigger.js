/////////////////////////////////////////////////////////////////////////////////////////
// handle everything that happens when ctrl+shift+z is pressed
function left_trigger(){
	console.log("------------------------------------------------");
	console.log("triggered by shift+z");

	// get all the unpinned tabs:
	var len = 0;
	var unPinnedTabs = [];
	chrome.tabs.query({pinned:false, lastFocusedWindow:true}, function(tabs) {
		len = tabs.length;

		if(len != 0){
			pin_tabs_to_left(tabs);
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
		update_badge();
	});
}
/////////////////////////////////////////////////////////////////////////////////////////