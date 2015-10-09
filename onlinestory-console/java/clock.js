/*function UpdateClock() {
    var time = new Date();
    hours = time.getHours();
    mins = time.getMinutes();
    document.getElementById("clock").innerHTML = hours + ":" + mins;
    setTimeout("UpdateClock()", 30000);
}*/

function display_c() {
    var refresh = 1000; // Refresh rate in milli seconds
    mytime = setTimeout('display_ct()', refresh)
}

function display_ct() {
    var strcount
    var x = new Date()
    document.getElementById('ct').innerHTML = x;
    tt = display_c();
}