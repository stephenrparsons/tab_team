window.onload = function() {
    //Get a reference to the link on the page
    // with an id of "zbutton"
    var zbutton = document.getElementById("zbutton");

    //Set code to run when the link is clicked
    // by assigning a function to "onclick"
    zbutton.onclick = function() {

        console.log("------------------------------------------------");
        console.log("triggered by zbutton");
        chrome.extension.sendMessage({greeting: "zclick"});

    }
}