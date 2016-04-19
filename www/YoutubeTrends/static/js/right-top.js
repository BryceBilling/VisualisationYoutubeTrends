/**
 * Created by Bryce on 2016/03/08.
 */
//Gets info when a video is selected and changes the pic accordingly
function changeVariableRight() {

    //console.log(selectedItem.text);
    d3.tsv("data/song_data.tsv", function (rows) {
        assignValuesRight(rows);
    });
}

//Assigns a value to the various data points
function assignValuesRight(rows) {
    index = rows.findIndex(matchRight)
    var selectCtrl = document.getElementById("trend_type_right");
    var selectedItem = selectCtrl.options[selectCtrl.selectedIndex];
    var name = selectedItem.value;
    if(name == "Google"){
        $('#NameGoogle_right'+extension).text(rows[index].Name);
        $('#ArtistGoogle_right'+extension).text(rows[index].Artist);
        $('#ViewGoogle_right'+extension).text(rows[index].Hits);
        $('#DatePub_right'+extension).text(rows[index].DateReleased);
    }else {
        $('#Name_right'+extension).text(rows[index].Name);
        $('#Artist_right'+extension).text(rows[index].Artist);
        $('#Likes_right'+extension).text(rows[index].Likes);
        $('#Dislikes_right'+extension).text(rows[index].Dislikes);
        $('#Views_right'+extension).text(rows[index].Views);
        $('#Comments_right' + extension).text(rows[index].Comments);
        $('#Date_right'+extension).text(rows[index].DatePublished);
    }
    changePicRight();
    changeIconRight();
    selectedItems[2] = rows[index].Identifier + '.csv';
    selectedItems[3] = rows[index].Name;
    fetchRows(1, '#line_graph_2', selectedItems[2]);
    fetchRowsFromTwoFiles(2, '#line_graph_merged', selectedItems[1], selectedItems[3]);
}
//Matches the names selected to get the correct data
function matchRight(element){
    var selectCtrl = document.getElementById("file_type_right");
    var selectedItem = selectCtrl.options[selectCtrl.selectedIndex];
    return element.Name == selectedItem.text
}


//Changes the icon for google trends or youtube
function changeIconRight() {
    var selectCtrl = document.getElementById("trend_type_right");
    var selectedItem = selectCtrl.options[selectCtrl.selectedIndex];
    var name = selectedItem.value;
    if(name=="Google"){
        $('#Symbol_right').attr("src","img/google-icon-2.png");
        $('#Symbol_right').height(40);
        $('#Symbol_right').width(40);
        $('#WritingYoutube_right').hide();
        $('#WritingGoogle_right').show();

    }else{
        $('#Symbol_right').attr("src","img/youtubeLegendIcon.png");
        $('#Symbol_right').height(40);
        $('#Symbol_right').width(60);
        $('#WritingGoogle_right').hide();
        $('#WritingYoutube_right').show();
    }

}
//Changes the picture of the video
function changePicRight() {
    var selectCtrl = document.getElementById("file_type_right");
    var selectedItem = selectCtrl.options[selectCtrl.selectedIndex];
    var name = selectedItem.value;
    var link = getLink(name);
    $('#Icon_right'+extension).attr('src','https://www.youtube.com/embed/'+link+'?autoplay=0');
}

function getLink(name){
  if(name == "GangnamStyle"){
    return "9bZkp7q19f0";
  }if(name == "BlankSpace"){
    return "e-ORhEE9VVg";
  }if(name == "SeeYouAgain"){
    return "RgKAFK5djSk";
  }if(name == "UptownFunk"){
    return "OPf0YbXqDm0";
  }
}
