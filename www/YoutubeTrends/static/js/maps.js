
// Make a deep copy of alldata so that line graph can show the data without alterations
var lineGraphAllData = jQuery.extend(true, {}, alldata);

// Store current location selected
var locations = ['Global', 'Global'];

// This isn't actually used
/*
d3.json("data/all.json", function (error, json) {
    if (error) return console.warn(error);
    alldata = json;
});
*/

// Some options for colours
rfill = ['#fef0d9', '#fdcc8a', '#fc8d59', '#e34a33', '#b30000'];
bfill = ['#ca0020', '#f4a582', '#ffffff', '#bababa', '#404040'];
yfill = ['#ffffb2', '#fecc5c', '#fd8d3c', '#f03b20', '#bd0026'];
gfill = ['#ffffcc', '#c2e699', '#78c679', '#31a354', '#006837'];
mfill = ['#eff3ff', '#bdd7e7', '#6baed6', '#3182bd', '#08519c'];

// Change this to change the colourscheme
c_fil = yfill;

// Generate a legend
var linear = d3.scale.quantize()
  .domain([0,100])
  .range(c_fil);

var svg = d3.select("#legendsvg");
var container =  document.getElementById('pop');
var lwidth = pop.getBoundingClientRect().width;
lwidth = (lwidth * 0.4) / 6;

svg.append("g")
  .attr("class", "legendLinear")
  .attr("transform", "translate(20,20)");

var legendLinear = d3.legend.color()
  .shapeWidth(lwidth)
  .orient('horizontal')
  .scale(linear)
  .labels(["0-20","20-40","40-60","60-80","80-100"]);

svg.select(".legendLinear")
  .call(legendLinear);


fill = {
    L: c_fil[0],
    LM: c_fil[1],
    M: c_fil[2],
    MH: c_fil[3],
    H: c_fil[4],
    UNKNOWN: 'rgb(0,0,0)',
    defaultFill: 'grey'
};

// We want the maps to have the same properties
geoConf = {
    borderColor: 'black',
    borderOpacity: 0.5,
    //popupOnHover: false,
    highlightBorderColor: 'black',
    highlightBorderWidth: 4,
    highlightFillColor: 'lol not a colour',
    highlightBorderOpacity: 0.5,
    popupTemplate: function (geo, data) {
        return ['<div class="hoverinfo">',
            'Popularity in ' + geo.properties.name,
            ': ' + data.popularity,
            '</div>'].join('');
    }
};

function mapdone (datamap) {
    // Zoom - Make this linked
    datamap.svg.call(d3.behavior.zoom().on("zoom", redraw));
    //function redraw() {
    //    datamap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    //}

    // Populate line graph with selected country information
    datamap.svg.selectAll('.datamaps-subunit').on('click', function (geography) {
        // This will be used to set graphs based on click\
        var selected_item;
        if(datamap.options.element.id == "leftmap") {
            selected_item = $("#file_type option:selected").text();
        } else {
            selected_item = $("#file_type_right option:selected").text();
        }
        var country_code = geography.id;
        var data_set = new Array(54);
        data_set[0] = ["google", "youtube"];
        data_set[1] = [0, 0];
        for (var i = 0; i < 52; ++i) {
            // Currently has minimal error checking or handling
            // Fill throw an error in the log if the country is greyed out
            var google_value = null;
            var youtube_value = null;
            var selected_item_data = null;
            if ((selected_item in lineGraphAllData)) {
                selected_item_data = lineGraphAllData[selected_item];
                if (("Google" in selected_item_data) && country_code in selected_item_data["Google"][i]) {
                    google_value = selected_item_data["Google"][i][country_code].popularity;
                }
                if ("Youtube" in selected_item_data && country_code in selected_item_data["Youtube"][i]) {
                    youtube_value = selected_item_data["Youtube"][i][country_code].popularity;
                }
            }
            data_set[i + 2] = [google_value, youtube_value]
        }
        if (data_set[1][0] != null || data_set[1][1] != null) {
            if(datamap.options.element.id == "leftmap") {
                $("#line_graph_1_header").text(geography.properties.name + " Trends");
                $("#line_graph_1_merge_header").text(geography.properties.name);
                locations[0] = geography.properties.name;
                generate_line_graph(0, '#line_graph_1', data_set);
            } else {
                $("#line_graph_2_header").text(geography.properties.name + " Trends");
                $("#line_graph_2_merge_header").text(geography.properties.name);
                locations[1] = geography.properties.name;
                generate_line_graph(1, '#line_graph_2', data_set);
            }
            $("#line_graph_merge_subheader").text(selectedItems[1] + " " + locations[0] + " vs " + selectedItems[3] + " " + locations[1]);
            fetchRowsFromTwoFiles(2, '#line_graph_merged', selectedItems[1], selectedItems[3]);
        }
    });
}
var lmap = new Datamap({
    element: document.getElementById('leftmap'),
    fills: fill,
    data: alldata["Gangnam Style"]["Youtube"][0],
    geographyConfig: geoConf,
    done: mapdone,
});

var rmap = new Datamap({
    element: document.getElementById('rightmap'),
    fills: fill,
    data: alldata["See You Again"]["Youtube"][0],
    geographyConfig: geoConf,
    done: mapdone,
});

function redraw() {
    lmap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    rmap.svg.selectAll("g").attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

}

var current_week = 0;
var current_l_song = "Gangnam Style";
var current_r_song = "Blank Space";
var current_l_source = "Youtube";
var current_r_source = "Youtube";

function setWeek(value) {
    current_week = value - 1;
    updateMaps();
}

function setLData(song, source){
    clearMaps();
    current_l_song = song;
    current_l_source = source;
    updateMaps();
}

function setRData(song, source){
    clearMaps();
    current_r_song = song;
    current_r_source = source;
    updateMaps();
}

function clearMaps(){
    lmap.updateChoropleth(
        null, {reset: true}
    );
    rmap.updateChoropleth(
        null, {reset: true}
    );
}

function updateMaps(){
    lmap.updateChoropleth(
        alldata[current_l_song][current_l_source][current_week]
    );
    rmap.updateChoropleth(
        alldata[current_r_song][current_r_source][current_week]
    );
}

setWeek(2);
setWeek(1);