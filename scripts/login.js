/* global firebase, console, document, chrome, window */
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

function initApp() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            setLoginStatus(true);
        } else {
            setLoginStatus(false);
        }
        document.getElementById('quickstart-button').disabled = false;
    });
    document.getElementById('quickstart-button').addEventListener('click', startSignIn, false);
}

function startAuth(interactive) {
    chrome.identity.getAuthToken({
        interactive: !!interactive
    }, function (token) {
        if (chrome.runtime.lastError && !interactive) {
            console.log('It was not possible to get a token programmatically.');
        } else if (chrome.runtime.lastError) {
            console.error(chrome.runtime.lastError);
        } else if (token) {
            // Authorize Firebase with the OAuth Access Token.
            var credential = firebase.auth.GoogleAuthProvider.credential(null, token);
            firebase.auth().signInWithCredential(credential).catch((error) => {
                // The OAuth token might have been invalidated. Lets' remove it from cache.
                if (error.code === 'auth/invalid-credential') {
                    chrome.identity.removeCachedAuthToken({
                        token: token
                    }, function () {
                        startAuth(interactive);
                    });
                }
            });
        } else {
            console.error('The OAuth Token was null');
        }
    });
}

function startSignIn() {
    document.getElementById('quickstart-button').disabled = true;
    if (firebase.auth().currentUser) {
        firebase.auth().signOut();
    } else {
        startAuth(true);
    }
}

function toggleLogin(bool) {
    if (bool === true) {
        parent.document.getElementById("togBut").style.visibility = "visible";
        var loginCont = parent.document.getElementById("login-div");
        var iframe = loginCont.childNodes[0];
        loginCont.removeChild(iframe);
    }
}

function setLoginStatus(bool) {
    chrome.storage.sync.set({
        key: bool
    }, function () {
        toggleLogin(bool);
    });
}

window.onload = function () {
    initApp();
};
