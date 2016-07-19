(function() {

    'use strict';

    // debug tile layer
    var Debug = require('./core/Debug');

    // pending tile layer
    var Pending = require('./core/Pending');

    // image layer
    var Image = require('./core/Image');

    // composite layer
    var Composite = require('./core/Composite');

    // live tile layers
    var Heatmap = require('./type/Heatmap');
    var TopTrails = require('./type/TopTrails');
    var TopCount = require('./type/TopCount');
    var TopFrequency = require('./type/TopFrequency');
    var TopicCount = require('./type/TopicCount');
    var TopicFrequency = require('./type/TopicFrequency');
    var Preview = require('./type/Preview');
    var Macro = require('./type/Macro');
    var Micro = require('./type/Micro');
    var Count = require('./type/Count');

    module.exports = {
        Debug: Debug,
        Pending: Pending,
        Image: Image,
        Composite: Composite,
        Heatmap: Heatmap,
        TopCount: TopCount,
        TopTrails: TopTrails,
        TopFrequency: TopFrequency,
        TopicCount: TopicCount,
        TopicFrequency: TopicFrequency,
        Preview: Preview,
        Macro: Macro,
        Micro: Micro,
        Count: Count
    };

}());
