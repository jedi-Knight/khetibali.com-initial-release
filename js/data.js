function Data() {

    var geometries = {
        points: {
        },
        polygons: {
        },
        lines: {
        }
    };

    var attributes = {
        points: {
        },
        polygons: {
        },
        lines: {
        }
    };

    var freeTables = {
    };

    var summaries = {
        groups: {
        }
    };

    var widgetContent = {
        widget: {
        }
    };

    var _plugins = {};

    this.plugins = _plugins;

    /**temporary hack:**/
    this.getGeometries = function(query) {
        if (query) {
            //console.log(geometries[query["geometry-type"]][query["feature-group"]]["features"]);
            var features = geometries[query["geometry-type"]][query["feature-group"]]["features"];
            if (query["function"] === "getCentroids") {
                features = features.map(function(feature, index) {
                    //console.log(feature);
                    var coordinates = feature.geometry.coordinates;
                    var n = coordinates[0].length;
                    var centroid = [0, 0];

                    if (feature.geometry.type === "Polygon") {
                        coordinates[0].map(function(coordinatePair, index) {
                            if (index === n - 1)
                                return;
                            centroid[0] += coordinatePair[0];
                            centroid[1] += coordinatePair[1];
                        });
                        centroid = [centroid[0] / (n - 1), centroid[1] / (n - 1)];
                    }


                    var returnFeature = {
                        "type": "Feature",
                        "properties": $.extend(true, {}, feature.properties),
                        "geometry": {
                            "type": "Point",
                            "coordinates": centroid
                        }
                    };

                    /*returnFeature.properties.getAttributes = function(){
                     
                     };*/

                    return returnFeature;

                });

                var centroidsCollection = $.extend(true, {}, geometries[query["geometry-type"]][query["feature-group"]]);
                centroidsCollection.features = features;

                if (query["one-time"])
                    return centroidsCollection;

                geometries.points.centroidsCollections = {};
                geometries.points.centroidsCollections[query["feature-group"]] = centroidsCollection;
                return geometries.points.centroidsCollections[query["feature-group"]];
            }



        }
        return geometries;
    };
    this.getAttributes = function(query) {

        if (query) {
            var orderedCollection = [];
            var orderedAttributes = $.extend(true, {}, attributes[query["geometry-type"]]);
            var orderedKeys = $.map(orderedAttributes, function(item, index) {
                //console.log(item[query["order-by"]]+"_:_"+index);
                return item[query["order-by"]] + "_:_" + index;
            });

            orderedKeys.sort();
            orderedKeys = orderedKeys.map(function(item, index) {
                return item.replace(/.*_:_/, "");
            });


            for (var c in orderedKeys) {
                if (orderedAttributes[orderedKeys[c]]._metaX["feature-group"] === query["feature-group"]) {
                    orderedAttributes[orderedKeys[c]]["_cartomancer_id"] = orderedKeys[c] - Number(geometries[query["geometry-type"]][query["feature-group"]]._cartomancer_countstart);
                    orderedCollection.push(orderedAttributes[orderedKeys[c]]);
                }
            }

            return orderedCollection;
        }

        return attributes;
    };

    this.getFeatureIndexForAttribute = function(feature, attribute) {
        var featureIndexForAttribute = {};
        for (var c in attributes[feature]) {
            if (attributes[feature][c][attribute])
                featureIndexForAttribute[c] = {
                    attribute: attributes[feature][c][attribute],
                    group: attributes[feature][c]._metaX.group
                };
        }
        ;
        return featureIndexForAttribute;
    };

    this.getWidgetContent = function() {
        return widgetContent;
    };
    /**:temporary hack**/

    var thirdPartyAPIQueue = false;

    function queryModel(params) {
        console.log("querying local db");
        if (params["query-type"] === "widget-query") {
            if (widgetContent.widget[params["widget"]] && widgetContent.widget[params["widget"]][params["group"]])
                return widgetContent.widget[params["widget"]][params["group"]];
            else
                return false;
        } else {
            if (params.query.geometries) {

                if (geometries[params.query.geometries.type] && geometries[params.query.geometries.type][params.query.geometries.group]) {
                    return geometries[params.query.geometries.type][params.query.geometries.group];
                } else
                    return false;

            } else if (params.query.attributes) {
                switch (params.query.attributes.geometry) {
                    case "points":

                        break;
                }
            }
        }
    }


    function onJSONReturn(data, params) {

        var writeQueryDeferred = $.Deferred();

        if (params["query-type"] === "widget-query") {
            if (!widgetContent.widget[params["widget"]])
                widgetContent.widget[params["widget"]] = {};
            widgetContent.widget[params["widget"]][params["group"]] = data;

            writeQueryDeferred.resolve();

        } else {
            if (params.returnDataMeta.type === "formhub_JSON") {
                setTimeout(function() {

                    var c = Object.keys(attributes.points).length;

                    var geoJSONDB_geometries = {
                        type: "FeatureCollection",
                        properties: {
                            _cartomancer_group_startIndex: c
                        },
                        features: []
                    };
                    var geoJSONDB_attributes = {
                    };





                    for (var form in data) {

                        data[form]._geolocation[1] && data[form]._geolocation[0] ? geoJSONDB_geometries.features.push({
                            type: "Feature",
                            properties: {
                                datapoint_id: data[form]._id,
                                _cartomancer_id: c,
                                getAttributes: function(id) {
                                    return attributes.points[id];
                                }
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [data[form]._geolocation[1], data[form]._geolocation[0]]
                            }
                        }) : function() {
                            if (!freeTables.formhub)
                                freeTables.formhub = {};
                            freeTables.formhub[data[form]._uuid] = data[form];
                        }();

                        delete data[form]._geolocation;
                        data[form]._metaX = {
                            dataSource: "formhub",
                            group: params.query.geometries.group
                        };


                        geoJSONDB_attributes[c] = data[form];

                        c++;
                    }

                    geometries.points[params.query.geometries.group] = geoJSONDB_geometries;
                    $.extend(attributes.points, geoJSONDB_attributes);
                    writeQueryDeferred.resolve();
                }, 0);

            } else if (params.returnDataMeta.type === "ushahidi_JSON") {
                setTimeout(function() {

                    var c = Object.keys(attributes.points).length;

                    var geoJSONDB_geometries = {
                        type: "FeatureCollection",
                        properties: {
                            _cartomancer_group_startIndex: c
                        },
                        features: []
                    };
                    var geoJSONDB_attributes = {
                    };





                    for (var form in data["payload"]["incidents"]) {

                        data["payload"]["incidents"][form]["incident"]["locationlatitude"] && data["payload"]["incidents"][form]["incident"]["locationlongitude"] ? geoJSONDB_geometries.features.push({
                            type: "Feature",
                            properties: {
                                datapoint_id: data["payload"]["incidents"][form]["incident"]["incidentid"],
                                _cartomancer_id: c,
                                getAttributes: function(id) {
                                    return attributes.points[id];
                                }
                            },
                            geometry: {
                                type: "Point",
                                coordinates: [data["payload"]["incidents"][form]["incident"]["locationlongitude"], data["payload"]["incidents"][form]["incident"]["locationlatitude"]]
                            }
                        }) : function() {
                            if (!freeTables.formhub)
                                freeTables.ushahidi = {};
                            freeTables.ushahidi[data["payload"]["incidents"][form]["incident"]["incidentid"]] = data["payload"]["incidents"][form];
                        }();

                        //delete data[form]._geolocation;
                        /*data[form]._metaX = {
                         dataSource: "formhub",
                         group: params.query.geometries.group
                         };*/


                        geoJSONDB_attributes[c] = {
                            "_metaX": {
                                dataSource: "ushahidi",
                                group: params.query.geometries.group
                            },
                            "category": data["payload"]["incidents"][form]["categories"][0]["category"]["title"],
                            "pictures": [//update this for multiple photos / other types of media
                                {
                                    "photo": data["payload"]["incidents"][form]["media"].length ? data["payload"]["incidents"][form]["media"][0]["link_url"] : "",
                                    "thumb": data["payload"]["incidents"][form]["media"].length ? data["payload"]["incidents"][form]["media"][0]["thumb_url"] : ""
                                }
                            ]
                        };

                        $.extend(geoJSONDB_attributes[c], data["payload"]["incidents"][form]["incident"])

                        c++;
                    }

                    geometries.points[params.query.geometries.group] = geoJSONDB_geometries;
                    $.extend(attributes.points, geoJSONDB_attributes);
                    writeQueryDeferred.resolve();
                }, 0);
            } else if (params.returnDataMeta.type === "food_secutiry_osm_geojson") {
                //console.log(data);
                setTimeout(function() {
                    data.features.map(function(feature, index) {
//                   console.log(feature); 
                        try {
                            var cropList = feature.properties.crop.split(";");
                            var cropData = {
                                "0": [
                                ],
                                "3": [
                                ],
                                "6": [
                                ],
                                "9": [
                                ]
                            };

                            var cropMonthRange;
                            //console.log(cropList);
                            for (var c in cropList) {
                                //console.log(c);
                                //console.log(index);
                                //console.log("crop"+c+":time");
                                cropMonthRange = (feature.properties["crop" + c + ":time"] + "").split(" to ");
                                //console.log(cropMonthRange);


                                var seasonIndexRange = [];
                                var startMonthIndex = config["month-list"].indexOf(cropMonthRange[0]);
                                var endMonthIndex = config["month-list"].indexOf(cropMonthRange[1]);
                                if ((startMonthIndex + 1) && (endMonthIndex + 1)) {
                                    $.map(cropData, function(data, seasonID) {
                                        switch (seasonID) {
                                            case "0":
                                                {
                                                    if (startMonthIndex >= 0 && startMonthIndex < 3) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    } else if (endMonthIndex >= 0 && endMonthIndex < 3) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    }
                                                    break;
                                                }
                                            case "3":
                                                {
                                                    if (startMonthIndex >= 3 && startMonthIndex < 6) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    } else if (endMonthIndex >= 3 && endMonthIndex < 6) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    }
                                                    break;
                                                }
                                            case "6":
                                                {
                                                    if (startMonthIndex >= 6 && startMonthIndex < 9) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    } else if (endMonthIndex >= 6 && endMonthIndex < 9) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    }
                                                    break;
                                                }
                                            case "9":
                                                {
                                                    if (startMonthIndex >= 9 && startMonthIndex < 12) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    } else if (endMonthIndex >= 9 && endMonthIndex < 12) {
                                                        cropData[seasonID].push({
                                                            "label": feature.properties["crop" + c + ":name"],
                                                            "value": Number((feature.properties["crop" + c + ":percentage"] + "").replace(/%/g, "")),
                                                            "caption": feature.properties["crop" + c + ":name"]
                                                                    //,"color": config["charts"]["colors"][feature.properties["crop" + c + ":name"]]
                                                        });
                                                    }
                                                    break;
                                                }

                                        }
                                    });
                                }
                            }
                            //console.log(cropData);

                            feature.properties.cropData = cropData;

                        } catch (e) {
                            //console.log("crop list not found for:");
                            //console.log(feature);
                            //console.log("\n");
                        }
                    });
                    console.log(data);



                    if (params.query.geometries) {
                        if (geometries[params.query.geometries.type])
                            try {
                                Object.keys(params.query.geometries.group);
                                params.query.geometries.group = data.features[0].properties[params.query.geometries.group.column];
                                geometries[params.query.geometries.type][params.query.geometries.group] = data;
                            } catch (e) {
                                geometries[params.query.geometries.type][params.query.geometries.group] = data;
                            }
                        else
                            throw new Error();

                        setTimeout(function() {
                            var c = Object.keys(attributes[params.query.geometries.type]).length;
                            var geojsonDB_attributes = {};
                            geometries[params.query.geometries.type][params.query.geometries.group]._cartomancer_countstart = c;

                            for (var feature in geometries[params.query.geometries.type][params.query.geometries.group].features) {
                                geojsonDB_attributes[c] = geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties;

                                geojsonDB_attributes[c]._metaX = {
                                    "feature-group": params.query.geometries.group
                                };

                                if (geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"]) {
                                    geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties.id
                                            = geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"];
                                    delete geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"];
                                }

                                geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties = {
                                    feature_id: geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties.id,
                                    _cartomancer_id: c,
                                    getAttributes: function(_cartomancer_id) {
                                        //return attributes[params.query.geometries.type][_cartomancer_id];
                                        return attributes[params.query.geometries.type][this._cartomancer_id];
                                    }
                                };
                                c++;
                            }

                            $.extend(attributes[params.query.geometries.type], geojsonDB_attributes);


                            writeQueryDeferred.resolve();
                        }, 0);


                    } else if (params.query.attributes) {
                        switch (params.query.attributes.geometry) {
                        }
                    }





                }, 0);
            } else {

                if (params.query.geometries) {
                    if (geometries[params.query.geometries.type])
                        try {
                            Object.keys(params.query.geometries.group);
                            params.query.geometries.group = data.features[0].properties[params.query.geometries.group.column];
                            geometries[params.query.geometries.type][params.query.geometries.group] = data;
                        } catch (e) {
                            geometries[params.query.geometries.type][params.query.geometries.group] = data;
                        }
                    else
                        throw new Error();

                    setTimeout(function() {
                        var c = Object.keys(attributes[params.query.geometries.type]).length;
                        var geojsonDB_attributes = {};
                        geometries[params.query.geometries.type][params.query.geometries.group]._cartomancer_countstart = c;

                        for (var feature in geometries[params.query.geometries.type][params.query.geometries.group].features) {
                            geojsonDB_attributes[c] = geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties;

                            geojsonDB_attributes[c]._metaX = {
                                "feature-group": params.query.geometries.group
                            };

                            if (geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"]) {
                                geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties.id
                                        = geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"];
                                delete geometries[params.query.geometries.type][params.query.geometries.group]["features"][feature]["properties"]["@id"];
                            }

                            geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties = {
                                feature_id: geometries[params.query.geometries.type][params.query.geometries.group].features[feature].properties.id,
                                _cartomancer_id: c,
                                getAttributes: function(_cartomancer_id) {
                                    //return attributes[params.query.geometries.type][_cartomancer_id];
                                    return attributes[params.query.geometries.type][this._cartomancer_id];
                                }
                            };
                            c++;
                        }

                        $.extend(attributes[params.query.geometries.type], geojsonDB_attributes);


                        writeQueryDeferred.resolve();
                    }, 0);


                } else if (params.query.attributes) {
                    switch (params.query.attributes.geometry) {
                    }
                }


            }
        }

        return writeQueryDeferred.promise();
    }



    function summarize(params) {

    }



    this.fetchData = function(params) {
        return function(params) {
            var apiCall = $.Deferred();
            var modelQueryResult = queryModel(params);
            apiCall.resolve(modelQueryResult, params);
            return modelQueryResult ? apiCall.promise() : false;
        }(params) || function(params) {
            console.log("data not found in local cache..making ajax call;");
            var apiCall = $.Deferred();

            var url = config.api.url + params.query.url;
            var requestType = config.api.requestType;
            //var id="name";


            if (params["override"]) {
                if (Boolean(params["override"]["api-url"])) {
                    url = params["override"]["api-url"];
                    //delete params.url;
                }
                if (Boolean(params["override"]["requestType"])) {
                    requestType = params["override"]["requestType"];
                }
                //    if(Boolean(params.id)){
                //        id=params.id;
                //        delete params.id;
                //    }
            }

            if (thirdPartyAPIQueue) {
                apiCall.resolve({
                    type: "FeatureCollection",
                    features: []
                }, params);
            } else {

                $.ajax({
                    type: requestType,
                    url: url,
                    data: params.query.requestData,
                    success: function(data) {
                        onJSONReturn(data, params).done(function() {



                            if (thirdPartyAPIQueue)
                                thirdPartyAPIQueue = false;

                            apiCall.resolve(queryModel(params), params);
                        });
                    },
                    dataType: "json",
                    cache: false,
                    crossDomain: true
                            /*,headers: {Connection: "close"}*/
                });
            }
            if (function() {
                for (var api in config.otherAPIs) {
                    if (url === config.otherAPIs[api].url)
                        return true;
                }
                return false;
            }()) {
                thirdPartyAPIQueue = true;
            }


            return apiCall.promise();

        }(params);
    };
}
