//construct the HTML for a stop
function buildStopLink(stop) {
  var stop_url = "https://myttc.ca/" + stop["uri"];

  //stops organized as <li>, with link to stop URL
  var stop_node = $("<li>").append($("<a>").attr("href", stop_url).text(stop["name"])
                                           .append($("<span>").addClass("glyphicon glyphicon-link"))
  );

  //if a stop has related routes, construct inner <ul>
  //list of routes hidden at start, revealed by click on "Routes" link
  if (stop["routes"].length > 0) {
    $(stop_node).append($("<a>").attr("href", "#routes_" + stop["uri"]).addClass("routes-show")
                                .text("Routes").append($("<span>")
                                .addClass("glyphicon glyphicon-menu-down"))
                                .attr("role", "button").attr("data-toggle", "collapse")
    );
    var routes_node = $("<ul>").addClass("routes collapse").attr("id", "routes_" + stop["uri"]);
    $.each(stop["routes"], function(i, route) {
      $(routes_node).append($("<li>").text(route["name"]));
    });
    $(stop_node).append(routes_node);
  }
  return stop_node;
}

$(function() {
  //store responses to avoid repeated requests to API
  var cache = {};

  //given a station URI, request JSON and build list of stops
  $("#stationSelect").submit(function(e) {
    $("#target").html('');
    var slug = $("#stationSlug").val();
    if (cache[slug]) { //skip request if in cache
      $.each(cache[slug]["stops"], function(i, stop) {
        $("#target").append(buildStopLink(stop));
      });
    } else {
      var base_url = "https://myttc.ca/";
      var target_url = base_url + slug + ".json";
      $.ajax({
        url: target_url,
        dataType: 'jsonp'
      })
        .done(function(data) {
          $.each(data["stops"], function(i, stop) {
            $("#target").append(buildStopLink(stop));
          });
          cache[slug] = data;
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
          //this isn't getting used on 404, but it's not clear why
          $("#target").append($("<li>").text("Looks like that's not a station..."));
        });
    }
    e.preventDefault();
  });
});
