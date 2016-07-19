(function() {

    'use strict';

    var HTML = require('../../core/HTML');
    var ColorRamp = require('../../mixin/ColorRamp');
    var ValueTransform = require('../../mixin/ValueTransform');

    var Heatmap = HTML.extend({

        includes: [
            // mixins
            ColorRamp,
            ValueTransform
        ],

        initialize: function() {
            ColorRamp.initialize.apply(this, arguments);
            ValueTransform.initialize.apply(this, arguments);
        },

        onMouseOver: function(e) {
            var target = $(e.originalEvent.target);
            var value = target.attr('data-value');
            if (value) {
                var $parent = target.parents('.leaflet-html-tile');
                this.fire('mouseover', {
                    elem: e.originalEvent.target,
                    value: parseInt(value, 10),
                    x: parseInt($parent.attr('data-x'), 10),
                    y: parseInt($parent.attr('data-y'), 10),
                    z: this._map.getZoom(),
                    bx: parseInt(target.attr('data-bx'), 10),
                    by: parseInt(target.attr('data-by'), 10),
                    type: 'heatmap',
                    layer: this
                });
            }
        },

        onMouseOut: function(e) {
            var target = $(e.originalEvent.target);
            var value = target.attr('data-value');
            if (value) {
                var $parent = target.parents('.leaflet-html-tile');
                this.fire('mouseout', {
                    elem: e.originalEvent.target,
                    value: parseInt(value, 10),
                    x: parseInt($parent.attr('data-x'), 10),
                    y: parseInt($parent.attr('data-y'), 10),
                    z: this._map.getZoom(),
                    bx: parseInt(target.attr('data-bx'), 10),
                    by: parseInt(target.attr('data-by'), 10),
                    type: 'heatmap',
                    layer: this
                });
            }
        },

        onClick: function(e) {
            // un-select any prev selected pixel
            $('.heatmap-pixel').removeClass('highlight');
            // get target
            var target = $(e.originalEvent.target);
            if (!this.isTargetLayer(e.originalEvent.target)) {
                // this layer is not the target
                return;
            }
            if (target.hasClass('heatmap-pixel')) {
                target.addClass('highlight');
            }
            var value = target.attr('data-value');
            if (value) {
                var $parent = target.parents('.leaflet-html-tile');
                this.fire('click', {
                    elem: e.originalEvent.target,
                    value: parseInt(value, 10),
                    x: parseInt($parent.attr('data-x'), 10),
                    y: parseInt($parent.attr('data-y'), 10),
                    z: this._map.getZoom(),
                    bx: parseInt(target.attr('data-bx'), 10),
                    by: parseInt(target.attr('data-by'), 10),
                    type: 'heatmap',
                    layer: this
                });
            }
        },

        renderTile: function(container, data) {
            if (!data) {
                return;
            }
            var bins = new Float64Array(data);
            var resolution = Math.sqrt(bins.length);
            var ramp = this.getColorRamp();
            var pixelSize = this.options.tileSize / resolution;
            var self = this;
            var color = [0, 0, 0, 0];
            var html = '';
            var nval, rval, bin;
            var left, top;
            var i;
            for (i=0; i<bins.length; i++) {
                bin = bins[i];
                if (bin === 0) {
                    continue;
                } else {
                    left = (i % resolution);
                    top = Math.floor(i / resolution);
                    nval = self.transformValue(bin);
                    rval = self.interpolateToRange(nval);
                    ramp(rval, color);
                }
                var rgba = 'rgba(' +
                    Math.round(color[0] * 255) + ',' +
                    Math.round(color[1] * 255) + ',' +
                    Math.round(color[2] * 255) + ',' +
                    color[3] + ')';
                html += '<div class="heatmap-pixel" ' +
                    'data-value="' + bin + '" ' +
                    'data-bx="' + left + '" ' +
                    'data-by="' + top + '" ' +
                    'style="' +
                    'height:' + pixelSize + 'px;' +
                    'width:' + pixelSize + 'px;' +
                    'left:' + (left * pixelSize) + 'px;' +
                    'top:' + (top * pixelSize) + 'px;' +
                    'background-color:' + rgba + ';"></div>';
            }
            container.innerHTML = html;
        }

    });

    module.exports = Heatmap;

}());
