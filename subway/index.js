var oldCount = 0;
var newCount = 0;

function updateCount() {
    return $.post('https://www.subwaylivefeed.com.au/api/tally')
        .then(r => {
            $("#count").text(r.data[0].count);
			newCount = r.data[0].count;
			var movement = newCount - oldCount; 
			scroll3(movement);
			oldCount = newCount;
        });
}

setInterval(updateCount, 1000);

function scroll3(movement) {
    $("#sub").animate({backgroundPosition: "+=" + movement * 50 + "px"}, 500);
}