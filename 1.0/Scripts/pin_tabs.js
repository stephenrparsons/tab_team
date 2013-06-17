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