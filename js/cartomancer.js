$(document).ready(function() {
    $("#map").css({
//        height: $(document).innerHeight() - 20,
//        position: "initial !important"
    });

    var cartographOptions = {
        "mapOptions": {
            "maxZoom": config["start-screen-zoom-limits"]["max"],
            "minZoom": config["start-screen-zoom-limits"]["min"],
            "zoom": Math.floor(config["map-options"]["init-zoom"])
        }
    };

    var cartograph = new Map(cartographOptions);
    $("#map").find("a.leaflet-control-zoom-out").text("–");
    var map = cartograph.getMap();
    map.initBounds = L.latLngBounds(map.getBounds());





    /*var overviewMap = new UI_OverviewMap({
     map: map,
     zoom: 5,
     "ui-dom-id": "ui-overview-map",
     "ui-container-class": "ui-container-overview-map",
     "ui-map-box-class": "ui-overview-map-box",
     basemap: L.tileLayer(config["basemap-servers"][1]+'/{z}/{x}/{y}.png', {
     //attribution: 'Map data and tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright/">Read the Licence here</a> | Cartography &copy; <a href="http://kathmandulivinglabs.org">Kathmandu Living Labs</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
     maxZoom: 5,
     minZoom: 5
     }),
     "ui-control-map": false,
     /*"overlays": function() {
     var areaboundary = $.extend(true, {}, data);
     //areaboundary.features[0].geometry.coordinates.reverse().pop();
     //console.log(areaboundary);
     return [L.geoJson(areaboundary)];
     }()*\/
     "ui-controls":[
     {
     class: "ui-map-navigation",
     uiDOM: function(){
     var container = $("<div></div>");
     container.append($("<div></div>").addClass("current-location"));
     container.append($("<div></div>").addClass("controls"));
     return container;
     }()
     }
     ]
     });
     
     $("#mapBox").append(overviewMap.getUI());
     
     overviewMap.drawMap();
     
     $("#ui-overview-map").find(".leaflet-control-container").remove();*/

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

    var legendLayerGroups = {
        "khet": L.layerGroup(),
        "bari": L.layerGroup()
    };
    
    var layerSwitcherLegend = new UI_LayerSwitcherLegend({
        layerGroups: legendLayerGroups,
        map: map,
        layerControlOptions: {
            collapsed: false
        }
    });

    mapGlobals.legendLayerGroups = legendLayerGroups;


    //var floatingPageWidget = null;
    function navigationColumnOptions(config) {
        return {
            title: "<h1>" + config["navbar"]["title"] + "</h1>",
            tabgroup: {
                attributes: {
                },
                eventHandlers: {
                    click: function(e, eventOptions) {

                        $(".ui-navigation.sidebar").find(".ui-navigation-group a").removeClass("active");

                        $(this).addClass("active");
                        var navTab = $(this);

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
                                                    $(eventOptions.floatingPageWidget).remove();
                                                    $(eventOptions.navigationBarTab).removeClass("active");

                                                }
                                            },
                                            eventOptions: {
                                                floatingPageWidget: floatingPageWidget,
                                                navigationBarTab: navTab
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
                                                    //$(eventOptions.floatingPageWidget).remove();
                                                    $(eventOptions.navigationBarTab).removeClass("active");
//                                                eventOptions.target=null;
                                                    //$(eventOptions.target).remove();
                                                }
                                            },
                                            eventOptions: {
                                                floatingPageWidget: floatingPageWidget,
                                                navigationBarTab: navTab
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
                    var closeButton = new UI_Button({
                        attributes: {
                            class: "ui-sidebar-toggle"
                        },
                        eventHandlers: {
                        },
                        content: "<span>X</span>"
                    });
                    var backButton = new UI_Button({
                        attributes: {
                            class: "ui-map-view-reset panel-control-button"
                        },
                        eventHandlers: {
                            click: function(e, eventOptions) {
                                eventOptions.map.removeLayer(farmlandLayerGroup);
                                eventOptions.map.options.minZoom = config["start-screen-zoom-limits"]["min"];
                                eventOptions.map.fitBounds(eventOptions.map.initBounds);
                                eventOptions.map.options.maxZoom = config["start-screen-zoom-limits"]["max"];
                                layerSwitcherLegend.uiElement.hide();
                                $(this).addClass("inactive");
                            }
                        },
                        eventOptions: {
                            map: map
                        },
                        content: "<div><span>Click here to go back to start</span></div>"
                    });

                    return closeButton.add(backButton);
                });
            }(),
            class: "sidebar left"
        };
    }

    (new UI_Navigation(new navigationColumnOptions(config))).done(function(uiObject) {
        uiObject.getUI().appendTo("body");
        layerSwitcherLegend.uiElement.hide();
        $("a.ui-map-view-reset").addClass("inactive");
    });
    /*$("<div class='col-plug'>").appendTo($("#extension-box").find(".ui-button-column-toggle"));*/

    var locationsLayerGroup;
    var farmlandLayerGroup;

    function createLocationSummarySmallWidget(options) {
        var locationCropSummaryWidget = new UI_SummarySmallWidget(options);
        locationCropSummaryWidget.appendTo(".leaflet-right.leaflet-bottom");

        locationCropSummaryWidget.on("click", function(e) {
            var pictureBox = $(e.target).closest(".picturebox");
            pictureBox.toggleClass("highlightMapFeatures");
            var highlightLayer = pictureBox.attr("class").split(" ")[1];
            setTimeout(function() {
                $.map(farmlandLayerGroup._layers, function(layer, index) {

                    if (!layer.feature.properties.getAttributes().crop)
                        return;

                    if (((layer.feature.properties.getAttributes().crop).toLowerCase().indexOf(highlightLayer) + 1)) {
                        //console.log((layer.feature.properties.getAttributes().crop).indexOf(highlightLayer));
                        if (pictureBox.hasClass("highlightMapFeatures")) {
                            layer.setStyle(config["layer-styles"]["map-features"][highlightLayer]);

                        } else {
                            layer.setStyle(config["layer-styles"]["map-features"][layer.feature.properties.getAttributes().farming_system]);
                        }
                    } else {
                        layer.setStyle(config["layer-styles"]["map-features"][layer.feature.properties.getAttributes().farming_system]);
                    }
                });
            }, 0);
        });
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
                                map.options.minZoom = config["start-screen-zoom-limits"]["max"] + 1;

                                map.setView(layer._latlng, config["start-screen-zoom-limits"]["max"] + 1, {
                                    animate: true
                                });

                                (new UI_Navigation(new navigationColumnOptions(config))).done(function(uiObject) {
                                    //$(".ui-navigation.sidebar").html(uiObject.getUI().children());
                                    $(".ui-navigation.sidebar").find(".ui-navigation-group a").remove();
                                    $(".ui-navigation.sidebar").find(".ui-navigation-group").append(uiObject.getUI({
                                        componentSelector: ".ui-navigation-group a"
                                    }));
                                });

                                createLocationSummarySmallWidget({
                                    contentDeferred: mapData.fetchData({
                                        "query": {
                                            url: config["api"]["location-summary-base-url"] + layer.feature.properties.getAttributes().name.toLowerCase().replace(/ /g, "_") + ".json"
                                                    //url: "about_khetibali.json"
                                        },
                                        "query-type": "widget-query",
                                        "widget": "location-summary",
                                        "group": layer.feature.properties.getAttributes().name
                                    }),
                                    titleBar: {
                                        title: "Major crops in " + layer.feature.properties.getAttributes().name
                                    }
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
                                            layer.on("popupopen", function(e) {
                                                if ($(this._popup._contentNode).find("svg").length)
                                                    return;
                                                new UI_PiechartGallery({
                                                    charts: feature.properties.getAttributes().cropData,
                                                    container: this._popup._contentNode,
                                                    //"label-position": [0,-120]
                                                });

                                                console.log($(this._popup._contentNode).find("text"));



                                                $(this._popup._contentNode).prepend(function() {
                                                    var infoBox = $("<div></div>").addClass("farmland-infobox");
                                                    infoBox.append("<h3>Farmland</h3>");
                                                    infoBox.append($("<div class='label'></div>").text(feature.properties.getAttributes().farmland_type === "khet" ? "Irrigated" : "Unirrigated"));
                                                    infoBox.append("<div class='instruction'>These piecharts show the percentage by area of crops planted in this farmland. Click on a preview below to view larger chart.</div>")
                                                    return infoBox;
                                                });
                                            });

                                            
                                            try {
                                                legendLayerGroups[feature.properties.getAttributes()["farming_system"]].addLayer(layer);
                                            } catch (e) {
                                                console.log("farming_system not defined for " + feature.properties.getAttributes()["id"]);
                                            }

                                        }
                                    }).addTo(map);



                                });
                                
                                layerSwitcherLegend.uiElement.show();

                                $("a.ui-map-view-reset").removeClass("inactive");
                            }
                        },
                        content: "<div>Go to <b>" + layer.feature.properties.getAttributes().name + "</b></div>"
                    }),
                    class: "ui-reactive-marker"
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
                        //$(".ui-navigation.sidebar").remove();
                        //$(".ui-navigation.sidebar").html(uiObject.getUI().children());
                        //uiObject.getUI().appendTo("body");

                        //uiObject.getUI().appendTo($(".ui-navigation.sidebar").find(".ui-navigation-group"));
                        $(".ui-navigation.sidebar").find(".ui-navigation-group a").remove();
                        $(".ui-navigation.sidebar").find(".ui-navigation-group").append(uiObject.getUI({
                            componentSelector: ".ui-navigation-group a"
                        }));
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

//    if (cartographOptions["mapOptions"]["zoom"] !== config["map-options"]["init-zoom"]) {
//        setTimeout(function() {
//            map.setZoom(config["map-options"]["init-zoom"]);
//        }, 10000);
//    }

});
$.fn.attrByFunction = function(fn) {
    return $(this).each(function() {
        $(this).attr(fn.call(this));
    });
};
