/* global firebase, console, window, chrome */
/* eslint-disable no-console */
var config = {
    apiKey: "AIzaSyD5pJB-b1OovQpg8vtcQ6t3tAHR8iHrQBA",
    authDomain: "link-230713.firebaseapp.com",
    databaseURL: "https://link-230713.firebaseio.com",
    projectId: "link-230713",
    storageBucket: "link-230713.appspot.com",
    messagingSenderId: "391858568013"
};
firebase.initializeApp(config);
var database = firebase.database();
var emailRef = database.ref('users');
var linkRef;
var contextMenuCreated = false;
var tabUrl;

function initApp() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var uid = user.uid;
            var subRef = emailRef.child(uid);
            linkRef = subRef.child('links');

            if (!contextMenuCreated) {
                chrome.contextMenus.create(contextMenuItem);
                contextMenuCreated = true;
            }

        } else {
            if (contextMenuCreated) {
                chrome.contextMenus.remove("ExtensionName");
                contextMenuCreated = false;
            }
        }
    });
}

function pushNewLink(url) {
    chrome.tabs.query({
        'active': true,
        'currentWindow': true
    }, function (tabs) {
        tabUrl = tabs[0].url;
        var d = new Date();
        var n = d.getTime();
        linkRef.push({
            'link': url,
            'timestamp': n,
            'favorite': false,
            'source': tabUrl
        });
    });
}

window.onload = function () {
    initApp();
};

var contextMenuItem = {
    "id": "ExtensionName",
    "title": "Send to Link",
    "contexts": ["selection", "image", "link"]
};

chrome.contextMenus.onClicked.addListener((clickData, tab) => {

    if (clickData.menuItemId === "ExtensionName" && clickData.selectionText) {
        chrome.tabs.executeScript(tab.ib, {
            file: 'scripts/inject.js'
        }, handleText);
        return;
    } else if (clickData.srcUrl !== undefined) {
        pushNewLink(clickData.srcUrl);
        return;
    } else if (clickData.linkUrl !== undefined) {
        pushNewLink(clickData.linkUrl);
        return;
    }
});

function handleText(resultsArray) {
    var textParam = resultsArray[0];
    pushNewLink(textParam);
}
