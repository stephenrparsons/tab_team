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

    // do the same for other buttons
    var xbutton = document.getElementById("xbutton");
    xbutton.onclick = function() {
        console.log("------------------------------------------------");
        console.log("triggered by xbutton");
        chrome.extension.sendMessage({greeting: "xclick"});
    }

    var rbutton = document.getElementById("rbutton");
    rbutton.onclick = function() {
        console.log("------------------------------------------------");
        console.log("triggered by rbutton");
        chrome.extension.sendMessage({greeting: "rclick"});
    }

    var ubutton = document.getElementById("ubutton");
    ubutton.onclick = function() {
        console.log("------------------------------------------------");
        console.log("triggered by ubutton");
        chrome.extension.sendMessage({greeting: "uclick"});
    }

    var bbutton = document.getElementById("bbutton");
    bbutton.onclick = function() {
        console.log("------------------------------------------------");
        console.log("triggered by bbutton");
        chrome.extension.sendMessage({greeting: "bclick"});
    }
}