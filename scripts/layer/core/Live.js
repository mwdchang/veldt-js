(function() {

    'use strict';

    var boolQueryCheck = require('../query/Bool');

    var MIN = Number.MAX_VALUE;
    var MAX = 0;

    function mod(n, m) {
        return ((n % m) + m) % m;
    }

    function getNormalizeCoords(coords) {
        var pow = Math.pow(2, coords.z);
        return {
            x: mod(coords.x, pow),
            y: mod(coords.y, pow),
            z: coords.z
        };
    }

    var Live = L.Class.extend({

        initialize: function(meta, options) {
            // set renderer
            if (!options.rendererClass) {
                throw 'No `rendererClass` option found.';
            } else {
                // recursively extend and initialize
                if (options.rendererClass.prototype) {
                    $.extend(true, this, options.rendererClass.prototype);
                    options.rendererClass.prototype.initialize.apply(this, arguments);
                } else {
                    $.extend(true, this, options.rendererClass);
                    options.rendererClass.initialize.apply(this, arguments);
                }
            }
            // set options
            L.setOptions(this, options);
            // set meta
            this._meta = meta;
            // set params
            this._params = {
                binning: {}
            };
            // set extrema / cache
            this.clearExtrema();
        },

        clearExtrema: function() {
            this._extrema = {
                min: MIN,
                max: MAX
            };
            this._cache = {};
        },

        getExtrema: function() {
            return this._extrema;
        },

        updateExtrema: function(data) {
            var extrema = this.extractExtrema(data);
            var changed = false;
            if (extrema.min < this._extrema.min) {
                changed = true;
                this._extrema.min = extrema.min;
            }
            if (extrema.max > this._extrema.max) {
                changed = true;
                this._extrema.max = extrema.max;
            }
            return changed;
        },

        extractExtrema: function(data) {
            return {
                min: _.min(data),
                max: _.max(data)
            };
        },

        setQuery: function(query) {
            if (!query.must && !query.must_not && !query.should) {
                throw 'Root query must have at least one `must`, `must_not`, or `should` argument.';
            }
            // check that the query is valid
            boolQueryCheck(this._meta, query);
            // set query
            this._params.must = query.must;
            this._params.must_not = query.must_not;
            this._params.should = query.should;
            // cleat extrema
            this.clearExtrema();
        },

        getMeta: function() {
            return this._meta;
        },

        getParams: function() {
            return this._params;
        },

        cacheKeyFromCoord: function(coords, normalize) {
            if (normalize) {
                // leaflet layer x and y may be > n^2, and < 0 in the case
                // of a wraparound. If normalize is true, mod the coords
                coords = getNormalizeCoords(coords);
            }
            return coords.z + ':' + coords.x + ':' + coords.y;
        },

        coordFromCacheKey: function(key) {
            var arr = key.split(':');
            return {
                x: parseInt(arr[1], 10),
                y: parseInt(arr[2], 10),
                z: parseInt(arr[0], 10)
            };
        },

        onTileUnload: function(event) {
            // cache key from coords
            var key = this.cacheKeyFromCoord(event.coords);
            // cache key from normalized coords
            var nkey = this.cacheKeyFromCoord(event.coords, true);
            // get cache entry
            var cached = this._cache[nkey];
            // could the be case where the cache is cleared before tiles are
            // unloaded
            if (!cached) {
                return;
            }
            // remove the tile from the cache
            delete cached.tiles[key];
            if (_.keys(cached.tiles).length === 0) {
                // no more tiles use this cached data, so delete it
                delete this._cache[key];
            }
        },

        onTileLoad: function(event) {
            var self = this;
            var coords = event.coords;
            var ncoords = getNormalizeCoords(event.coords);
            var tile = event.tile;
            // cache key from coords
            var key = this.cacheKeyFromCoord(event.coords);
            // cache key from normalized coords
            var nkey = this.cacheKeyFromCoord(event.coords, true);
            // check cache
            var cached = this._cache[nkey];
            if (cached) {
                // add tile under normalize coords
                cached.tiles[key] = tile;
                if (!cached.isPending) {
                    // tile has already received data, draw
                    self.renderTile(tile, cached.data, coords);
                }
            } else {
                // create a cache entry
                this._cache[nkey] = {
                    isPending: true,
                    tiles: {},
                    data: null
                };
                // add tile to the cache entry
                this._cache[nkey].tiles[key] = tile;
                // request the tile
                this.requestTile(ncoords, function(data) {
                    var cached = self._cache[nkey];
                    if (!cached) {
                        // tile is no longer being tracked, ignore
                        return;
                    }
                    cached.isPending = false;
                    cached.data = data;
                    // update the extrema
                    if (data && self.updateExtrema(data)) {
                        // extrema changed, redraw all tiles
                        _.forIn(self._cache, function(cached) {
                            _.forIn(cached.tiles, function(tile, key) {
                                if (cached.data) {
                                    self.renderTile(tile, cached.data, self.coordFromCacheKey(key));
                                }
                            });
                        });
                    } else {
                        // same extrema, we are good to render the tiles. In
                        // the case of a map with wraparound, we may have
                        // multiple tiles dependent on the response, so iterate
                        // over each tile and draw it.
                        _.forIn(cached.tiles, function(tile) {
                            self.renderTile(tile, data, coords);
                        });
                    }
                });
            }
        },

    });

    module.exports = Live;

}());
