$(document).ready(function () {
  setInterval(function () {
    $.get('/h_cpu', function (e) {
      $('#h_cpu').text(Math.round(e)).text();
    });
    $.get('/d_guild', function (e) {
      $('#d_guild').text(e).text();
    });
    $.get('/d_user', function (e) {
      $('#d_user').text(e).text();
    });
  }, 1000);
  var clicked = 0;
  $(".huh").click(function () {
    $(this).data("clicks", $(this).data("clicks") ? $(this).data("clicks") + 1 : 1);

    if ($(this).data("clicks") === 6) {
      $(this).text("?");
      clicked++;
    }

    var text = $("i").text();

    if (clicked < 3) {
      $("i").text("huh");
      setTimeout(() => {
        $("i").text(text);
      }, 100);
    } else {
      $("*").css("transition", "none");
      $("i").text("uwu");
      $(".soot").css("filter", "opacity(1)");
      $(".rainbow").removeClass("rainbow");
      $("body").css({
        "animation": "none",
        "background": "black url('https://images3.alphacoders.com/887/thumb-1920-887715.png') no-repeat fixed center"
      });
      document.title = "monika";
      $(".bigtext").hide();
      $(".wut").text("you think that i died?");
      setTimeout(() => {
        $(".wut").text("you think you can get rid of me?");
      }, 6000);
      setTimeout(() => {
        $(".wut").text("well too bad for you...");
      }, 12000);
      setTimeout(() => {
        $(".wut").text("i will never die");
        $(".wut").css("color", "red");
      }, 19000);
      $(".woot").css("left", "calc(50% - 250px)");
      $(".woot").css("top", "calc(50% - 150px)");
      setTimeout(() => {
        var i = 1;
        var s = setInterval(() => {
          $(".diet").css("transform", `scale(${i += 0.1}, ${i += 0.1})`);

          if (i >= 50) {
            $(".soot").css("transition", "all 0.5s ease");
            $(".wut").hide();
            clearInterval(s);
            $(".diet").addClass("glitch");
            $(".diet").css("transform", "scale(1, 1)");
            $(".diet").css("color", "red");
            setTimeout(() => {
              $(".soot").css("filter", "opacity(0.8)");
              $(".diet").parent().append("<h3 class='glitch' data-text='die' style='color: red'>die</h3>");
              $(".diet").hide();
              setTimeout(() => {
                location.reload();
              }, 5000);
            }, 5000);
          }
        }, 50);
      }, 20000);
    }
  });
  $(window).scroll(function () {
    if (clicked === 3) return;
    var height = $(window).scrollTop();

    if (height > $(window).outerHeight() * 2) {
      $("i").text("scroll up");
      $(".woot").css("top", "100%");
    } else if (height > $(window).outerHeight()) {
      $("i").text("keep scrollinnng");
      $(".woot").css("top", "calc(50% - 150px)");
      $(".woot").css("left", "0");
    } else if (height > 10) {
      $("i").text("keep going");
      $(".woot").css("left", "calc(100% - 500px)");
    } else {
      $("i").text("scroll down");
      $(".woot").css("left", "calc(50% - 250px)");
    }
  });
});