function Map(options) {

    var mapOptions = {
        center: config["map-options"]["center"],
        zoom: config["map-options"]["init-zoom"],
        minZoom: config["map-options"]["min-zoom"],
        doubleClickZoom: true,
        zoomControl: false,
        attributionControl: false,
        inertia: true
    };

    if (options && options["mapOptions"]) {
        $.extend(mapOptions, options.mapOptions);
    }


    var map = L.map('map', mapOptions);


    function osmTiles() {
        return L.tileLayer(config["basemap-servers"][0] + '/{z}/{x}/{y}.png', {
            //attribution: 'Basemap data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors | Powered by <a href="http://kathmandulivinglabs.org">Kathmandu Living Labs <img class="klllogo" src="../images/klllogo.gif"/></a>'
            //,maxZoom: 19,
            //minZoom: 1
        });
    }

    var osmTileLayer = new osmTiles();


    //osmTileLayer.addTo(map);


//    L.control.attribution({
//        position: "bottomleft",
//        //prefix: false
//    }).addAttribution('Basemap data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors | Map by <a href="http://kathmandulivinglabs.org"><div class="logo"><img class="klllogo" src="images/klllogo.gif"/></div>Kathmandu Living Labs </a>').addTo(map);

    L.control.scale({
        position: "bottomleft"
    }).addTo(map);

    map.addLayer(osmTileLayer);

    var osmTileLayerClone = new osmTiles();
    //map.addLayer(kilnClusters);

    var baseMaps = {
        "OpenStreetMap": osmTileLayer,
        "OpenStreetMap Grayscale": osmTileLayerClone
                /* , "Other base layer 1": {_leaflet_id: "dummylayer1"},
                 "Other base layer 2..": {_leaflet_id: "dummylayer2"},
                 "...": {_leaflet_id: "dummylayer3"}*/
    };

    var overlayMaps = {
    };
    
    L.control.zoom({
        position: "topright"
    }).addTo(map);
    
    var layersControl = L.control.layers(baseMaps, overlayMaps, {
        position: "topright"
    }).addTo(map);
    //layersControl._layers.dummylayer1.layer;
    
    

    function _getTileLayer() {
        return osmTileLayer;
    }

    this.getTileLayer = function() {
        return _getTileLayer();
    }

    this.getMap = function() {
        return map;
    };
    this.getLayersControl = function() {
        return layersControl;
    };
}

function UI_OverviewMap(options) {

    function GeoJsonFromLatLngBounds(latLngBounds) {
        return {
            "type": "Feature",
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [latLngBounds.getEast(), latLngBounds.getNorth()],
                        [latLngBounds.getEast(), latLngBounds.getSouth()],
                        [latLngBounds.getWest(), latLngBounds.getSouth()],
                        [latLngBounds.getWest(), latLngBounds.getNorth()],
                        [latLngBounds.getEast(), latLngBounds.getNorth()]
                    ]
                ]
            }
        };
    }

    var map = null;

    var ui = $("<div>").append($("<div/>").append($("<div/>").attr("id", options["ui-dom-id"])).addClass(options["ui-map-box-class"])).addClass(options["ui-container-class"]);

    function _drawMap() {
        map = L.map(options["ui-dom-id"], {
            center: options.map.getCenter(),
            zoom: options.zoom,
            doubleClickZoom: false,
            dragging: false,
            zoomControl: false
        });

        var basemap;

        if (options.basemap)
            basemap = options.basemap;
        else
            basemap = L.tileLayer('http://104.131.69.181/osm/{z}/{x}/{y}.png', {
                //attribution: 'Map data and tiles &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://www.openstreetmap.org/copyright/">Read the Licence here</a> | Cartography &copy; <a href="http://kathmandulivinglabs.org">Kathmandu Living Labs</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>',
                maxZoom: 5,
                minZoom: 5
            });


        //map.addLayer(options.basemap);
        map.addLayer(basemap);
        if (options.overlays && options.overlays.length)
            options.overlays.map(function(overlay, index) {
                overlay.setStyle({
                    color: "#6666ff",
                    weight: 1,
                    opacity: 1,
                    fillColor: "#666666",
                    fillOpacity: 0.4
                });
                map.addLayer(overlay);
            });

        options.map.on("move", function() {
            setTimeout(function() {

                map.eachLayer(function(layer) {
                    if (layer.feature && layer.feature.redrawable) {
                        map.removeLayer(layer);
                    }
                });

                L.geoJson(new GeoJsonFromLatLngBounds(options.map.getBounds()), {
                    onEachFeature: function(feature, layer) {
                        feature.redrawable = true;
                        layer.setStyle(LayerStyles["inset-map-current-view"]);
                    }
                }).addTo(map);
            }, 0);
        });


        if (options["ui-control-map"]) {
            map.on("click", function(e) {
                options.map.panTo(e.latlng);
            });
        }
        if (options["ui-controls"]) {
            for (var c in options["ui-controls"]) {
                options["ui-controls"][c]["uiDOM"].addClass(options["ui-controls"][c]["class"]).appendTo(ui);
            }
        }

    }

    this.drawMap = function() {
        _drawMap();
    };

    function _getMap() {
        return map;
    }

    this.getMap = function() {
        return _getMap();
    };

    function _getUI() {
        return ui;
    }

    this.getUI = function() {
        return _getUI();
    };
}

function Cluster(features, options, map) {

    var clusteringOptions = {
        showCoverageOnHover: false,
        disableClusteringAtZoom: 18
    };

    if (options && options.clusteringOptions)
        $.extend(clusteringOptions, options.clusteringOptions);

    var clusterGroup = L.markerClusterGroup(clusteringOptions);
    var clustering = $.Deferred();

    function _getClusterGroup() {
        return clusterGroup;
    }

    this.getClusterGroup = function() {
        return _getClusterGroup();
    };

    setTimeout(function() {

        for (var point in features) {
            var pointAttributes = features[point].properties.getAttributes(features[point].properties._cartomancer_id);
            var marker = L.marker(L.latLng(features[point].geometry.coordinates[1], features[point].geometry.coordinates[0]), {
                icon: L.divIcon(Styles.iconStyle),
                riseOnHover: true,
                title: pointAttributes.name
            });

            marker.pointAttributes = $.extend(true, {}, pointAttributes);

            /*var titleBarJson = {
             "title": pointAttributes.name + ", " + pointAttributes.city,
             "slider": new UI_ThumbnailView({
             thumbUrls: function() {
             var srcs = [];
             for (var photo in pointAttributes.pictures) {
             srcs.push("data/media/photos/thumbs/" + pointAttributes.pictures[photo]["pictures/photo"]);
             }
             return srcs;
             }(),
             photoUrls: function() {
             var srcs = [];
             for (var photo in pointAttributes.pictures) {
             srcs.push("data/media/photos/" + pointAttributes.pictures[photo]["pictures/photo"]);
             }
             return srcs;
             }(),
             mediaOptions: {}
             }).createSlider()
             };
             
             var headerJson = {
             "Contact Person": pointAttributes.contact_person,
             "Contact Number": pointAttributes.contact_number
             //                ,"city": pointAttributes.city
             };
             
             var tabsJson = {
             triggers: {
             title: function() {
             
             }
             },
             tabs: [
             {
             title: "General Information",
             content: {
             Ownership: pointAttributes.ownership,
             "Bricks mainly Sold in": pointAttributes.market,
             "Operating Season": pointAttributes.market,
             "Days Open": pointAttributes.days_open
             }
             },
             {
             title: "Production: Input-Output",
             content: {
             "Fuel Quantity": pointAttributes.fuel_quantity,
             "Kind of Brick Produced": pointAttributes.brick_kind,
             Capacity: pointAttributes.capacity,
             "Raw Material": pointAttributes.raw_material,
             "Quality of Brick Produced": pointAttributes.brick_quality,
             Fuel: pointAttributes.fuel,
             "Brick Production": pointAttributes.brick_production
             }
             },
             {
             title: "Production: Technique",
             content: {
             "Moulding Process": pointAttributes.moulding_process,
             "Number of Chimneys": pointAttributes.chimney_numbers,
             "Chimney-height": pointAttributes.chimney_height,
             Firing: pointAttributes.firing,
             "Chimney category": pointAttributes.chimney_category
             }
             },
             {
             title: "Socio-economic",
             content: {
             "Children as Labourers": pointAttributes.labor_children,
             "Female Workers": pointAttributes.labor_female,
             "Male Workers": pointAttributes.labor_male,
             "Total number of Workers": pointAttributes.labor_total,
             "Young Labourers": pointAttributes.labor_young,
             "Elderly Labourers": pointAttributes.labor_old,
             "Laboureres currently Studying": pointAttributes.labor_currently_studing,
             "Workers with SLC": pointAttributes.labor_slc,
             "Workers with Informal Education": pointAttributes.labor_informal_edu,
             "Workers not Literate": pointAttributes.labor_illiterate,
             "Food Allowance": pointAttributes.food_allowance
             }
             }
             ]
             };
             
             var documentModel = {
             titleBar: {
             title: "Summary",
             cotrols: new CloseButton()
             }
             };*/

            var dom = new PanelDocumentModel(pointAttributes);

            var panelDocument = new PanelDocument(dom.documentModel);
            panelDocument.addToTitleBar(dom.titleBarJson);
            panelDocument.addHeader(dom.headerJson);
            panelDocument.addTabs(dom.tabsJson, PlugsForStyling.popup && PlugsForStyling.popup.body ? PlugsForStyling.popup.body : false);

            marker.bindPopup(panelDocument.getDocument(), {
                autoPan: true,
                keepInView: true,
                offset: L.point(0, -22)
            });

            marker.on("popupopen", function() {
                setTimeout(function() {
                    $("#map").find(".panel-document-header .header-row>div:last-child").each(function() {
                        if ($(this).outerHeight() > 56)
                            $(this).addClass("smaller-text");
                    });
                }, 0);
            });
            marker.addTo(clusterGroup);
        }
        clustering.resolve(clusterGroup);
    }, 0);

    return $.extend(this, clustering.promise());
}

function TableContent(jsonData, invert) {
    var content = $("<div></div>").addClass("table-content");
//        if (!jsonData.type) {
    for (var row in jsonData) {
        var tableRow = $("<div></div>")
                .addClass("table-row")
                .append(function() {
                    return jsonData[row] === "999" || jsonData[row] === "999.0" || !jsonData[row] ? $("<div></div>").text(row).append($("<div></div>").addClass("not-available").text("उपलब्ध छैन")) : $("<div></div>").text(row).append($("<div></div>").text(jsonData[row].replace(/_/g, " ")));
                });
        invert ? tableRow.prependTo(content).addClass(row.toLowerCase().replace(/ /g, "_")) : tableRow.appendTo(content).addClass(row.toLowerCase().replace(/ /g, "_"));
    }
    /*}else if(jsonData.type==="image"){
     for (var row in jsonData.data){
     var tableRow = $("<div></div>")
     .addClass("table-row")
     .append(function(){
     return $("<div></div>").append("<img src='"+row+"'/>")
     .add($("<div></div>").text(jsonData.data[row]));
     });
     invert ? tableRow.prependTo(content).addClass(row) : tableRow.appendTo(content).addClass(row);
     }
     }*/
    return content;
}

function Table(jsonData) {
    return $("<div></div>")
            .addClass("table container").addClass(jsonData.type)
            .append(new TableContent(jsonData.content));
}

function PanelDocument(documentModel) {
    var _panelDocument = document.createElement("div");

    var _title = $("<div/>").addClass("panel-document-title");
    var _slider = $("<div/>").addClass("panel-document-slider");
    var _controls = $("<div/>").addClass("panel-document-controls");

    var titleBarNode = document.createElement("div");

    var titleBar = documentModel.titleBar ? $(titleBarNode).append(function() {
        var returnArray = $(_title).add(_slider).add(_controls);
        /*returnArray.push(_title);
         returnArray.push(_slider);
         returnArray.push(_controls);*/
        return returnArray;
    }).addClass("titleBar panel-document-titleBar") : null;
    var _header = $("<div/>").addClass("panel-document-header");
    var _body = $("<div/>").addClass("panel-document-body");
    var _footer = $("<div/>").addClass("panel-document-footer");

//    var document_tabs = new Tabs();
//    var document_header = new Header();

    $(_panelDocument).attr({
        class: "panel float panel-document has-tabs"
    }).append(function() {
        var returnArray = $(titleBar).add(_header).add(_body).add(_footer);
        /*returnArray.push(titleBar);
         returnArray.push(_header);
         returnArray.push(_body);
         returnArray.push(_footer);*/
        return returnArray.addClass("panel-document-section");
    });

    function _addToTitleBar(titleBarJson) {
        setTimeout(function() {
            if (titleBarJson.title) {
                _title.text(function() {
                    return titleBarJson.title;
                });
            }
            if (titleBarJson.slider) {
                (titleBarJson.slider).appendTo(_slider);     //TODO: careful here
            }
            if (titleBarJson.controls) {
                _controls.append(function() {
                    return titleBarJson.controls;  //TODO: careful here
                });
            }
        }, 0);
    }

    function _addHeader(headerJson, extras) {
        new Header().createHeader(headerJson).appendTo(_header);
        if (extras) {
            if (extras["head-plug"])
                $(extras["head-plug"]).prependTo(_header);
            if (extras["tail-plug"])
                $(extras["tail-plug"]).appendTo(_header);
        }
    }

    function _addTabs(tabsJson, extras) {
        new Tabs().createTabs(tabsJson).appendTo(_body);
        if (extras) {
            if (extras["head-plug"])
                $(extras["head-plug"]).prependTo(_body);
            if (extras["tail-plug"])
                $(extras["tail-plug"]).appendTo(_body);
        }
    }

    this.addToTitleBar = function(titleBarJson) {
        _addToTitleBar(titleBarJson);
    };

    this.addHeader = function(headerJson, extras) {
        _addHeader(headerJson, extras);
    };

    this.addTabs = function(tabsJson, extras) {
        _addTabs(tabsJson, extras);
    };
    this.getDocument = function() {
        return _panelDocument;
    };
}

function Header() {
    function _createHeader(headerJson) {
        var _headerContent = $("<div/>");
        for (var row in headerJson) {
            _headerContent.append(function() {
                return $("<div/>").addClass("header-row panel-document-section-header").addClass(row.toLowerCase().replace(/ /g, "_")).append(function() {
                    return row === "name" ? "<div>" + headerJson[row] + "</div>" : "<div>" + row + ": </div>" + "<div>" + headerJson[row] + "</div>";
                });
            }());
        }
        return _headerContent.children();
    }
    this.createHeader = function(headerJson) {
        return _createHeader(headerJson);
    };
}

function Tabs() {
    function _createTabs(tabsJson) {
        var _tabs = $("<div/>");
        var _tab, _tabTrigger;
        for (var tab in tabsJson.tabs) {
            _tab = $("<div/>").addClass("panel-document-tab inactive");
            _tabTrigger = new UI_Button({
                attributes: {
                    class: "trigger tab-trigger " + tabsJson.tabs[tab].title,
                    title: tabsJson.tabs[tab].title.replace(/_/g, " ")
                },
                eventHandlers: {
                    click: function(e) {
                        $(this).switchToTab();
                    }
                }
            }).css({
                "z-index": tab + 1
            }).append($("<div class='label'/>").text(tabsJson.tabs[tab].title)).appendTo(_tab);

            var _page = $("<div/>").addClass("panel-document-page").append(function() {
                return new Table({
                    content: tabsJson.tabs[tab].content,
                    type: "cartomancer-popup-table"
                });
            }).addClass(tabsJson.tabs[tab].title.toLowerCase().replace(/:/g, "").replace(/ /g, "_"));

            _tabs.append(_tab);
            _tab.append(_page);
        }
        //$(_tabs.find(".panel-document-page")[0]).removeClass("inactive");
        $(_tabs.find(".panel-document-tab>a.tab-trigger")[0]).switchToTab();
        //console.log(_tabs.children())
        return _tabs.children();
    }
    this.createTabs = function(tabsJson) {
        return _createTabs(tabsJson);
    };
}


function UI_SlidingTabs(options) {
    var deferred = $.Deferred();
    setTimeout(function() {
        var uiElement = $("<div/>");
        options.attributes.class += " ui-sliding-tabs";
        uiElement.attr(options.attributes);

        for (var c in options.tabs) {
            var tab = $("<div/>");
            var content = $("<div class='content'/>");
            var tabTrigger = new UI_Button({
                attributes: {
                    class: "trigger"
                },
                eventHandlers: {
                    click: function(e) {
                        //if($(this).parent().hasClass("expanded")) return;


                        /*$(this).parent().addClass("expanded");
                         $(this).parent().siblings().removeClass("expanded");*/

                        //options["tabs-trigger-eventHandlers"]["click"].call(element, e);
                        //}, 0);

                    }
                },
                content: "<div>" + options.tabs[c].title + "</div>"
            });
            tabTrigger.appendTo(tab);
            $(options.tabs[c].content).appendTo(content);
            content.appendTo(tab);
            /*content.css({
             "height": "0px",
             "opacity": 0
             });*/
            tab.appendTo(uiElement);
        }

        deferred.resolve(uiElement);
    }, 0);
    return deferred;
}

/*
 function UI_SlidingTabs(options) {
 var deferred = $.Deferred();
 setTimeout(function() {
 var uiElement = $("<div/>");
 options.attributes.class += " ui-sliding-tabs";
 uiElement.attr(options.attributes);
 
 for (var c in options.tabs) {
 var tab = $("<div/>");
 var content = $("<div class='content'/>");
 var tabTrigger = new UI_Button({
 attributes: {
 class: "trigger"
 },
 eventHandlers: {
 click: function(e) {
 //if($(this).parent().hasClass("expanded")) return;
 var element = this;
 //setTimeout(function() {
 
 //$(element).parent().siblings().find("input").prop("checked", false);
 /*$(element).parent().siblings().find(".content").css({
 "height": "0px",
 "min-height": "0px",
 "opacity": 0
 });
 
 $(element).siblings(".content").css({
 "min-height": "80px",
 "opacity": 1,
 "height": "auto"
 }, function() {
 $(this).css("height", "auto");
 
 });*\/
 
 $(element).parent().siblings().find(".content").css({
 "display": "none"
 });
 
 $(element).siblings(".content").css({
 "display": "inline"
 });
 $(element).closest(".ui-sliding-tabs").find("label").css({
 "display":"block"
 });
 
 var checkbox = $(this).parent().find("input");
 
 /*if ($(this).parent().hasClass("expanded"))
 return;*\/
 $(this).parent().siblings().find("input").each(function(){
 if($(this)[0].checked) $(this).click();
 });
 checkbox.each(function(){
 if(!$(this)[0].checked)$(this).click();
 });
 
 /*$(this).parent().addClass("expanded");
 $(this).parent().siblings().removeClass("expanded");*\/
 
 //options["tabs-trigger-eventHandlers"]["click"].call(element, e);
 //}, 0);
 
 }
 },
 content: "<div>" + options.tabs[c].title + "</div>"
 });
 tabTrigger.appendTo(tab);
 $(options.tabs[c].content).appendTo(content);
 content.appendTo(tab);
 content.css({
 "height": "0px",
 "opacity": 0
 });
 tab.appendTo(uiElement);
 }
 
 deferred.resolve(uiElement);
 }, 0);
 return deferred;
 }*/



function UI_Button(initObj) {
    var button = $("<a></a>");
    if (initObj) {
        $(button).attr(function() {
            var attrObj = {};
            for (var attr in initObj.attributes) {
                attrObj[attr] = initObj.attributes[attr];
            }
            return attrObj;
        }());
        for (var event in initObj.eventHandlers) {
            $(button).on(event, function(e) {
                initObj.eventHandlers[event].call(this, e, initObj.eventOptions)
            });
        }
        $(typeof initObj.content === "function" ? initObj.content.call() : initObj.content).appendTo(button);
    }

    return button;
}

var UI_CloseButton = function() {
    return new UI_Button({
        attributes: {
            class: "close trigger"
        },
        eventHandlers: {
            click: function(e) {
                //$(this).parent().addClass("hidden");
                $(this).parent().trigger("remove").remove();
            }
        },
        content: "<div class='icon'>X</div>"
    });
};

function UI_Thumbnail(thumbUrl, mediaOptions) {
    var thumbnail = $(document.createElement("a"));
    thumbnail.addClass("trigger thumbnail").append(function() {
        return $("<img/>").attr({
            src: thumbUrl,
            class: "icon"
        }).css("z-index", 1);
    }).attr({
        title: "Click to View the Photograph"
    }).on("click", mediaOptions.triggers.click);
    return thumbnail;
}

/*function UI_Thumbnail(thumbUrl, mediaOptions) {
 var thumbnail = $(document.createElement("div"));
 thumbnail.addClass("trigger thumbnail").append(function() {
 return $("<div/>").append($("<img/>").attr({
 src: thumbUrl
 //,class: "icon"
 })).addClass("icon");
 }).attr({
 title: "Click to View the Photograph"
 })
 .on("click", mediaOptions.triggers.click);
 return thumbnail;
 }*/



function UI_ThumbnailView(srcObject) {
    function _createSlider() {
        //var thumnailSlider = $("<div>").addClass("ui-thumbnail-slider");
        var thumbnailSlider = $(document.createElement("div")).addClass("ui-thumbnail-slider").css({
        });

        var thumbnailSlide = $("<div/>").addClass("ui-thumbnail-slide")/*.css({
         display: "inline-block",
         width: "120px",
         height: "80px",
         "margin-left": "20px",
         "overflow": "hidden"
         })*/.appendTo(thumbnailSlider);
        var thumnailStrip = $("<div/>").addClass("ui-thumbnail-strip")/*.css({
         display: "inline-block",
         "white-space": "nowrap"
         })*/.appendTo(thumbnailSlide);
        for (var thumbUrl in srcObject.thumbUrls) {

            new UI_Thumbnail(srcObject.thumbUrls[thumbUrl], srcObject.mediaOptions({src: srcObject.photoUrls[thumbUrl]})).css({
                /*display: "inline-block",
                 margin: "0px 1px",
                 padding: "0px",*/
                "z-index": Number(thumbUrl) + 1
            }).appendTo(thumnailStrip);


        }

        var sliderNav = $("<div/>").addClass("ui-slider-nav").appendTo(thumbnailSlider);

        new UI_Button({
            attributes: {
                class: "ui-slider-button-prev",
                title: "Previous photo"
            },
            eventHandlers: {
                mouseover: function() {
                    var currViewIndex = thumbnailSlider.getViewIndex();
                    currViewIndex > 0 ? thumbnailSlider.setViewToIndex(currViewIndex - 1) : $(this).addClass("disabled");
                }
            },
            content: $("<div/>").addClass("icon").text("<")
        }).appendTo(sliderNav);
        new UI_Button({
            attributes: {
                class: "ui-slider-button-next",
                title: "Next photo"
            },
            eventHandlers: {
                mouseover: function() {
                    var currViewIndex = thumbnailSlider.getViewIndex();
                    var maxViewIndex = thumbnailSlider.find(".thumbnail").length - 1;
                    currViewIndex < maxViewIndex ? thumbnailSlider.setViewToIndex(currViewIndex + 1) : $(this).addClass("disabled");
                }
            },
            content: $("<div/>").addClass("icon").text(">")
        }).appendTo(sliderNav);

        return thumbnailSlider;
    }
    this.createSlider = function() {
        return _createSlider();
    };
}

function SplashScreen(content) {
    var splashScreen = $("<div/>").addClass("splash-screen").append(content);
    content.on("remove", function() {
        splashScreen.remove();
    });
    return splashScreen;
}

function MediaDocument(src) {
    console.log(src);
    //var container = $("<div/>").addClass("leaflet-popup");
    var viewer = $("<div/>").addClass("media-viewer float panel");
    //$("<div/>").addClass("leaflet-popup-content-wrapper").append($("<div/>").addClass("leaflet-popup-content").append(viewer)).appendTo(container);
    $("<div/>").addClass("media-document").append(function() {
        return $("<img/>").attr({
            class: "image media",
            src: src
        });
    }).appendTo(viewer);

    new UI_CloseButton().appendTo(viewer);

    return viewer;
}


function Popup() {
    return L.popup({
        autoPan: true,
        keepInView: true
    });
}



function UI_TabularColumn(options) {
    var column = $("<div class='col'/>");
    var header = $("<div class='col-header'/>").append(options.header);
    var body = $("<div class='col-body'/>");

    for (var c in options.body) {
        body.append(function() {
            //return $("<div class='body-row'/>").append($("<div/>").append(c)).append($("<div/>").append(options.body[c]));
            //return $("<div class='body-row'/>").append($("<div/>").append(options.body[c]));
            return $("<div class='body-row'/>").append(options.body[c]);
        });
    }

    var footer = $("<div class='col-footer'/>").append(options.footer);

    header.appendTo(column);
    body.appendTo(column);
    footer.appendTo(column);

    function _getUI(guiOptions) {
        if (guiOptions) {
            if (guiOptions["prepareUI"]) {
                guiOptions["prepareUI"].call(column[0]);
            }
        }
        return column[0];
    }

    this.getUI = function(guiOptions) {
        return _getUI(guiOptions);
    };
}


function UI_ExtensionColumns(options) {
    var column = new UI_TabularColumn(options);
    this.getUI = function(guiOptions) {
        return $(column.getUI(guiOptions)).addClass(options.class);
    };
}

function UI_ColumnPageSwitcher(options) {
    var uiElement = $("<div class='ui-column-page-switcher'></div>");
    var _buttons = ["prev", "next"];

    var pageStatus = $("<div class='ui-page-status'></div>");

    setTimeout(function() {
        for (var c in _buttons) {
            (new UI_Button({
                attributes: {
                    class: Number(c) ? "btn-next" : "btn-prev"
                },
                eventHandlers: {
                    click: function(e) {
                        if ($(this).closest(".ui-column-page-switcher").hasClass("inactive"))
                            return;
                        var element = e.target;
                        setTimeout(function() {
                            options.domElementsSelection.map(function(index, domElement) {
                                if (index >= options["start-index"] && index <= options["stop-index"]) {
                                    $(domElement).show();
                                    $(domElement).addClass("current-page");
                                } else {
                                    $(domElement).hide();
                                    $(domElement).removeClass("current-page");
                                }


                            });
                            //console.log(element);
                            //console.log(options.domElementsSelection.length);

                            if ($(element).hasClass("btn-prev") && options["start-index"] > 9) {
                                //console.log("btn-prev pressed");
                                options["start-index"] = Number(options["start-index"]) - 10;
                                options["stop-index"] = Number(options["stop-index"]) - 10;
                            } else if ($(element).hasClass("btn-next") && options["stop-index"] < options.domElementsSelection.length) {
                                //console.log("btn-next pressed");
                                options["start-index"] = Number(options["start-index"]) + 10;
                                options["stop-index"] = Number(options["stop-index"]) + 10;
                            }

                            pageStatus.text((options["start-index"] + 1) + "-" + (options["stop-index"] + 1) + " of " + (options.domElementsSelection.length + 1));
                            //console.log(options);

                            //options.pageChangeCallback.call(element, e, options);
                        }, 0);
                    }
                },
                content: Number(c) ? "<div class='ui-btn-next'>></div>" : "<div class='ui-btn-prev'><</div>"
            })).appendTo(uiElement);
        }

        pageStatus.text((options["start-index"] + 1) + "-" + (options["stop-index"] + 1) + " of " + (options.domElementsSelection.length + 1));

        pageStatus.insertAfter(uiElement.find(".btn-prev"));

    }, 0);

    return uiElement;
}


function UI_PictureBox(options) {
    var container = $("<div class='ui-picture-box'/>");
    $("<img/>").attr({
        src: options.src
    }).appendTo(container);

    function _getUI() {
        return container;
    }

    this.getUI = function() {
        return _getUI();
    };
}

function UI_Navigation(options) {

    var uiObject = this;

    var deferred = $.Deferred();

    var container = $("<div/>").addClass("ui-navigation").addClass(options.class);

    if (options.controls)
        container.append(options.controls);

    if (options.title)
        container.append($("<div/>").addClass("ui-navigation-title title").html(options.title));

    var tabgroup = $("<div/>").addClass("ui-navigation-group tabs trigger").appendTo(container);

    setTimeout(function() {
        for (var tab in options.tabgroup.tabs) {

            (new UI_Button({
                attributes: $.extend({
                    href: options.tabgroup.tabs[tab]
                }, options.tabgroup.attributes),
                eventHandlers: {
                    click: function(e, eventOptions) {
                        e.preventDefault();
                        //history.pushState(container.find("ui-navigation-group a.active").attr("class"));
                        //history.pushState($(this).attr("href"));

                        //history.pushState(this);
                        options.tabgroup.eventHandlers.click.call(this, e, eventOptions);

                    }
                },
                eventOptions: {
                    tabName: options.tabgroup.tabs[tab]
                },
                content: "<span>" + options.tabgroup.tabs[tab] + "</span>"
            })).appendTo(tabgroup);
        }

        deferred.resolve(uiObject);
    });

    function _getUI(options) {
        if (!options)
            options = {};
        var returnComponent = Boolean(options.componentSelector) ? container.find(options.componentSelector) : container;
        return returnComponent;
    }

    this.getUI = function(options) {
        return _getUI(options);
    };

    return $.extend(this, deferred.promise());
}

function UI_PanelDocumentSinglePage(options) {
    var _panelDocument = document.createElement("div");


    var _controls = $("<div/>").addClass("panel-document-controls");
    var _title = $("<div/>").addClass("panel-document-title");

    //var titleBarNode = document.createElement("div");

    var titleBarNode = $("<div></div>");

    var titleBar = null;

    if (options.titleBar) {

        if (options.titleBar.controls) {
            $(titleBarNode).append(function() {
                return $(_controls.append(options.titleBar.controls));
            });
        }
        if (options.titleBar.title) {
            $(titleBarNode).append(function() {
                return $(_title.append(options.titleBar.title));
            });


        }

        $(titleBarNode).addClass("titleBar panel-document-titleBar");

        titleBar = titleBarNode;



    }
    var _page = $("<div/>").addClass("panel-document-page");



    $(_panelDocument).attr({
        class: "panel panel-document"
    }).addClass(options.class).append(titleBar).append(_page);


    setTimeout(function() {
        _page.append(function() {
            return new FloatingPage({
                contentDeferred: options.contentDeferred
            });
        });
    }, 0);

    function _getDocument() {
        return $.extend($(_panelDocument), options);
    }

    this.getDocument = function() {
        return _getDocument();
    };
}

function FloatingPage(options) {

    var contentDeferred = $.extend(true, {}, options.contentDeferred);



    options.contentDeferred = function() {
        var deferred = $.Deferred();

        contentDeferred.done(function(data) {
            var content = $("<div></div>").addClass("content");
            setTimeout(function() {
                for (var triad in data.content) {
                    if (data.content[triad]["left"])
                        $("<div></div>").addClass(function() {
                            var cssClass = "left";

                            if (data.content[triad]["special-classes"] && data.content[triad]["special-classes"]["left"])
                                cssClass += " " + data.content[triad]["special-classes"]["left"];

                            var contentSelection = $(data.content[triad]["left"]);
                            if (contentSelection.is("img") && contentSelection.length === 1)
                                cssClass += " " + "picturebox";

                            return cssClass;
                        }).html(data.content[triad]["left"]).appendTo(content);

                    if (data.content[triad]["right"])
                        $("<div></div>").addClass(function() {
                            var cssClass = "right";

                            if (data.content[triad]["special-classes"] && data.content[triad]["special-classes"]["right"])
                                cssClass += " " + data.content[triad]["special-classes"]["right"];

                            var contentSelection = $(data.content[triad]["right"]);
                            if (contentSelection.is("img") && contentSelection.length === 1)
                                cssClass += " " + "picturebox";

                            return cssClass;

                            //return data.content[triad]["special-classes"] && data.content[triad]["special-classes"]["right"] ? "right " + data.content[triad]["special-classes"]["right"] : "right";
                        }).html(data.content[triad]["right"]).appendTo(content);

                    if (data.content[triad]["block"])
                        $("<div></div>").addClass(function() {
                            return data.content[triad]["special-classes"] && data.content[triad]["special-classes"]["block"] ? "block " + data.content[triad]["special-classes"]["block"] : "block";
                        }).html(data.content[triad]["block"]).appendTo(content);
                }
                if (data["special-classes"])
                    content.addClass(data["special-classes"]);
            }, 0);
            deferred.resolve(content);
        });

        return deferred.promise();
    }();

    var page = (new AsyncPage(options)).addClass("floating-page");
    return page;
}

function AsyncPage(options) {
    var page = $("<div class='async-page'></div>");
    var sandGlass = options.sandGlass;
    page.append(sandGlass);
    setTimeout(function() {
        options.contentDeferred.done(function(content) {
            page.prepend(content);
            if (sandGlass)
                sandGlass.remove();
        });
    });
    return page;
}

function SandGlass(options) {
    var sandglass = $("<div></div>").addClass("sandglass");
    sandglass.append(options.sand);
    return sandglass;
}

function GIFSand(options) {
    return $("<img/>").attr({
        class: options.class,
        src: options.src
    }).addClass("sand");
}

function UI_ReactiveMarker(options) {
    var icon = $("<div></div>").addClass(options["class"]);

    icon.append($("<img/>").attr("src", options["img-src"]));
    var label = $(options["label"]).length ? options["label"] : $("<span></span>").text(options["label"]);
    var target = icon.add(label);
    label.hide();
    target.on("mouseenter", function(e) {
        label.show();
    });
    target.on("mouseleave", function(e) {
        label.hide();
    });
    return target;
}

function UI_SummarySmallWidget(options) {
    return $.extend(this, (new UI_PanelDocumentSinglePage(options)).getDocument().addClass("widget-small"));
}

function UI_PiechartGallery(options) {
    var widgetBox = $("<div></div>").addClass("widget-chart-gallery-piechart").addClass(options.class);

    setTimeout(function() {
        console.log(options.charts);
        for (var chart in options.charts) {
            if (options.charts[chart].length) {
                var chartBox = $("<div></div>").addClass("icon-chart-preview");
                chartBox.attr("chart", chart);
                chartBox.appendTo(widgetBox);
                var chartOptions = {
                    /*header: {
                     title: {
                     text: config["seasons"][chart],
                     fontSize: 12
                     },
                     location: "top-left"
                     },*/
                    /*footer: {
                        text: config["seasons"][chart],
                        fontSize: 12,
                        location: "left"
                    },*/
                    size: {
                        canvasHeight: 120,
                        canvasWidth: 120
                    },
                    labels: {
                        outer: {
                            format: "none"
                        },
                        inner: {
                            format: "none"
                        }
                    },
                    effects: {
                        load: {
                            effect: "none"
                        }
                    },
                    data: {
                        //content: options.charts[chart]
                        content: options.charts[chart]
                    }
                };
                //console.log(options.charts);

                chartBox.click(function(e) {
                    $(this).closest(".widget-chart-gallery-piechart").find(".chart-view").remove();
                    var charViewContainer = $("<div></div>").addClass("view-box");
                    charViewContainer.appendTo(widgetBox);
                    var chartBoxLarger = $("<div></div>").addClass("chart-view").appendTo(charViewContainer);
                    $("<div></div>").addClass("chart-view-close-button").text("X").appendTo(chartBoxLarger).click(function() {
                        chartBoxLarger.remove();
                    });
                    console.log(this);
                    var fullChartOptions = {
                        header: {
                            title: {
                                text: config["seasons"][$(this).attr("chart")],
                                fontSize: 16,
                                color: "#a0cf85"
                            },
                            location: "top-left"
                        },
                        size: {
                            canvasHeight: 450,
                            canvasWidth: 700,
                            pieOuterRadius: "100%",
                        },
                        effects: {
                            load: {
                                effect: "none"
                            }
                        },
                        labels: {
                            value: {
                                fontSize: 16
                            },
                            percentage: {
                                fontSize: 16
                            },
                            mainLabel: {
                                fontSize: 14,
                                color: "#666666"
                            }
                        },
                        data: {
                            //content: options.charts[chart]
                            content: options.charts[$(this).attr("chart")]
                        },
                        tooltips: {
                            enabled: true,
                            type: "placeholder",
                            string: "{label}: {percentage}%",
                            styles: {
                                fadeInSpeed: 500,
                                backgroundColor: "#a0cf85",
                                backgroundOpacity: 0.8,
                                color: "#ffffff",
                                borderRadius: 4,
                                font: "verdana",
                                fontSize: 20,
                                padding: 20
                            }
                        }

                    };
                    new d3pie(chartBoxLarger[0], fullChartOptions);
                });

                //var pie;

                var pie = new d3pie(chartBox[0], chartOptions);
//                //console.log(options["label-position"]);
//                $(chartBox[0]).find("text").attr("x", options["label-position"][0]);
//                $(chartBox[0]).find("text").attr("y", options["label-position"][1]);
            chartBox.append(function(){
                    return $("<span></span>").text(config["seasons"][chart]);
                });
            }
        }
    }, 0);

    widgetBox.appendTo(options.container);

    //return widgetBox;
}

/**
 * 
 * @param {type} options
 * @returns {undefined}
 *NEEDS TESTING
 function UI_LayerSwitcherLegend(options){
 var groupingOptions = $.extend({
 "filterFunction": function(options){
 if((options.layer.feature.getAttributes()[options.categoryKey]).toLowerCase().indexOf(options.category)) return true;
 else return false;
 }
 }, options);
 var layerGroupDeferred = new LayerGroups(groupingOptions);
 var layerGroups = {};
 
 var container = $("<div></div>").addClass("ui-layer-switcher-legend").addClass(options.class);
 
 layerGroupDeferred.done(function(_layerGroups){
 layerGroups = _layerGroups;
 console.log(L.control.layers({}, layerGroups));
 });
 }
 **/

function UI_LayerSwitcherLegend(options) {
    var deferred = $.Deferred();
    var layerSwitcherLegend = L.control.layers($.extend({}, options.basemap), $.extend({}, options.layerGroups), $.extend({}, options.layerControlOptions)).addTo(options.map);
    var container = $(layerSwitcherLegend._container).addClass("ui-layerSwitcher-legend");
    container.hide();


    setTimeout(function() {
        container.find("input").each(function() {
            $(this).click();
            var legendID = $(this).parent().children("span").text().trim();
            var legendIcon = $("<div></div>").addClass("ui-legend-icon").addClass(legendID);
            legendIcon.css({
                "background-image": config["layer-styles"]["legend-icons"][legendID]["background-image"],
                "background-color": config["layer-styles"]["legend-icons"][legendID]["background-color"]
            });
            legendIcon.insertAfter($(this));
        });
    }, 0);


    return $.extend(true, {
        uiElement: container
    }, deferred.promise());
}