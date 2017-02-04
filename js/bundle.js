/* 'config' is an object containing various UI labels and settings:
 *********************************************************************************************/

var config = {
    animations: {
        fadesEnabled: true
    },
    htmlEntitiesAndIcons: {
        gradingIcons: {
            correct: '&#10004;',
            incorrect: '&#10008;'
        }
    },
    labels: {
        feedback: {
            allDone: 'All done',
            amazing: 'Amazing',
            correct: 'Correct',
            feedback: 'You said',
            finishedIn: 'Finished in',
            reviewAnswers: 'Review your answers',
            scored: 'You scored',
            tooBad: 'Too bad!',
            veryGood: 'Very good',
            wellDone: 'Well done'
        },
        segmentals: {
            divider: '/',
            feedbackPostfix: '!',
            of: 'of',
            percentage: '%',
            questionShorthand: 'Q',
            seconds: 'seconds',
            secondsShorthand: 's',
            segmental: ':',
        },
        title: {
            titleScreenTitle: 'General Knowledge Quiz',
            titleScreenSubtitle: 'By John Martin',
            footer: ("John Martin " + (new Date().getFullYear()))
        },
        ui: {
            selectAnswerAlert: 'Please select an answer to proceed',
            retry: ("Back to Menu <i class=\"fa fa-step-forward\" aria-hidden=\"true\"></i>"),
            restart: 'Restart',
            settings: ("<i class=\"fa fa-cog\" aria-hidden=\"true\"></i> Settings"),
            startQuiz: ("<i class=\"fa fa-play-circle\" aria-hidden=\"true\"></i> Start Quiz"),
            submit: ("Submit <i class=\"fa fa-step-forward\" aria-hidden=\"true\"></i>")
        }
    },
    questionJsonSrc: 'https://dl.dropboxusercontent.com/u/7797721/apps/quiz-app/questions.json',
};


/* 'scores' is an object with feedback messages for a range of user scores:
 *********************************************************************************************/

var scores = {
    range: [
        { low: 95, high: 100, feedback: (("" + (config.labels.feedback.amazing)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "") },
        { low: 90, high: 94, feedback: (("" + (config.labels.feedback.wellDone)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "") },
        { low: 70, high: 89, feedback: (("" + (config.labels.feedback.veryGood)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "") },
        { low: 50, high: 69, feedback: (("" + (config.labels.feedback.allDone)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "") },
        { low: 0, high: 49, feedback: (("" + (config.labels.feedback.tooBad)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "") }
    ],
    default: (("" + (config.labels.feedback.allDone)) + ("" + (config.labels.segmentals.feedbackPostfix)) + "")
};


/* 'elems' has properties that reference UI elements on the DOM:
 *********************************************************************************************/

var elems = {
    btn: { submit: void 0 },
    div: { time: void 0, feedback: void 0 },
    h2: { ques: void 0 },
    progress: { bar: void 0 },
    ul: { ans: void 0 }
};


/* 'gameData' has properties whose values maintain the current game state/progress:
 *********************************************************************************************/

var gameData = {
    allQuestions: [],
    progress: { questionNumber: 0, questionSelected: false, userScore: 0 },
    questionScreen: false,
    sInterval: void 0,
    timeCount: { seconds: 0, minutes: 0 },
    ulPadding: true
};


/* 'CreateElement' is a function for creating an element:
 *********************************************************************************************/

var CreateElement = function(o) {
	var elem = document.createElement(o.elem);
    if (o.id) elem.id = o.id;
    if (o.type) elem.type = o.type;
    if (o.name) elem.name = o.name;
    if (o.role) elem.role = o.role;
    if (o.ariaValuenow) elem['aria-valuenow'] = o.ariaValuenow;
    if (o.ariaValueMin) elem['aria-valuemin'] = o.ariaValueMin;
    if (o.ariaValueMax) elem['aria-valuemax'] = o.ariaValueMax;
    if (o.className) elem.className = o.className;
    if (o.style) elem.style = o.style;
    return elem;
};


/* 'generateFeedback' determines which feedback message to show depending on user score:
 *****************************************************************************************************************/

var generateFeedback = function(percent) {
    var feedbackMsg = null;
    switch (true) {
        case (percent >= scores.range[0].low && percent <= scores.range[0].high):
            feedbackMsg = scores.range[0].feedback;
            break;
        case (percent >= scores.range[1].low && percent <= scores.range[1].high):
            feedbackMsg = scores.range[1].feedback;
            break;
        case (percent >= scores.range[2].low && percent <= scores.range[2].high):
            feedbackMsg = scores.range[2].feedback;
            break;
        case (percent >= scores.range[3].low && percent <= scores.range[3].high):
            feedbackMsg = scores.range[3].feedback;
            break;
        case (percent >= scores.range[4].low && percent <= scores.range[4].high):
            feedbackMsg = scores.range[4].feedback;
            break;
        default:
            feedbackMsg = scores.default;
            break;
    }
    return feedbackMsg;
};


/* 'checkCode' is a function that provides older IE fallback for key(press/down) events:
 *********************************************************************************************/

var checkCode = function(e) {
    e = e || window.event;
    return (e.keyCode || e.which);
};


/* 'toggleUlPadding' toggles the left padding (paddingLeft) or ul elements.
   If gameData.ulPadding is has a truthy value, remove padding from left — if falsy, set padding left to 40:
 *****************************************************************************************************************/

var toggleUlPadding = function() {
    var ul = document.getElementsByTagName('ul');
    if (gameData.ulPadding) for (var i = 0; i < ul.length; i++) ul[i].style.paddingLeft = 0;
    else for (var j = 0; j < ul.length; j++) ul[j].style.paddingLeft = 40;
    gameData.ulPadding = !gameData.ulPadding;
};


/* 'populateCells' populates table cells on the results table of the end-screen:
 *****************************************************************************************************************/

var populateCells = function(cellArr, valArr) { for (var i = 0; i < cellArr.length; i++) cellArr[i].innerHTML = valArr[i]; };


/* 'populateTableCells' populates the table header (row titles) for feedback at end screen:
 *****************************************************************************************************************/

var populateTableCells = function(o) {
    for (var i = 0; i < gameData.allQuestions.length; i++) {
        o.elem.insertRow();
        for (var j = 0; j < 4; j++) o.elem.rows[i].insertCell();
        populateCells(o.elem.rows[i].cells, [(("" + (i + 1)) + (". " + (gameData.allQuestions[i].question)) + ""), gameData.allQuestions[i].choices[gameData.allQuestions[i].userAnswer],
            gameData.allQuestions[i].choices[gameData.allQuestions[i].answer], gameData.allQuestions[i].correct]);
    }
};


/* 'populateTableHeader' populates the cells (innerHTML values) of the results table header:
 *****************************************************************************************************************/

var populateTableHeader = function(row) {
    row.cells[0].innerHTML = null;
    row.cells[1].innerHTML = (("" + (config.labels.feedback.feedback)) + ("" + (config.labels.segmentals.segmental)) + "");
    row.cells[2].innerHTML = (("" + (config.labels.feedback.correct)) + ("" + (config.labels.segmentals.segmental)) + "");
    row.cells[3].innerHTML = null;
    row.cells[3].style.textAlign = 'center';
};


/* 'generateResultsTable' creates, appends and populates a results table at the end screen:
 *********************************************************************************************/

var generateResultsTable = function() {
    var elemTableContainer = CreateElement({ elem: 'div', id: 'table-container', className: 'table-results-container'});
    var elemTable = CreateElement({ elem: 'table', className: 'table-results-container' });
    var elemAnswersDiv = CreateElement({ elem: 'div', id: 'answers-div', className: 'elem-answers-div' });
    
    // Populate table header (column titles):
    populateTableCells({ elem: elemTable });
    elemTable.insertRow(0);
    for (var k = 0; k < 4; k++) elemTable.rows[0].insertCell();
    populateTableHeader(elemTable.rows[0]);
    elems.ul.ans.appendChild(elemAnswersDiv);
    elemAnswersDiv.appendChild(elemTableContainer);
    elemTableContainer.appendChild(elemTable);
};


/* 'timer' sets and clears a time interval that outputs the timer UI element:
 *****************************************************************************************************************/

var timer = {
    set: function() { gameData.sInterval = setInterval(function()  { elems.div.time.innerHTML = (("" + (gameData.timeCount.seconds++)) + ("" + (config.labels.segmentals.secondsShorthand)) + ""); }, 1000); },
    clear: function() { if (gameData.sInterval) clearInterval(gameData.sInterval); }
};


/* 'didUserAnswer' is a function for determining if the user has checked at least one answer on submit:
 *****************************************************************************************************************/

var didUserAnswer = function() {
    var liTags = document.getElementsByTagName('li');
    var li = [];

    // Only search for li elements that have a radio button child of the class 'elem-li-ans':
    for (var i = 0; i < liTags.length; i++) if (liTags[i].children[0].classList.contains('elem-li-ans')) li.push(liTags[i]);
    for (var j = 0; j < li.length; j++) {
        if (li[j].children[0].checked) {
            gameData.allQuestions[gameData.progress.questionNumber].userAnswer = j;
            gameData.progress.questionSelected = true;
        }
    }
    return gameData.progress.questionSelected;
};


/* 'alertHelper' is a function that fixes error in ES6 transpiler:
 *********************************************************************************************/

var alertHelper = function(msg) { eval((("alert('" + msg) + "')")); };


/* 'generateEndScreen' creates, appends and populates end screen UI elements:
 *****************************************************************************************************************/

var generateEndScreen = function() {
    var percentageFinal = parseInt(gameData.progress.userScore/gameData.allQuestions.length * 100);
    var elemBtnRetry = CreateElement({ elem: 'button', className: 'btn btn-block btn-primary', id: 'elem-btn-retry' });
    
    // Set questionScreen to false since this is an end screen:
    gameData.questionScreen = false;
    timer.clear();
    toggleUlPadding();
    updatePercentageBar();

    // Set the innerHTML values of various UI elements — user feedback in this case:
    elems.h2.ques.innerHTML = ("" + (config.labels.feedback.wellDone));
    elems.ul.ans.innerHTML = (("" + (config.labels.feedback.reviewAnswers)) + ("" + (config.labels.segmentals.segmental)) + "");
    elems.div.feedback.innerHTML = (("" + (config.labels.feedback.finishedIn)) + (" " + (gameData.timeCount.seconds)) + (" " + (config.labels.segmentals.seconds)) + "");
    elems.div.time.innerHTML = null;
    elems.h2.ques.innerHTML = (("" + (config.labels.feedback.scored)) + (" " + (gameData.progress.userScore)) + (" " + (config.labels.segmentals.divider)) + (" " + (gameData.allQuestions.length)) + (" (" + percentageFinal) + ("" + (config.labels.segmentals.percentage)) + ("). " + (generateFeedback(percentageFinal))) + "<hr>");
    
    // Remove submit button (to be replaced with retry button):
    elems.btn.submit.parentNode.removeChild(elems.btn.submit);
    
    generateResultsTable();

    // Append retry button to DOM, set an innerHTML value and attach a click event:
    elems.ul.ans.appendChild(elemBtnRetry);
    document.getElementById('elem-btn-retry').innerHTML = ("" + (config.labels.ui.retry));
    document.getElementById('elem-btn-retry').onclick = function() {
        reset.container();
        reset.hudValues();
        titleScreen.generate();
        toggleUlPadding();
    }
};


/* 'determineWhichScreen' redirects the app to either the question screen or end screen:
 *****************************************************************************************************************/

var determineWhichScreen = function() {
    if (gameData.progress.questionNumber >= gameData.allQuestions.length) {
        gameData.questionScreen = false;
        generateEndScreen();
    } else { 
        gameData.questionScreen = true;
        generateQuestion(); 
     }
};


/* 'submitQuestion' deals with actions to take upon a user clicking submit on each question.
   If user has selected an answer and it is correct, increment score and register answer as correct:
 *****************************************************************************************************************/

var submitQuestion = function() {
    var selected = didUserAnswer();
    var isItCorrect = parseInt(gameData.allQuestions[gameData.progress.questionNumber].userAnswer) === gameData.allQuestions[gameData.progress.questionNumber].answer;
    if (selected) {
        if (isItCorrect) {
            gameData.progress.userScore++;
            gameData.allQuestions[gameData.progress.questionNumber].correct = config.htmlEntitiesAndIcons.gradingIcons.correct;
        }
        gameData.progress.questionNumber++;
        determineWhichScreen();
    } else {
        alertHelper(config.labels.ui.selectAnswerAlert);
    }
};


/* 'reset' resets HUD and container values:
 *****************************************************************************************************************/

var reset = {
    hudValues: function() {
        gameData.progress = { questionNumber: 0, questionSelected: false, userScore: 0 };
        gameData.timeCount = { seconds: 0, minutes: 0 };
        gameData.questionScreen = false;
    },
    container: function() { document.getElementById('elem-div-sub-container').innerHTML = null; }
};


/* 'elemsDom' has methods for caching elements from DOM to variables, clearing innerHTML values and adding events:
 *****************************************************************************************************************/

var elemsDom = {
    cache: function() {
        elems.h2.ques = document.getElementById('elem-h2-ques');
        elems.ul.ans = document.getElementById('elem-ul-ans');
        elems.progress.bar = document.getElementById('elem-progress-bar');
        elems.div.time = document.getElementById('elem-div-time');
        elems.div.feedback = document.getElementById('elem-div-feedback');
        elems.btn.submit = document.getElementById('elem-btn-submit');
    },
    clear: function() {
        elems.h2.ques.innerHTML = null;
        elems.ul.ans.innerHTML = null;
    },
    addEvents: function() {
        elems.ul.ans.onclick = function(e)  { if (gameData.questionScreen) e.target.children[0].checked = 1; };
        window.onkeydown = function(e)  { if (checkCode(e) === 13 && elems.btn.submit) elems.btn.submit.click(); };
    }
};


/* 'fade' will fade in or fade out depending on the value of 'fadeType' in the passed in object:
 *****************************************************************************************************************/

var fade = function(o) {
    var fIn = function() {
      o.element.style.opacity = +o.element.style.opacity + o.fadeSpeed;
      if (+o.element.style.opacity < 1) (window.requestAnimationFrame && requestAnimationFrame(fIn)) || setTimeout(fIn, 16);
    };
    var fOut = function() {
        o.element.style.opacity = +o.element.style.opacity - o.fadeSpeed;
        if (+o.element.style.opacity > 0) (window.requestAnimationFrame && requestAnimationFrame(fOut)) || setTimeout(fOut, 16);
    };

    // If fadeType in the object passed is 'fadeIn", have the element fade in — or else have it fade out:
    o.element.style.opacity = (o.fadeType === 'fadeIn') ? 0 : 1;
    o.fadeType === 'fadeIn' ? fIn() : fOut();
};


/* 'hide' hides and element by setting opacity to zero (rather than 'display: none'):
 *****************************************************************************************************************/

var hide = function(element)  { element.style.opacity = 0; };


/* 'fadeIn' sets opacity to zero and fades to full opacity:
 *****************************************************************************************************************/

var fadeIn = function(arr) {
    for (var i = 0; i < arr.length; i++) {
        hide(arr[i]);
        fade({ element: arr[i], fadeType: 'fadeIn', fadeSpeed: 0.02 });
    }
};


/* 'updatePercentageBar' updates the value (width) of the percentage bar:
 *****************************************************************************************************************/

var updatePercentageBar = function(end) {
    var increment = 0;
    if (end) increment +=1;
    var percentageComplete = ((gameData.progress.questionNumber + increment) / gameData.allQuestions.length) * 100;
    elems.progress.bar.style.width = (("" + percentageComplete) + ("" + (config.labels.segmentals.PERCENTAGE)) + "");
};


/* 'generateQuestion' loops through, appends and populates the current question screen:
 *****************************************************************************************************************/

var generateQuestion = function() {
    gameData.questionScreen = true;
    updatePercentageBar();
    if (config.animations.fadesEnabled) fadeIn([elems.h2.ques, elems.ul.ans]);

    // Clear innerHTML values of DOM elements and (re)cache them to variables:
    elemsDom.clear();
    elemsDom.cache();
    elemsDom.addEvents();
    gameData.progress.questionSelected = false;

    for (var i = 0; i < gameData.allQuestions[gameData.progress.questionNumber].choices.length; i++) {
        var li = CreateElement({ elem: 'li' });
        elems.ul.ans.appendChild(li);
        li.appendChild(CreateElement({ elem: 'input', type: 'radio', name: 'radio', className: 'elem-li-ans' }));
        li.appendChild(document.createTextNode(gameData.allQuestions[gameData.progress.questionNumber].choices[i]));
    }
    
    elems.h2.ques.innerHTML = (("" + (gameData.progress.questionNumber + 1)) + (". " + (gameData.allQuestions[gameData.progress.questionNumber].question)) + "");
    elems.div.feedback.innerHTML = (("" + (config.labels.segmentals.questionShorthand)) + ("" + (gameData.progress.questionNumber + 1)) + (" " + (config.labels.segmentals.of)) + (" " + (gameData.allQuestions.length)) + "");
};


/* 'appendToDom' is a function that appends an array of elements to specified DOM elements:
 *********************************************************************************************/

var appendToDom = function(arr) { for (var i = 0; i < arr.length; i++) { document.getElementById(arr[i][0]).appendChild(arr[i][1]); } };


/* 'updateQuestionsCorrectValue' marks all questions wrong (with X symbol) by default:
 *****************************************************************************************************************/

var updateQuestionsCorrectValue = function() { for (var i = 0; i < gameData.allQuestions.length; i++) gameData.allQuestions[i].correct = config.htmlEntitiesAndIcons.gradingIcons.incorrect; };


/* 'questionSet' has methods to a load JSON file then call a passed-in function:
 *****************************************************************************************************************/

var questionSet = {
    load: function(o) {
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                var response = JSON.parse(this.response);
                // Function within argument object will write the question set (retrieved data) to an array:
                o.func(response);
            }
        };
        xhttp.open('GET', o.src, true);
        xhttp.send();
    },
    
    // Clear the array of the question set (retrived data):
    clear: function() { gameData.allQuestions = []; },

    // Reset the question set (retrived data) array:
    reset: function(o) {
        questionSet.clear();
        questionSet.load(o);
    }
};


/* 'questionScreen' has methods that programmatically generate question screen UI elements:
 *****************************************************************************************************************/

var questionScreen = {
    qaSection: function() {
        var elemQaDiv = CreateElement({ elem: 'div', className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12 div-padding-1 x', id: 'elem-q-div' }); 
        var elemQaDivSub = CreateElement({ elem: 'div', className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12 div-padding-1 x', id: 'elem-q-div-sub' });
        var elemUlAns = CreateElement({ elem: 'ul', className: 'elem-ul-ans', id: 'elem-ul-ans' });
        var elemSubmitBtn = CreateElement({ elem: 'button', className: 'btn btn-block btn-primary', id: 'elem-btn-submit' });
        
        // Append question screen QA elements as children of the following elements (elements are index zero of following array):
        appendToDom([['elem-div-sub-container', elemQaDiv], ['elem-q-div', elemQaDivSub], ['elem-q-div-sub', elemUlAns]]);
        appendToDom([['elem-q-div-sub', elemSubmitBtn]]);
        elems.btn.submit = document.getElementById('elem-btn-submit');
        elems.btn.submit.innerHTML = config.labels.ui.submit;
        elems.btn.submit.onclick = function () { submitQuestion(); };
    },
    pageHeader: function(QA) {
        var elemPHeader = CreateElement({ elem: 'div', className: 'elem-page-header', id: 'elem-p-header' });
        var elemPHeaderSub1 = CreateElement({ elem: 'div', className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12 div-padding-1 elem-container-border', id: 'elem-p-header-sub1' });
        var elemPHeaderSub1A = CreateElement({ elem: 'div', className: 'col-lg-6 col-md-6 col-sm-6 col-xs-6 div-padding-1 elem-container-border', id: 'elem-p-header-sub1a' });
        var elemPHeaderSub1B = CreateElement({ elem: 'div', className: 'col-lg-6 col-md-6 col-sm-6 col-xs-6 div-padding-1 elem-container-border elem-timer', id: 'elem-p-header-sub1b' });
        var elemPHeaderSub1ASub = CreateElement({ elem: 'div', className: 'elem-hud-text', id: 'elem-div-feedback' });
        var elemPHeaderSub1BSub = CreateElement({ elem: 'div', className: 'elem-hud-text elem-timer', id: 'elem-div-time' });
        var elemPHeaderHr = CreateElement({ elem: 'hr' });
        var elemDivProgress = CreateElement({ elem: 'div', className: 'progress', id: 'elem-div-progress' });
        var elemDivProgressSub = CreateElement({ elem: 'div', id: 'elem-progress-bar', className: 'progress-bar progress-bar-success', role: 'progressbar', ariaValuenow: "0", ariaValueMin: "0", ariaValueMax: "100", style: "width: 0%" });
        var elemPHeaderH2 = CreateElement({ elem: 'h2', id: 'elem-h2-ques' });
        
        // Append question-screen QA elements as children of the following elements (elements are index zero of following array):
        appendToDom([
            ['elem-div-sub-container', elemPHeader],
            ['elem-p-header', elemPHeaderSub1],
            ['elem-p-header-sub1', elemPHeaderSub1A],
            ['elem-p-header-sub1', elemPHeaderSub1B],
            ['elem-p-header-sub1a', elemPHeaderSub1ASub],
            ['elem-p-header-sub1b', elemPHeaderSub1BSub],
            ['elem-p-header', elemPHeaderHr],
            ['elem-p-header', elemDivProgress],
            ['elem-div-progress', elemDivProgressSub],
            ['elem-p-header', elemPHeaderH2]
        ]);

        gameData.questionScreen = true;
        if (QA) questionScreen.qaSection();
        if (!elems.h2.ques || !elems.ul.ans) elemsDom.cache();
        elemsDom.addEvents();
    },
    generate: function() { questionScreen.pageHeader(1); }
};


/* 'titleScreen' has methods that generate and clear UI elements from the title screen:
 *********************************************************************************************/

var titleScreen = {
    generate: function() {
        var elemBr1 = CreateElement({ elem: 'br' });
        var elemBr2 = CreateElement({ elem: 'br' });
        var elemDivOuter = CreateElement({ elem: 'div', className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12 div-padding-1 x', id: 'elem-div-outer' });
        var elemDivOuter2 = CreateElement({ elem: 'div', className: 'col-lg-12 col-md-12 col-sm-12 col-xs-12 div-padding-1 x', id: 'elem-div-outer-2' });
        var elemH1Title = CreateElement({ elem: 'h1', className: 'elem-h1-title-screen', id: 'elem-h1-title' });
        var elemH2Title = CreateElement({ elem: 'h2', className: 'elem-h2-title-screen', id: 'elem-h2-subtitle' });
        var elemMidDiv = CreateElement({ elem: 'div', className: 'elem-mid-div', id: 'elem-mid-div' });
        var elemBtnTitleScreen1 = CreateElement({ elem: 'button', className: 'btn btn-block btn-primary', id: 'elem-btn-title-screen-1' });
        var elemBtnTitleScreen2 = CreateElement({ elem: 'button', className: 'btn btn-block btn-primary', id: 'elem-btn-title-screen-2' });
        var elemFooter = CreateElement({ elem: 'footer', className: 'elem-footer text-center', id: 'elem-footer' });
        
        // Append UI elements as children of the following elements:
        appendToDom([
            ['elem-div-sub-container', elemBr1],
            ['elem-div-sub-container', elemBr2],
            ['elem-div-sub-container', elemDivOuter],
            ['elem-div-outer', elemDivOuter2],
            ['elem-div-outer-2', elemH1Title],
            ['elem-div-outer-2', elemH2Title],
            ['elem-div-outer-2', elemMidDiv],
            ['elem-div-outer-2', elemBtnTitleScreen1],
            ['elem-div-outer-2', elemBtnTitleScreen2],
            ['elem-div-outer-2', elemFooter]
        ]);
        document.getElementById('elem-h1-title').innerHTML = ("" + (config.labels.title.titleScreenTitle));
        document.getElementById('elem-h2-subtitle').innerHTML = ("" + (config.labels.title.titleScreenSubtitle));
        document.getElementById('elem-btn-title-screen-1').innerHTML = ("" + (config.labels.ui.startQuiz));
        document.getElementById('elem-btn-title-screen-2').innerHTML = ("" + (config.labels.ui.settings));
        document.getElementById('elem-footer').innerHTML = ("" + (config.labels.title.footer));
        document.getElementById('elem-btn-title-screen-1').onclick = function() { titleScreen.clear(1); };
        document.getElementById('elem-btn-title-screen-2').onclick = function() { alertHelper('Settings not available in this version!'); };

        if (config.animations.fadesEnabled) fadeIn([document.getElementById('elem-h1-title'), document.getElementById('elem-h2-subtitle'), document.getElementById('elem-footer')]);
    },

    // Programmatically-clear UI elements. If a truthy argument is passed, load questions and generate 'questionScreen' UI:
    clear: function(goToQuestions) {
        reset.container();
        if (goToQuestions) {
            questionScreen.generate();
            // Resetting the question set has two parts — clearing the question set array and loading a new one with a function:
            questionSet.reset({ arr: gameData.allQuestions, src: config.questionJsonSrc, func: function(response)  { for (var i = 0; i < response.length; i++) { gameData.allQuestions.push(response[i]); }
                // Update question set so that all questions are marked wrong (with an X symbol) by default and generate a question:
                setTimeout(function() {
                    updateQuestionsCorrectValue();
                    generateQuestion();
                    timer.set();
                }, 150);
            }});
        }
    }
};


/* Initialize app by generating a title screen:
 *********************************************************************************************/

var init = function() { titleScreen.generate(); };
init();
