$(document).ready(function() {
    $("#map").css({
//        height: $(document).innerHeight() - 20,
//        position: "initial !important"
    });


    var cartograph = new Map();
    $("#map").find("a.leaflet-control-zoom-out").text("–");
    var map = cartograph.getMap();

    //console.log(map.getPanes().tilePane);
    //$(map.getPanes().tilePane).addClass("grayscale");

    map.on("baselayerchange", function(layer) {
        $(map.getPanes().tilePane).toggleClass("grayscale", layer.name === "OpenStreetMap Grayscale");
    });

    var popup = new Popup();
    mapGlobals = {
        map: map
    };


    /*var osmWays = L.geoJson(null, {
     onEachFeature: function(feature, layer) {
     setTimeout(function() {
     layer._container.setAttribute("title", "This is a " + feature.geometry.type.replace("String", "") + " feature. Click to have a look at some of its attributes.");
     
     layer.setStyle(feature.geometry.type === "Polygon" ? Styles.polygonStyle : Styles.lineStyle);
     layer.on("click", function(e) {
     popup.setLatLng(e.latlng);
     popup.openOn(map);
     popup.setContent(new TableContent(feature.properties, true));
     popup.update();
     });
     }, 0);
     },
     className: "vector-layer"
     }).addTo(map);*/


    var mapData = new Data();

    mapGlobals.mapData = mapData;



    //var floatingPageWidget = null;

    var navigationColumnOptions = {
        title: "<h1>" + config["navbar"]["title"] + "</h1>",
        tabgroup: {
            attributes: {
            },
            eventHandlers: {
                click: function(e, eventOptions) {
                    //if (floatingPageWidget) {
                    var floatingPageWidget = $("body").find(".panel-document");
                    if(floatingPageWidget.length){
                        var floatingPageWidgetContents = (new UI_PanelDocumentSinglePage({
                            contentDeferred: mapData.fetchData({
                                "query": {
                                    url: eventOptions.tabName.toLowerCase().replace(/ /g, "_") + ".json"
                                            //url: "about_khetibali.json"
                                },
                                "query-type": "widget-query",
                                "widget": "navigation",
                                "group": eventOptions.tabName
                            }),
                            titleBar: {
                                controls: function() {
                                    return new UI_Button({
                                        attributes:{
                                            class: "panel-control-button"
                                        },
                                        eventHandlers:{
                                            click: function(e, eventOptions){
//                                                $(this).closest(".panel-document").remove();
//                                                eventOptions.target=null;
                                                  $(eventOptions.target).remove();
                                            }
                                        },
                                        eventOptions:{
                                            target: floatingPageWidget
                                        },
                                        content: "<div class='panel-control-icon'>X</div>"
                                    });
                                }
                            }
                        })).getDocument().children();
                        floatingPageWidget.children().remove();
                        floatingPageWidget.append($(floatingPageWidgetContents));
                    } else {
                        floatingPageWidget = (new UI_PanelDocumentSinglePage({
                            contentDeferred: mapData.fetchData({
                                "query": {
                                    url: eventOptions.tabName.toLowerCase().replace(/ /g, "_") + ".json"
                                            //url: "about_khetibali.json"
                                },
                                "query-type": "widget-query",
                                "widget": "navigation",
                                "group": eventOptions.tabName
                            }),
                            titleBar: {
                                controls: function() {
                                    return new UI_Button({
                                        attributes:{
                                            class: "panel-control-button"
                                        },
                                        eventHandlers:{
                                            click: function(e, eventOptions){
                                                $(this).closest(".panel-document").children().remove();
//                                                eventOptions.target=null;
                                                  //$(eventOptions.target).remove();
                                            }
                                        },
                                        eventOptions:{
                                            target: floatingPageWidget
                                        },
                                        content: "<div class='panel-control-icon'>X</div>"
                                    });
                                }
                            }
                        })).getDocument();

                        floatingPageWidget.appendTo("body");
                    }
                }
            },
            tabs: config["navbar"]["tabs"]
        },
        //footer: "<a class='ui-button-download-data'><div>Download as CSV</div></a>",
        eventOptions: {
            contentDef: mainNavContentDef
        },
        controls: function() {
            return $("<div class='controls'></div>").append(function() {
                return new UI_Button({
                    attributes: {
                        class: "ui-sidebar-toggle"
                    },
                    eventHandlers: {
                    },
                    content: "<span>X</span>"
                });
            });
        }(),
        class: "sidebar left"
    };

    (new UI_Navigation(navigationColumnOptions)).done(function(uiObject) {
        uiObject.getUI().appendTo("body");
    });
    /*$("<div class='col-plug'>").appendTo($("#extension-box").find(".ui-button-column-toggle"));*/


});
$.fn.attrByFunction = function(fn) {
    return $(this).each(function() {
        $(this).attr(fn.call(this));
    });
};
