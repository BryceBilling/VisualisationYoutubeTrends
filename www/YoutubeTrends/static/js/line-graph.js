/**
 * Line graph showing global google search, youtube search and comment trends over a set period
 */

var chart = [null, null, null];
var colors = ['#1F77B4', '#EF5656', '#EF5656'];
var isMerged = false;
var legendGenerated = [false, false];
var currentWeek = 1;
var data_rows = [null, null, null];

function fetchRows(index, bindDom, dataFileName) {
    d3.csv("data/" + dataFileName, function (rows) {
        var dataset = rows.map(function (d) {
            return [+d["google"], +d["youtube"], +d["youtubeComments"]];
        });
        dataset.unshift(["google", "youtube", "youtubeComments"])
        generate_line_graph(index, bindDom, dataset)
    });
}

function fetchRowsFromTwoFiles(index, bindDom, displayNameOne, displayNameTwo) {
    if (data_rows[0] != null && data_rows[1] != null) {
        String.prototype.capitalize = function () {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
        var colorPatternOne = ['#7a0177', '#c51b8a', '#ce1256'];
        var colorPatternTwo = ['#014636', '#02818a', '#3690c0'];
        var datasetOne = data_rows[0];
        var datasetTwo = data_rows[1];
        var dataset = new Array(datasetOne.length);
        var header_one = new Array(datasetOne[0].length);
        var header_two = new Array(datasetTwo[0].length);
        for (var i = 0; i < data_rows[0][0].length; ++i) {
            header_one[i] = displayNameOne + " " + locations[0] + " " + data_rows[0][0][i].capitalize();
        }
        for (var i = 0; i < data_rows[1][0].length; ++i) {
            header_two[i] = displayNameTwo + " " + locations[1] + " " + data_rows[1][0][i].capitalize();
        }
        dataset[0] = header_one.concat(header_two);
        for (var i = 1; i < datasetOne.length; ++i) {
            dataset[i] = datasetOne[i].concat(datasetTwo[i]);
        }

        generate_line_graph(index, bindDom, dataset);
        var map = chart[index].data.colors();
        for (var i = 0; i < header_one.length; ++i) {
            map[header_one[i]] = colorPatternOne[i];
        }
        for (var i = 0; i < header_two.length; ++i) {
            map[header_two[i]] = colorPatternTwo[i];
        }
        chart[index].data.colors(map);

        // Set the styling on each pair of lines
        // Set a timeout because data is loaded asynchronously and stroke needs to be set after the data is loaded
        setTimeout(function () {
            // Set Colors
            var googleLines = $('path[class*="c3-line-"][class$="-Google"]');
            for (var i = 0; i < googleLines.length; ++i) {
                googleLines[i].style.strokeDasharray = "5, 5, 5, 5, 5, 5, 10, 5, 10, 5, 10, 5";
                googleLines[i].style.strokeWidth = "2px";
            }

            var youtubeLines = $('path[class*="c3-line-"][class$="-Youtube"]');
            for (var i = 0; i < youtubeLines.length; ++i) {
                youtubeLines[i].style.strokeDasharray = "1,1";
                youtubeLines[i].style.strokeWidth = "4px";
            }

            var youtubeCommentsLines = $('path[class*="c3-line-"][class$="-Youtube-Comments"]');
            for (var i = 0; i < youtubeCommentsLines.length; ++i) {
                youtubeCommentsLines[i].style.strokeDasharray = "";
                youtubeCommentsLines[i].style.strokeWidth = "1px";
            }

            if (chart[index] != null) {

            }
        }, 500);
    }
}

function generate_line_graph(index, bindDom, rows) {
    data_rows[index] = rows;
    if (chart[index] != null) {
        var loadRows = [null, null, null];
        var unloadRows = [null, null, null];
        if (rows[2][0] == null) {
            unloadRows[0] = "google";
        } else {
            loadRows[0] = "google";
        }
        if (rows[2][1] == null) {
            unloadRows[1] = "youtube";
        } else {
            loadRows[1] = "youtube";
        }
        if (rows[0].length == 2) {
            unloadRows[2] = "youtubeComments";
        } else {
            loadRows[2] = "youtubeComments";
        }
        if (index == 2) {
            unloadRows = chart[index].columns;
            loadRows = [];
            for(var i = 0; i < rows[0].length; ++i) {
                if(rows[2][i] != null) {
                    loadRows.push(rows[0][i]);
                }
            }
        }
        chart[index].load(
            {
                rows: rows,
                unload: unloadRows
            });

        $(bindDom + "_legend").empty();

        d3.select(bindDom + '_legend').insert('div').attr('class', 'legend').selectAll('span')
            .data(loadRows)
            .enter().append('span')
            .attr('data-id', function (id) {
                return id;
            })
            .html(function (id) {
                if (index == 2) {
                    if (id.indexOf(selectedItems[1]) > -1) {
                        if (id.indexOf("Google") > -1) {
                            return '<img  src="img/google-icon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else if (id.indexOf("YoutubeComments") > -1) {
                            return '<img src="img/comment-icon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else if(id.indexOf("Youtube") > -1) {
                            return '<img src="img/youtubeLegendIcon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else {
                            return id;
                        }
                    } else {
                        if (id.indexOf("Google") > -1) {
                            return '<img  src="img/google-icon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else if (id.indexOf("YoutubeComments") > -1) {
                            return '<img src="img/comment-icon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else if(id.indexOf("Youtube") > -1) {
                            return '<img src="img/youtubeLegendIcon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                        } else {
                            return id;
                        }
                    }

                } else {
                    if (id == 'google') {
                        return '<img  src="img/google-icon-2.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Google';
                    } else if (id == 'youtube') {
                        return '<img src="img/youtubeLegendIcon.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Youtube';
                    } else if (id == 'youtubeComments') {
                        return '<img src="img/comment-icon.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Youtube Comments';
                    } else {
                        return id;
                    }
                }
            })
            .each(function (id) {
                //d3.select(this).style('background-color', chart.color(id));
            })
            .on('mouseover', function (id) {
                chart[index].focus(id);
            })
            .on('mouseout', function (id) {
                chart[index].revert();
            })
            .on('click', function (id) {
                chart[index].toggle(id);
                if (d3.select(this).style()[0][0].style.opacity == null || d3.select(this).style()[0][0].style.opacity == '' || d3.select(this).style()[0][0].style.opacity == 1) {
                    d3.select(this).style({opacity: 0.5});
                    chart[index].revert();
                } else {
                    d3.select(this).style({opacity: 1});
                    chart[index].focus(id);
                }
            });
    } else {
        var transitionDuration = 1000;
        // Check if firefox then set transition to 0 due to performance isses
        if(typeof InstallTrigger !== 'undefined') {
            transitionDuration = 0;
        }

        chart[index] = c3.generate({
            bindto: bindDom,
            data: {
                rows: rows,
                colors: {
                    google: '#1F77B4',
                    youtube: '#EF5656',
                    youtubeComments: '#2CA02C'
                },
                names: {
                    google: 'Google',
                    youtube: 'Youtube',
                    youtubeComments: 'Youtube Comments'
                }
            },
            transition: {
                duration: transitionDuration
            },
            color: {
                pattern: ['#7a0177', '#c51b8a', '#ce1256', '#014636', '#02818a', '#3690c0']
            },
            axis: {
                x: {
                    max: 52,
                    min: 1,
                    padding: {top: 0, bottom: 0},
                    tick: {
                        culling: {
                            max: 24
                        }
                    },
                    label: {
                        text: 'Weeks from release',
                        position: 'outer-center'
                    }
                },
                y: {
                    max: 100,
                    min: 0,
                    padding: {top: 20, bottom: 0},
                    label: {
                        text: 'Popularity Index (%)',
                        position: 'outer-middle'
                    }
                }
            },
            grid: {
                x: {
                    lines: [
                        {value: 1},
                    ]
                }
            },
            zoom: {
                enabled: true
            },
            tooltip: {
                format: {
                    title: function (d) {
                        return 'Week ' + d + ' From Release';
                    },
                    value: function (value, ratio, id) {
                        return value + "%";
                    }
                }
            },
            legend: {
                show: false
            }
        });

        // Add a custom legend
        if (!legendGenerated[index]) {
            var data_labels = ['google', 'youtube', 'youtubeComments'];
            if (index == 2) {
                data_labels = rows[0];
            }
            d3.select(bindDom + '_legend').insert('div').attr('class', 'legend').selectAll('span')
                .data(data_labels)
                .enter().append('span')
                .attr('data-id', function (id) {
                    return id;
                })
                .html(function (id) {
                    if (index == 2) {
                        if (id.indexOf(selectedItems[1]) > -1) {
                            if (id.indexOf("Google") > -1) {
                                return '<img  src="img/google-icon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            } else if (id.indexOf("YoutubeComments") > -1) {
                                return '<img src="img/comment-icon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            } else {
                                return '<img src="img/youtubeLegendIcon-left.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            }
                        } else {
                            if (id.indexOf("Google") > -1) {
                                return '<img  src="img/google-icon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            } else if (id.indexOf("YoutubeComments") > -1) {
                                return '<img src="img/comment-icon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            } else {
                                return '<img src="img/youtubeLegendIcon-right.png" alt="Like" style="width:18px;height:18px;vertical-align: bottom;"> ' + id;
                            }
                        }

                    } else {
                        if (id == 'google') {
                            return '<img  src="img/google-icon-2.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Google';
                        } else if (id == 'youtube') {
                            return '<img src="img/youtubeLegendIcon.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Youtube';
                        } else if (id == 'youtubeComments') {
                            return '<img src="img/comment-icon.png" alt="Like" style="width:20px;height:20px;vertical-align: bottom;"> Youtube Comments';
                        } else {
                            return id;
                        }
                    }
                })
                .each(function (id) {
                    //d3.select(this).style('background-color', chart.color(id));
                })
                .on('mouseover', function (id) {
                    chart[index].focus(id);
                })
                .on('mouseout', function (id) {
                    chart[index].revert();
                })
                .on('click', function (id) {
                    chart[index].toggle(id);
                    if (d3.select(this).style()[0][0].style.opacity == null || d3.select(this).style()[0][0].style.opacity == '' || d3.select(this).style()[0][0].style.opacity == 1) {
                        d3.select(this).style({opacity: 0.5});
                        chart[index].revert();
                    } else {
                        d3.select(this).style({opacity: 1});
                        chart[index].focus(id);
                    }
                });
            legendGenerated[index] = true;
        }

        setAxisGrid(currentWeek);
    }
}

function setAxisGrid(value) {
    currentWeek = value;
    for (var i = 0; i < chart.length; ++i) {
        if (chart[i] != null) {
            //Update value
            chart[i].xgrids([{value: value}]);
        }
    }
}

function mergeClick() {
    if (isMerged) {
        $("#merge").text("Merge Graph");
        $("#merge_container").hide();
        $("#left_container").show();
        chart[0].flush();
        $("#right_container").show();
        chart[1].flush();

        // A delayed flush just to catch any outlier cases
        setTimeout(function(){
            chart[0].flush();
            chart[1].flush();
        }, 300);

    } else {
        $("#merge").text("Un-merge Graph");
        $("#left_container").hide();
        $("#right_container").hide();
        $("#merge_container").show();
        chart[2].flush();

        // A delayed flush just to catch any outlier cases
        setTimeout(function(){
            chart[2].flush();
        }, 300);

    }
    isMerged = !isMerged;
}

function resetGraphs() {
    fetchRows(0, '#line_graph_1', selectedItems[0]);
    $("#line_graph_1_header").text("Global Trends");
    fetchRows(1, '#line_graph_2', selectedItems[2]);
    $("#line_graph_2_header").text("Global Trends");
    setTimeout(function () {
        locations[0] = "Global";
        locations[1] = "Global";
        $("#line_graph_merge_subheader").text(selectedItems[1] + " Global" + " vs " + selectedItems[3] + " Global");
        fetchRowsFromTwoFiles(2, '#line_graph_merged', selectedItems[1], selectedItems[3]);
    }, 500);
}