/* global firebase, console, document, chrome, window, $ */
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
var url = 'undefined';

function initApp() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            var email = user.email;
            var uid = user.uid;
            var subRef = emailRef.child(uid);
            var linkRef = subRef.child('links');
            JSON.stringify(user, null, '  ');
            var sendButton = document.getElementById('send-to-db');
            var d = new Date();
            var n = d.getTime();
            localStorage.setItem("uid", uid);
            document.getElementById('html-field').value = url;

            //Add user to firebase
            subRef.on('value', function (snapshot) {
                if (snapshot.val() === null) {
                    subRef.push({
                        "email": email,
                        "id": uid,
                    });
                }
            });

            sendButton.onclick = function () {
                linkRef.push({
                    'link': document.getElementById('html-field').value,
                    'timestamp': n,
                    'favorite': false,
                    'source': url
                }, function (error) {
                    if (error) {
                        document.getElementById('debug').innerHTML = "Link could not be saved." + error;
                    } else {
                        document.getElementById('debug').innerHTML = "Link saved successfully";
                    }
                });
            };
        } else {
            setLoginStatus(false);
        }
        document.getElementById('quickstart-button').disabled = false;
    });
    document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
}

function startSignIn() {
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
        setLoginStatus(false);
    }
}

function toggleLogin(bool) {
    var loginCont = document.getElementById("login-div");
    if (bool === false) {
        parent.document.getElementById("togBut").style.visibility = "hidden";
        var loginUrl = chrome.runtime.getURL("login.html");
        var iframe = document.createElement('iframe');
        iframe.setAttribute("src", loginUrl);
        iframe.setAttribute("id", "iframe");
        iframe.setAttribute("frameBorder", 0);
        if (loginCont !== null) {
            loginCont.appendChild(iframe);
        }
    }
}

function setLoginStatus(bool) {
    chrome.storage.sync.set({
        key: bool
    }, function () {
        toggleLogin(bool);
    });
}

window.onload = () => {
    chrome.tabs.query({
        active: true,
        currentWindow: true
    }, (tabs) => {
        url = tabs[0].url;
    });
    initApp();
};

$('#navbarNavDropdown li a').on('click', function () {
    $('.navbar-toggler').click();
});

$("#send-to-db").click(function () {
    $('#myModal').modal('toggle');
    setTimeout(function () {
        $("#myModal").modal('toggle');
    }, 2000);
});
