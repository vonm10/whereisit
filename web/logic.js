var correctAnswer;
var answerName;
isPlayable = false;

var latitude;
var longitude;

var map;
var markerLayer = new SMap.Layer.Marker();

function setButtons(countries) {
    console.log("Final set of countries:")
    console.log(...countries);

    for (let i = 0; i < countries.length; i++) {
        let buttonName = "button" + i;
        $("#" + buttonName).html(countries[i]);
    }
}

function setImg(src) {
    $("#photo").attr("src", src);
}

function shuffleQuestionSet(questionSet) {
    let currentIndex = questionSet.length,
        randomIndex;

    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        [questionSet[currentIndex], questionSet[randomIndex]] = [
            questionSet[randomIndex], questionSet[currentIndex]
        ];
    }
    console.log("Shuffled question set:");
    console.log(...questionSet);

    setButtons(questionSet);
}

function generateQuestionSet() {
    let questionSet = [];
    let imgSrc;

    $.getJSON('questions.json', function(loadedJson) {
        console.log("Correct answer loaded:");
        let randomItem = Math.floor(Math.random() * loadedJson.length);

        correctAnswer = loadedJson[randomItem]['country'];
        answerName = loadedJson[randomItem]['name'];
        imgSrc = loadedJson[randomItem]['img'];
        latitude = loadedJson[randomItem]['lat'];
        longitude = loadedJson[randomItem]['lon'];

        console.log(correctAnswer);
        questionSet.push(correctAnswer);

        $.getJSON('countries.json', function(loadedJson) {
            console.log("Incorrect answers loaded:");
            for (let i = 0; i < 3; i++) {
                let randomCountry = Math.floor(Math.random() * loadedJson.length);
                console.log(loadedJson[randomCountry]['name']);
                questionSet.push(loadedJson[randomCountry]['name']);
            }

            shuffleQuestionSet(questionSet);
            setImg(imgSrc);
        });
    });
}

function revealAnswer(selectedAnswer) {
    if (correctAnswer === selectedAnswer) {
        $("#answer").html("Correct!");
        $("#answer").css('visibility', 'visible');
        console.log(selectedAnswer + "==" + correctAnswer);

        addPoint();
    } else {
        $("#answer").html("False!");
        $("#answer").css('visibility', 'visible');
        console.log(selectedAnswer + "!=" + correctAnswer);
    }

    displayMap();
}

function displayMap() {
    $("#photo").css('visibility', 'hidden');
    $("#photo").css('display', 'none');
    $("#map").css('visibility', 'visible');
    $("#map").css('display', 'block');

    setMap(longitude, latitude);
}

function displayPhoto() {
    $("#map").css('visibility', 'hidden');
    $("#map").css('display', 'none');
    $("#photo").css('visibility', 'visible');
    $("#photo").css('display', 'block');
}

function setMap(lon, lat) {
    markerLayer.removeAll();
    let coordinates = SMap.Coords.fromWGS84(lon, lat);
    map.setCenterZoom(coordinates, 10);

    let options = {
        title: answerName
    };
    var marker = new SMap.Marker(map.getCenter(), correctAnswer, options);
    markerLayer.addMarker(marker);
}

function addPoint() {
    let currentPoints = parseInt(sessionStorage.getItem("points"));
    currentPoints = currentPoints + 1;
    sessionStorage.setItem("points", currentPoints.toString());
    $("#current_score").html("Current score: " + sessionStorage.getItem('points'));

    if (currentPoints > localStorage['highscore']) {
        localStorage.setItem('highscore', currentPoints.toString());
        $("#highscore").html("Highscore: " + localStorage.getItem('highscore'));
    }
}

function createMap() {
    let center = SMap.Coords.fromWGS84(14.41, 50.08);
    map = new SMap(JAK.gel("map"), center, 10);
    map.addDefaultLayer(SMap.DEF_BASE).enable();
    map.addDefaultControls();
    map.addLayer(markerLayer);
    markerLayer.enable();
}

$(document).ready(function() {
    sessionStorage.setItem("points", 0);
    if (localStorage['highscore'] === undefined) {
        console.log("No previous highscore, setting to 0")
        localStorage.setItem('highscore', 0);
    }
    $("#highscore").html("Highscore: " + localStorage.getItem('highscore'));

    generateQuestionSet();
    createMap();
    displayPhoto();
    $("#answer").css('visibility', 'hidden');
    isPlayable = true;

    $('#next_question_button').click(function() {
        if (!isPlayable) {
            generateQuestionSet();
            $("#answer").css('visibility', 'hidden');
            displayPhoto();
            isPlayable = true;
        }
    });

    $('.buttons').click(function() {
        if (isPlayable) {
            let selectedAnswer = $(event.currentTarget).html();
            revealAnswer(selectedAnswer);
            isPlayable = false;
        }
    });

});