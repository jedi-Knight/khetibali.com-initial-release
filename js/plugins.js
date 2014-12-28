function LayerGroups(options) {
    var deferred = $.Deferred();
    var layerGroups = {};

    setTimeout(function() {
        $.map(options.layers, function(layer, index) {
            setTimeout(function() {
                $.map(options.categories, function(category, index) {
                    if (options.filterFunction({
                        category: category,
                        layer: layer,
                        categoryKey: options.categoryKey
                    })) {
                        if (layerGroups[category]) {
                            layerGroups[category].addLayer(layer);
                        } else {
                            layerGroups[category] = L.layerGroup([layer]);
                        }
                    }
                });
                if(index===options.layers.length) deferred.resolve(layerGroups)
            }, 0);

        });
    }, 0);

    return deferred.promise();
}