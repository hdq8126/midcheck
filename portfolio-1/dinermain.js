$(function () {
    var last = 3;
    $("input").on("click", function () {
        var number = $("li").length;
        var randomnumber = Math.floor(Math.random()*number);
        /*if (last==randomnumber)
            randomnumber=(randomnumber+1)%3;
        */
        while(last==randomnumber)
        {
            randomnumber = Math.floor(Math.random()*number);
        }
        last = randomnumber;
        $("h1").text($("li").eq(randomnumber).text());
        $("img").attr("src",`images/${randomnumber}.jpg`);
    });
});

