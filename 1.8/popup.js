window.onload = function() {
    //Get a reference to the link on the page
    // with an id of "zbutton"
    var zbutton = document.getElementById("zbutton");

    //Set code to run when the button is clicked
    // by assigning a function to "onclick"
    zbutton.onclick = function() {

        //logged in console of popup, not same as console for background.js
        console.log("------------------------------------------------");
        console.log("triggered by zbutton");
        //inform background.js of click similar to message in key_event.js for keypresses
        chrome.extension.sendMessage({greeting: "zclick"});

    }
}