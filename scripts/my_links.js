/* global firebase, console, document, microlink, confirm, event, ColorThief. $ */
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
var linkRef;
var uid;

function initApp() {
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            uid = user.uid;
            linkRef = database.ref('users/' + uid + '/links');
            linkRef.on("value", function (snapshot) {
                var link_list = snapshot.val();
                if (link_list !== null) {
                    var ll_length = Object.values(link_list).length;
                    for (var i = 0; i < ll_length; i++) {
                        var link_id = Object.keys(link_list)[i];
                        var link_data = Object.values(link_list)[i];
                        var link_fav = Object.values(link_data)[0];
                        var link_url = Object.values(link_data)[1];
                        var link_source = Object.values(link_data)[2];
                        var link_time = Object.values(link_data)[3];
                        makeBox(link_time, link_url, link_fav, link_source, link_id);
                    }
                    checkExist = setInterval(waitForImage, 100);
                    microlink('.link-previews', {
                        size: 'large'
                    });
                    reorderFavorites();

                } else {
                    console.log("No data in Firebase.");
                }
            });
        } else {
            console.log("You are not signed in.");
        }
    });
}

function makeBox(time, url, favorite, source, id) {
    if (document.getElementById(id + "card")) {
        return;
    }
    var date = new Date(time);
    var cardDiv = document.createElement("div");
    cardDiv.setAttribute("class", "card");
    cardDiv.setAttribute("id", id + "card");
    var cardHeader = document.createElement("div");
    cardHeader.setAttribute("class", "card-header card-header-icon card-header-primary");
    var cardIcon = document.createElement("div");
    cardIcon.setAttribute("class", "card-icon");
    var timeSpan = document.createElement("span");
    timeSpan.setAttribute("class", "d-inline-block");
    timeSpan.setAttribute("id", time);
    var timeTextSpan = document.createElement("span");
    timeTextSpan.setAttribute("class", "d-inline-block float-left");
    var timeTextParagraph = document.createElement("p");
    var timeOptions = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour12: false,
        hour: "2-digit",
        minute: "2-digit"
    };
    timeTextParagraph.innerHTML = date.toLocaleString('en-US', timeOptions);
    var deleteSpan = document.createElement("span");
    deleteSpan.setAttribute("class", "d-inline-block float-right");
    var deleteIcon = document.createElement("i");
    deleteIcon.setAttribute("class", "fas fa-times del")
    deleteIcon.setAttribute("id", id + "del");
    var cardBody = document.createElement("div");
    cardBody.setAttribute("class", "card-body");
    var contentDiv = checkURL(url);
    var buttonDiv = document.createElement("div");
    buttonDiv.setAttribute("class", "button-div");
    var favoriteLink = document.createElement("a");
    favoriteLink.setAttribute("class", "btn btn-primary btn-round child");
    favoriteLink.setAttribute("id", id + "fav");
    var favoriteIcon = document.createElement("i");
    var sourceLink = document.createElement("a");
    sourceLink.setAttribute("class", "btn btn-primary btn-round child");
    sourceLink.setAttribute("href", source);
    sourceLink.setAttribute("target", "_blank");
    var sourceIcon = document.createElement("i");
    sourceIcon.setAttribute("class", "fas fa-link fa-2x")
    if (favorite) {
        favoriteIcon.setAttribute("class", "fas fa-heart fa-2x");
        cardDiv.classList.add("fav");
    } else {
        favoriteIcon.setAttribute("class", "far fa-heart fa-2x");
        cardDiv.classList.add("not-fav");
    }
    var genDiv = document.getElementById("generated_elements");
    genDiv.prepend(cardDiv);
    cardDiv.appendChild(cardHeader);
    cardHeader.appendChild(cardIcon);
    cardIcon.appendChild(timeSpan);
    cardIcon.appendChild(timeTextSpan);
    cardIcon.appendChild(deleteSpan);
    timeTextSpan.appendChild(timeTextParagraph);
    deleteSpan.appendChild(deleteIcon);
    cardDiv.appendChild(cardBody);
    cardBody.appendChild(contentDiv);
    cardBody.appendChild(buttonDiv);
    buttonDiv.appendChild(favoriteLink);
    favoriteLink.appendChild(favoriteIcon);
    buttonDiv.appendChild(sourceLink);
    sourceLink.appendChild(sourceIcon);
    document.getElementById(id + "del").addEventListener("click", function () {
        if (confirm('Are you sure you want to delete this link?')) {
            deleteBox(id);
        } else {
            return;
        }
    });
    document.getElementById(id + "fav").addEventListener("click", function () {
        favoriteBox(id);
    });
}
//Strip all text after .png/jpg/ und so weiter
function checkURL(url) {
    var contentDiv = document.createElement("div");
    var base64Regex = new RegExp(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    var vidRegex = new RegExp("^(https?://)?(www.youtube.com|youtu.?be)/.+$");
    var linkRegex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");
    if (url.match(/\.(jpeg|jpg|gif|png)$/) || url.match(base64Regex)) {
        contentDiv.setAttribute("class", "content image");
        var imageLinkElement = document.createElement("a");
        imageLinkElement.setAttribute("href", url);
        imageLinkElement.setAttribute("target", "_blank")
        var imageElement = document.createElement("img");
        imageElement.setAttribute("src", url);
        imageElement.setAttribute("class", "colorthief");
        imageLinkElement.appendChild(imageElement);
        contentDiv.appendChild(imageLinkElement);
        return (contentDiv);
    } else if (url.match(vidRegex) && url.includes("playlist") === false) {
        contentDiv.setAttribute("class", "content youtube");
        let youtube_id = YouTubeGetID(url);
        url = 'http://www.youtube.com/embed/' + youtube_id;
        var videoElement = document.createElement("iframe");
        videoElement.setAttribute("src", url);
        contentDiv.appendChild(videoElement);
        return (contentDiv);
    } else if (url.match(linkRegex)) {
        if (!url.match(/^[a-zA-Z]+:\/\//)) {
            url = 'http://' + url;
        }
        contentDiv.setAttribute("class", "content link");
        var linkElement = document.createElement("a");
        linkElement.setAttribute("href", url);
        linkElement.setAttribute("class", "link-previews");
        linkElement.setAttribute("target", "_blank");
        contentDiv.appendChild(linkElement);
        return (contentDiv);
    } else {
        contentDiv.setAttribute("class", "content text");
        var textElement = document.createElement("div");
        var parsedString = $.parseHTML(url);
        for (var i = 0; i < parsedString.length; i++) {
            textElement.appendChild(parsedString[i]);
        }
        contentDiv.appendChild(textElement);
        return (contentDiv);
    }
}

function deleteBox(id) {
    var idRef = linkRef.child(id);
    idRef.on("value", function (snapshot) {
        snapshot.ref.remove();
    });
    removeElement(id + "card");
}

function favoriteBox(id) {
    var idRef = linkRef.child(id);
    var favBool;
    idRef.on("value", function (snapshot) {
        var snap = snapshot.val();
        favBool = Object.values(snap)[0];
    });
    if (favBool) {
        idRef.update({
            'favorite': false
        });
        document.getElementById(id + "fav").childNodes[0].setAttribute("class", "far fa-heart fa-2x");
        document.getElementById(id + "card").classList.remove("fav");
        document.getElementById(id + "card").classList.add("not-fav");
        reorderFavorites();
    } else {
        idRef.update({
            'favorite': true
        });
        document.getElementById(id + "fav").childNodes[0].setAttribute("class", "fas fa-heart fa-2x");
        document.getElementById(id + "card").classList.add("fav");
        document.getElementById(id + "card").classList.remove("not-fav");
        reorderFavorites();
    }
}

function removeElement(elementId) {
    var element = document.getElementById(elementId);
    element.parentNode.removeChild(element);
}


function colorImageBackground() {
    var imageList = document.getElementsByClassName("colorthief");
    for (var i = 0; i < imageList.length; i++) {
        var item = imageList[i];

        if (item.src.includes(".png")) {
            //#ABA5B0 but in RGB
            item.parentElement.parentElement.style.backgroundColor = "rgba(" + 171 + "," + 165 + "," + 176 + "," + 0.17 + ")";
        } else {
            try {
                var colorThief = new ColorThief();
                var r = colorThief.getColor(item)[0];
                var g = colorThief.getColor(item)[1];
                var b = colorThief.getColor(item)[2];
                item.parentElement.parentElement.style.backgroundColor = "rgb(" + r + "," + g + "," + b + ")";
            } catch (err) {
                //console.log("Attempted to catch image background, before any images loaded.");
            }

        }
    }
}


function reorderFavorites() {
    var genElem = document.getElementById("generated_elements");
    var notFavCards = document.getElementsByClassName("not-fav");
    var sNotFavCards = [];
    var favCards = document.getElementsByClassName("fav");
    var sFavCards = [];
    if (notFavCards.length !== 0) {
        for (var i = 0; i < notFavCards.length; i++) {
            sNotFavCards.push(notFavCards[i].firstChild.firstChild.firstChild.getAttribute("id"));
        }
        sNotFavCards.sort();
        for (var j = 0; j < sNotFavCards.length; j++) {
            var jItem = document.getElementById(sNotFavCards[j]);
            var jCard = jItem.parentElement.parentElement.parentElement;
            genElem.prepend(jCard);
        }
    }
    if (favCards.length !== 0) {
        for (var k = 0; k < favCards.length; k++) {
            sFavCards.push(favCards[k].firstChild.firstChild.firstChild.getAttribute("id"));
        }
        sFavCards.sort();
        for (var l = 0; l < sFavCards.length; l++) {
            var lItem = document.getElementById(sFavCards[l]);
            var lCard = lItem.parentElement.parentElement.parentElement;
            genElem.prepend(lCard);
        }
    }
}

function YouTubeGetID(url) {
    url = url.split(/(vi\/|v=|\/v\/|youtu\.be\/|\/embed\/)/);
    return (url[2] !== undefined) ? url[2].split(/[^0-9a-z_\-]/i)[0] : url[0];
}

$(document).ready(function () {
    initApp();
});

var checkExist = setInterval(waitForImage, 100);

function waitForImage() {
    for (i = 0; i < $('.image').length; i++) {
        colorImageBackground();
    }
    clearInterval(checkExist);
}
