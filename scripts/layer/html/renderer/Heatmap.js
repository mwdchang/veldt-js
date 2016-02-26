(function() {

    'use strict';

    var $ = require('jquery');
    var _ = require('lodash');

    var TILE_SIZE = 256;

    module.exports = {

        onClick: function(e) {
            var target = $(e.originalEvent.target);
            $('.heatmap-pixel').removeClass('highlight');
            target.addClass('highlight');
        },

        extractExtrema: function(data) {
            var bins = new Float64Array(data);
            return {
                min: _.min(bins),
                max: _.max(bins)
            };
        },

        renderTile: function(container, data) {
            if (!data) {
                return;
            }
            var bins = new Float64Array(data);
            var resolution = Math.sqrt(bins.length);
            var rampFunc = this.getColorRamp();
            var pixelSize = TILE_SIZE / resolution;
            var self = this;
            var color = [0, 0, 0, 0];
            var html = '';
            bins.forEach(function(bin, index) {
                var left = (index % resolution);
                var top = Math.floor(index / resolution);
                var val = self.transformValue(bin, 'log');
                val = Math.max(0, Math.min(1, val));
                if (val === 0) {
                    return;
                } else {
                    rampFunc(val, color);
                }
                var rgba = 'rgba(' +
                    color[0] + ',' +
                    color[1] + ',' +
                    color[2] + ',' +
                    (color[3] / 255) + ')';
                html += '<div class="heatmap-pixel" style="' +
                    'height:' + pixelSize + 'px;' +
                    'width:' + pixelSize + 'px;' +
                    'left:' + (left * pixelSize) + 'px;' +
                    'top:' + (top * pixelSize) + 'px;' +
                    'background-color:' + rgba + ';"></div>';
            });
            container.innerHTML = html;
        }

    };

}());
