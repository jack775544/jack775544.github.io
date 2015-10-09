var i = 1;
$(document).ready(function(){
    $('.makeitrain').click(function(){
        if (i){
            create();
            drop();
            i = 0;
        }
        else {
            $('.potato').remove();
            clearTimeout(spam);
            clearTimeout(animate);
            i = 1;
        }
    });
    $('.nope').click(function(){
        $('.potato').remove();
        clearTimeout(spam);
        clearTimeout(animate);
        console.log('');
        $(this).removeClass('nope').addClass('makeitrain');
    });
});

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