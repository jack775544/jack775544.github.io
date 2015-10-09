/* The website is now an open bash-like console that can navigate though a VFS 
This could be done alot better however I have no access to server side code so this is the best that can be done for the client side 

Release History:
Eins: Created console
Zwei: Revamped less*/

var commandRegister = {};
var helpRegister = {};
var commandHistory = new Array();
var curDir = "~";
var keyIndex = 0;
var folderArray = {};
var rain = 1;
var pass = undefined;
var fileMap = {};
var lastPass = undefined;
var loadCount = 0;
var loadInterval= undefined;
var consoleVersion = "Zwei";

function addToHelpRegister(command, desc) {
    helpRegister[command] = desc;
}

function addToCommandRegister(alias, command) {
    commandRegister[alias] = command;
}

function getCommand(command) {
    return commandRegister[command];
}

function run() {
    var text = $.trim($('#input').val());
    if (text == "") {
        return;
    }
    if (pass !== undefined){
        if (CryptoJS.SHA3(text) == pass[0]){
            curDir = folderArray[pass[1]];
            lastPass = text;
            buildFileMap();
            printErrorToConsole("Password Correct, Welcome USER");
            $("#dir").text(curDir.name);
        } else {
            $("#dir").text(curDir.name);
            printErrorToConsole("Incorrect Password");
        }
        $('#input').val("");
        pass = undefined;
        window.scrollTo(0,document.body.scrollHeight);
        return;
    }
    commandHistory.push(text);
    printToConsole("$ " + curDir.name + "&gt;" + text);
    keyIndex = commandHistory.length;
    var input = text.split(" ");
    input[0] = input[0].toLowerCase();
    var command = getCommand(input[0]);
    if (command !== undefined) {
        command(input, text);
    } else {
        printErrorToConsole("Error: Command " + input[0] + " is not a valid command");
    }
    $('#input').val("");
    window.scrollTo(0,document.body.scrollHeight);
}

function historyUp() {
    if (keyIndex == 0) {
        return;
    }
    keyIndex = keyIndex - 1;
    $('#input').val(commandHistory[keyIndex]);
}

function historyDown() {
    if (keyIndex == commandHistory.length - 1) {
        return;
    }
    keyIndex = keyIndex + 1;
    $('#input').val(commandHistory[keyIndex]);
}

function initText() {
    printToConsole("Caelum OS");
    printToConsole("V2.0 Blue Edition");
    printToConsole("To view system help type 'help' or 'about' for details")
    printToConsole("-------------------------------");
}

function printToConsole(text) {
    $('#console').append(text + "<br/>");
}

function printCommandToConsole(text) {
    printToConsole("&gt; " + text);
}

function printErrorToConsole(text){
    printCommandToConsole('<span style="color:#009900;">' + text + '</span>');
}

function helpAll(){
    printCommandToConsole("Displaying System Help");
    var commandList = new Array();
    for (var command in helpRegister){
        if (helpRegister.hasOwnProperty(command)){
            commandList.push(command);
        }
    }
    for (var i = 0; i < commandList.length; i++){
        var currentCommand = commandList[i];
        var output = '<span style="color:#009900;">';
        for (var alias in commandRegister) {
            if (commandRegister.hasOwnProperty(alias)) {
                var command = commandRegister[alias];
                if (currentCommand == command){
                    output = output + alias + "|"; 
                }
            }
        }
        output = output.substring(0, output.length - 1);
        output = output + '</span> '  + helpRegister[currentCommand];
        printToConsole(output);
    }
}

function helpSingle(alias){
    if (commandRegister.hasOwnProperty(alias)){
        printToConsole(helpRegister[commandRegister[alias]]);
    } else {
        printErrorToConsole("Error: Command " + alias + " is not a valid command");
    }
}

function runLess(args){
    var text = $.trim(args);
    $('#lessInput').val("");
    switch(text) {
        case "exit":
            closeLess();
            break;
        case ":q":
            closeLess();
            break;
        case "quit":
            closeLess();
            break;
        case "q":
            closeLess();
            break;
    }
}

function closeLess(){
    toggleConsole();
    $('#loadscreen').remove();
    disableBinds();
    enableBinds();
}

// --------- Console Functions ---------

function clearConsole() {
    $('#console').text("");
    initText();
}

function clearHistory() {
    commandHistory = new Array;
    keyIndex = 0;
    printCommandToConsole("Command History Cleared");
}

function helpMessage(args){
    if (args.length > 2){
        printErrorToConsole("Error: Invalid Args");
    } else if (args.length == 2) {
        helpSingle(args[1]);
    } else {
        helpAll();
    }
}

function ls(args){
    if (args.length > 1){
        printErrorToConsole("Error: Invalid Args");
        return;
    }
    var folders = curDir.childFolders;
    printToConsole('<span style="color:red;">.</span>');
    if (curDir.parent !== undefined){
        printToConsole('<span style="color:red;">..</span>');
    }
    if (folders !== undefined){
        for (var i = 0; i<folders.length; i++){
            printToConsole('<span style="color:red;">./' + folders[i] + '</span>');
        }
    };
    var files = curDir.files;
    if (files !== undefined){
        for (var i = 0; i<files.length; i++){
            printToConsole('<span style="color:cyan;">' + files[i] + '</span>');
        }
    }
}

function cd(args){
    if (args.length > 2){
        printErrorToConsole("Error: Invalid Args");
        return;
    }
    if(args.length == 1 || args[1] == "~"){
        curDir = folderArray["~"];
        folderName = "~";
        $("#dir").text(folderName);
        return;
    }
    var folders = curDir.childFolders;
    var folderName = args[1];
    if (folderName == ".."){
        if (curDir.parent === undefined){
            return;
        }
        folderName = curDir.parent;
        curDir = folderArray[folderName];
    } else if (folderName == "."){
        folderName = curDir.name;
    } else {
        var index = $.inArray(folderName, folders);
        if (index != -1){
            if (folderArray[folderName].pwd !== undefined){
                printCommandToConsole("Welcome USER. Please enter the password:");
                pass = [folderArray[folderName].pwd, folderName];
                $("#dir").text("");
                return;
            }
            curDir = folderArray[folderName];
        } else {
            printErrorToConsole("Error: The folder " + folderName + " does not exist");
            return;
        }
    }
    $("#dir").text(folderName);
}

function printHistory(){
    var out = "";
    for (var i = 0; i<commandHistory.length; i++){
        out = out + commandHistory[i] + "; ";
    }
    printToConsole(out);
}

function create(){
    var w = $(document).width()
    var x = w * Math.random();
    if (w-x < 50){
        x = x-75;
    }
    var img = $('<img />',
                 { class: 'potato',
                   src: 'icons/potato.png', 
                   alt:'Potato-Chan has made it rain'})
                  .appendTo($('body'));
    $(img).css('left', x);
    $(img).css('top', -50);
    spam = setTimeout(create,500);
}

function drop(){
    $('.potato').each(function(){
        this.style.top = parseInt(this.style.top) + 10 + 'px';
        if ($(document).height() - parseInt(this.style.top) < 60){
            $(this).remove();
        }
    });
    animate = setTimeout(drop, 20);
}

function potato(){
    if (rain){
        create();
        drop();
        rain = 0;
    } else {
        $('.potato').remove();
        clearTimeout(spam);
        clearTimeout(animate);
        rain = 1;
    }
}

function exposition(){
    var text = "<h3>A Monochrome World</h3><p>In this modern world we commonly try to abstract things into shades of grey. No reason is ever wholly pure or evil, people live the way they want and do nothing else. However the world that we live in is one of binomial outcomes. Success or failure, life or death; nothing is indiscriminate; we exist in a world of monochrome. Anything else is merely an apologist’s illusion; an excuse to justify the actions that have been taken, for better or worse. One person’s white is another person’s black, one person's prestige is another person’s fall, and one person’s life is another person’s death. This is the way of the world - Sharfa</p>";
    printToConsole(text);
}

function less(args){
    if (args.length != 2){
        printErrorToConsole("Error: Invalid Args");
        return;
    }
    var fileName = args[1];
    var files = curDir.files;
    var index = $.inArray(fileName, files);
    if (index != -1){
        toggleConsole();
        disableBinds();
        var loc = fileMap[fileName];
        var storyScreen = $('<div></div>',{id: 'loadscreen'}).appendTo($('body'));
        var storyText = $('<div></div>',{id: 'story'}).appendTo($('#loadscreen'));
        $('<p></p>',{id: 'lessHelpText'}).appendTo($('#loadscreen'));
        var lessInput = $('<input></input>',{id: 'lessInput', class: 'entry'}).appendTo($('#loadscreen'));
        $('#lessHelpText').text('[END OF FILE]');
        $('#lessHelpText').append('<br/><span style="color:#009900;">type q then return to exit</span>');
        $("#story").load(loc + " #story", function() {
            enableLessBinds();
            window.scrollTo(0,0);
        });
    } else {
        printErrorToConsole("Error: File not found");
    }
}

function about(){
    printToConsole('Caelum OS Console. Release: <span style="color:#009900;">'+ consoleVersion +'</span><br/>Story written by <span style="color:#009900;">Potato-chan</span><br/>Console written by <span style="color:#009900;">Sharfa</span>');
    printCommandToConsole('Look for Potato-chan on <a href="https://lainchan.org/irc" target="_blank">IRC</a>');
}

function irc(){
    var win = window.open('https://lainchan.org/irc', '_blank');
    if(win){
        win.focus();
    }else{
        printErrorToConsole('Please allow popups for this site');
    }
}

function legacy(){
    var win = window.open('index_legacy.html', '_blank');
    if(win){
        win.focus();
    }else{
        printErrorToConsole('Please allow popups for this site');
    }
}  

function echo(args, original){
    if (args.length == 1){
        printToConsole("");
    } else {
        var result = original.substr(original.indexOf(" ") + 1);
        printToConsole(result);
    }
}
        

function commands() {
    addToHelpRegister(about, "Information about the console");
    addToCommandRegister("about", about);
    
    addToHelpRegister(irc, "Open the lainchan IRC in a new browser tab");
    addToCommandRegister("irc", irc);
    
    addToHelpRegister(clearConsole, "Clears the console");
    addToCommandRegister("cls", clearConsole);
    addToCommandRegister("clear", clearConsole);

    addToHelpRegister(clearHistory, "Clears console history");
    addToCommandRegister("clsh", clearHistory);
    addToCommandRegister("clearhist", clearHistory);
    addToCommandRegister("clearhistory", clearHistory);
    
    addToHelpRegister(helpMessage, "Displays this help message");
    addToCommandRegister("exposition" , exposition);
    addToCommandRegister("help", helpMessage);
    
    addToHelpRegister(ls, "Shows all files and folders in the current folder");
    addToCommandRegister("ls", ls);
    addToCommandRegister("dir", ls);
    
    addToHelpRegister(cd, '<span style="color:#009900;">[foldername]</span> Change the current directory');
    addToCommandRegister("cd", cd);
    
    addToHelpRegister(printHistory, "Prints the console command history");
    addToCommandRegister("potato", potato);
    addToCommandRegister("hist", printHistory);
    addToCommandRegister("history", printHistory);
    addToCommandRegister("printhistory", printHistory);
    
    addToHelpRegister(less, '<span style="color:#009900;">[filename]</span> Opens a file');
    addToCommandRegister("less", less);
    
    addToHelpRegister(legacy, "View the non terminal version of the website");
    addToCommandRegister("legacy", legacy);
    addToCommandRegister("old", legacy);
    
    addToHelpRegister(echo, "Print the given string");
    addToCommandRegister("echo", echo);
}

// ---------

function initFolders(){
    /* These folders are completely virtual and have no relavence the the server file structure.
    A folders index in the map is it's name and the name property must be the same as this.
    A folder must reference both it's parent folder as well as any child folders that exist (yes this does mean there is doubling up but it is much easier)
    The files are the name of the files for the user to see, there is a mapping to the server location in the buildFileMap function
    pwd is the encoding of the password */
    folderArray["~"]        = {name:"~", 
                               parent:undefined, 
                               childFolders:["journals", "logs"], 
                               files:undefined, 
                               pwd:undefined};
    folderArray["logs"]     = {name:"logs", 
                               parent:"~", 
                               childFolders:undefined, 
                               files:["log_3/9/15.txt", "log_17/9/15.txt", "log_25/9/15.txt"], 
                               pwd:undefined};
    folderArray["journals"] = {name:"journals", 
                               parent:"~", 
                               childFolders:["roland", "violet"], 
                               files:undefined, 
                               pwd:undefined};
    folderArray["roland"]   = {name:"roland", 
                               parent:"journals", 
                               childFolders:undefined, 
                               files:["roland-1.txt", "roland-2.txt", "roland-3.txt"], 
                               pwd:'27cfe1c4c58e082c734bd19495dc681aed2563468cd5a6903f98580198e7e0cd4a615e67135f41c81fb861e967e7b660a0fa748515c7ee8cd94963d94434b13a'};
    folderArray["violet"]   = {name:"violet", 
                               parent:"journals", 
                               childFolders:undefined, 
                               files:["violet-1.txt", "violet-2.txt", "violet-3.txt"], 
                               pwd:"75741bbec44faa40ff4479e7640339b87f2b92fd6b5f11dd16a739006faf9c1415e06a3c21438bf96a45eb0dce0e9105e1be858f1dee981864b1e581a54c3af3"};
    
    buildFileMap();
    
    curDir = folderArray["~"];
}

function buildFileMap(){
    /* Maps the file location on the VFS to the physical file location */
    fileMap["roland-1.txt"] = "diary/" + lastPass + "/Roland-1.html"; // In passworded folder
    fileMap["roland-2.txt"] = "diary/" + lastPass + "/Roland-2.html";
    fileMap["roland-3.txt"] = "diary/" + lastPass + "/Roland-3.html";
    fileMap["violet-1.txt"] = "diary/" + lastPass + "/violet-1.html";
    fileMap["violet-2.txt"] = "diary/" + lastPass + "/violet-2.html";
    fileMap["violet-3.txt"] = "diary/" + lastPass + "/violet-3.html";
    fileMap["log_3/9/15.txt"] = "story/Chap1.html"; // Non passworded folder
    fileMap["log_17/9/15.txt"] = "story/Chap2.html";
    fileMap["log_25/9/15.txt"] = "story/Chap3.html";
}

function loadScreen(){
    var loadscreen = $('<div></div>',{id: 'loadscreen'}).appendTo($('body'));
    var loadblock = $('<div></div>',{id: 'loadblock'}).appendTo($('#loadscreen'));
    // Props to you if you understand where the message comes from.
    $('#loadblock').append('Welcome to Caelum OS: The proactively insecure Unix-like operating system.<br/><br/>Loading - <span id="loadpercent">0%</span><br/><br/>');
    var loadbar = $('<div></div>',{id: 'loadbar'}).appendTo($('#loadblock'));
    loadbar.width(0);
    loadInterval = window.setInterval(function(){
        var w = $("#loadblock").width();
        nw = w / 100.0;
        $("#loadpercent").text(loadCount + "%");
        $("#loadbar").width(nw * loadCount);
        $("#loadbar").width($("#loadbar").width()+nw);
        loadCount = loadCount + 1;
        if (loadCount >= 100) {
            window.clearInterval(loadInterval);
            $("#loadscreen").remove();
            $('#console').text("");
            init();
        }
    },30);
}

function enableBinds(){
    $('#input').prop('disabled', false);
    $(document).keypress(function (e) {
        $('#input').focus();
        if (e.which == 13) {
            run();
        }
    });
    $(document).keydown(function (e) {
        $('#input').focus();
        if (e.which == 38) {
            historyUp();
        }
        if (e.which == 40) {
            historyDown();
        }
    });
    $('#input').focus();
};

function disableBinds(){
    $('#input').prop('disabled', true);
    $(document).off("keypress");
    $(document).off("keydown");
}

function enableLessBinds(){
    $(document).keydown(function (e) {
        if (e.which != 38 && e.which != 40){
            $('#lessInput').focus();
        }
    });
    $(document).keypress(function (e) {
        //$('#lessInput').focus();
        if (e.which == 13) {
            runLess($('#lessInput').val());
        }
    });
}

function toggleConsole(){
    $("#consoleMain").toggle();
}

function init() {
    enableBinds();
    commands();
    initFolders();
    initText();
}

$(document).ready(function () {
    loadScreen();
});