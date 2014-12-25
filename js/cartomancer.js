$(document).ready(function() {
    $("#map").css({
//        height: $(document).innerHeight() - 20,
//        position: "initial !important"
    });


    var cartograph = new Map({
        "mapOptions": {
            "maxZoom": config["start-screen-zoom-limits"]["max"],
            "minZoom": config["start-screen-zoom-limits"]["min"]
        }
    });
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
    function navigationColumnOptions(config) {
        return {
            title: "<h1>" + config["navbar"]["title"] + "</h1>",
            tabgroup: {
                attributes: {
                },
                eventHandlers: {
                    click: function(e, eventOptions) {
                        //if (floatingPageWidget) {
                        var floatingPageWidget = $("body").find(".sidebar-float.panel-document");
                        if (floatingPageWidget.length) {
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
                                            attributes: {
                                                class: "panel-control-button"
                                            },
                                            eventHandlers: {
                                                click: function(e, eventOptions) {
//                                                $(this).closest(".panel-document").remove();
//                                                eventOptions.target=null;
                                                    $(eventOptions.target).remove();
                                                }
                                            },
                                            eventOptions: {
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
                                            attributes: {
                                                class: "panel-control-button"
                                            },
                                            eventHandlers: {
                                                click: function(e, eventOptions) {
                                                    $(this).closest(".panel-document").children().remove();
//                                                eventOptions.target=null;
                                                    //$(eventOptions.target).remove();
                                                }
                                            },
                                            eventOptions: {
                                                target: floatingPageWidget
                                            },
                                            content: "<div class='panel-control-icon'>X</div>"
                                        });
                                    }
                                },
                                class: "sidebar-float"
                            })).getDocument();

                            floatingPageWidget.appendTo("body");
                        }
                    }
                },
                tabs: config["navbar"]["tabs"]
            },
            //footer: "<a class='ui-button-download-data'><div>Download as CSV</div></a>",
            eventOptions: {
                //contentDef: mainNavContentDef
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
    }

    (new UI_Navigation(new navigationColumnOptions(config))).done(function(uiObject) {
        uiObject.getUI().appendTo("body");
    });
    /*$("<div class='col-plug'>").appendTo($("#extension-box").find(".ui-button-column-toggle"));*/

    var locationsLayerGroup;
    var farmlandLayerGroup;

    function createLocationSummarySmallWidget(options) {
        (new UI_SummarySmallWidget(options)).appendTo(".leaflet-right.leaflet-bottom");
    }

    function removeLocationSummarySmallWidget(options) {
        $(".leaflet-right.leaflet-bottom .widget-small").remove();
    }

    function placeLocationMarkers(data, params) {
        locationsLayerGroup = L.geoJson(data, {
            onEachFeature: function(feature, layer) {

            },
            pointToLayer: function(feature, latlng) {
                var marker = L.marker(latlng, {
                    icon: L.divIcon({
                        className: "icon-location-marker"
                    })
                });
                return marker;
            }
        }).addTo(map);

        locationsLayerGroup["visibility"] = {
            "max-zoom": config["start-screen-zoom-limits"]["max"],
            "min-zoom": config["start-screen-zoom-limits"]["min"]
        };

        $.map(locationsLayerGroup._layers, function(layer, index) {
            setTimeout(function() {
                $(layer._icon).append(new UI_ReactiveMarker({
                    "img-src": layer.feature.properties.getAttributes()["location-picture"],
                    "label": new UI_Button({
                        attributes: {
                        },
                        eventHandlers: {
                            click: function(e) {
                                if (map.getZoom() > config["start-screen-zoom-limits"]["max"] || map.getZoom() < config["start-screen-zoom-limits"]["min"])
                                    return;

                                config["navbar"]["tabs"].push(layer.feature.properties.getAttributes().name);
                                config["main-headings"].map(function(item, index) {
                                    config["navbar"]["tabs"].push(item);
                                });

                                map.options.maxZoom = 19;

                                map.setView(layer._latlng, config["start-screen-zoom-limits"]["max"] + 1, {
                                    animate: true
                                });

                                (new UI_Navigation(new navigationColumnOptions(config))).done(function(uiObject) {
                                    $(".ui-navigation.sidebar").html(uiObject.getUI().children());
                                });

                                createLocationSummarySmallWidget({
                                    contentDeferred: mapData.fetchData({
                                        "query": {
                                            url: config["api"]["location-summary-base-url"] + layer.feature.properties.getAttributes().name.toLowerCase().replace(/ /g, "_") + ".json"
                                                    //url: "about_khetibali.json"
                                        },
                                        "query-type": "widget-query",
                                        "widget": "location-summary",
                                        "group": layer.feature.properties.getAttributes().name,
                                        titleBar: {
                                            title: "Major crops in " + layer.feature.properties.getAttributes().name
                                        }
                                    })
                                });

                                var modelQueryFarmland = mapData.fetchData({
                                    query: {
                                        geometries: {
                                            type: "polygons",
                                            group: layer.feature.properties.getAttributes().name
                                        },
                                        url: "farmdata/" + layer.feature.properties.getAttributes().name.toLowerCase().replace(/ /g, "_") + ".geojson"
                                    },
                                    returnDataMeta: {
                                        "type": "food_secutiry_osm_geojson"
                                    }
                                });

                                modelQueryFarmland.done(function(data, params) {
                                    farmlandLayerGroup = L.geoJson(data, {
                                        onEachFeature: function(feature, layer) {
                                            layer._cartomancerStyleIndex = 0;
                                            layer.setStyle(config["layer-styles"]["map-features"][feature.properties.getAttributes()["farming_system"]]);
                                            layer.bindPopup("");
                                            /*console.log(Boolean(feature.properties.getAttributes().cropData));
                                            if (Boolean(feature.properties.getAttributes().cropData)) {
                                                new UI_PiechartGallery({
                                                    charts: feature.properties.getAttributes().cropData
                                                });
                                            }*/
                                            layer.on("popupopen", function(e){
                                                new UI_PiechartGallery({
                                                    charts: feature.properties.getAttributes().cropData,
                                                    container: this._popup._contentNode
                                                });
                                            });
                                        }
                                    }).addTo(map);
                                });
                            }
                        },
                        content: "<span>Go to <b>" + layer.feature.properties.getAttributes().name + "</b></span>"
                    })
                }));
            });
        });

    }

    var modelQueryLocations = mapData.fetchData({
        query: {
            geometries: {
                type: "points",
                group: "locations.geojson"
            },
            url: "locations.geojson"
        },
        returnDataMeta: {
        }
    });

    modelQueryLocations.done(function(data, params) {
        placeLocationMarkers(data, params);
    });

    map.on("zoomend", function(e) {
        var context = this;
        setTimeout(function() {
            if (context.getZoom() <= locationsLayerGroup.visibility["max-zoom"] && context.getZoom() >= locationsLayerGroup.visibility["min-zoom"]) {
//                console.log(config["navbar"]["tabs"].length);
                if (Boolean(config["navbar"]["tabs"].length - 1)) {
//                    console.log("ok");
                    config["main-headings"].map(function(item, index) {

                        config["navbar"]["tabs"].pop();
                    });

                    config["navbar"]["tabs"].pop();

                    (new UI_Navigation(new navigationColumnOptions(config))).done(function(uiObject) {
                        $(".ui-navigation.sidebar").remove();
                        //$(".ui-navigation.sidebar").html(uiObject.getUI().children());
                        uiObject.getUI().appendTo("body");
                    });

                    removeLocationSummarySmallWidget();



                }
                $(".icon-location-marker").show();
                map.options.maxZoom = config["start-screen-zoom-limits"]["max"];
            } else {

                $(".icon-location-marker").hide();
            }
        }, 0);
    });

});
$.fn.attrByFunction = function(fn) {
    return $(this).each(function() {
        $(this).attr(fn.call(this));
    });
};
