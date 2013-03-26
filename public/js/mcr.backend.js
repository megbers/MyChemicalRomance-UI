(function (root, $, _) {
    'use strict';

    var compounds, discoveries, elements, ready = $.Deferred();
    var workspace= [];

    var mcr = root.mcr = {
        workspace: workspace,
        add: function (symbol) {
            workspace.push(symbol);

            var discovered = findMatchedCompounds();
            return {
                workspace: workspace,
                discovered: discovered,
                potential: findPotentialCompounds().length
            };
        },

        remove: function(symbol) {
            return {};
        },

        reset: function() {
            workspace = [];
        },

        ready: ready,
        symbols: {},
        load: load,
        docRoot: ''
    };

    function findPotentialCompounds() {
        var map = parseWorkspace();
        var result = [];

        for (var i= 0, n=compounds.length; i<n; i++) {
            if (isPotentialMatch(map, compounds[i].elements)) {
                result.push(compounds[i]);
            }
        }

        return result;
    }

    function isPotentialMatch(potentialCompound, compound) {
        var potKeys = _.keys(potentialCompound);

        for(var i= 0, n=potKeys.length; i<n; i++) {
            var key= potKeys[i];

            if (! compound[key]) return false;
            if (potentialCompound[key] > compound[key]) return false;
        }
        return true;
    }

    function findMatchedCompounds() {
        var map = parseWorkspace();
        var result = [];

        for (var i= 0, n=compounds.length; i<n; i++) {
            if (isMatch(map, compounds[i])) {
                result.push(compounds[i]);
            }
        }

        return result;
    }

    function isMatch(map, compound) {
        return _.isEqual(map, compound.elements);
    }

    function parseWorkspace() {
        var map = {};
        for (var i= 0, n=workspace.length; i<n; i++) {
            var c= workspace[i];
            if (map[c]) {
                map[c] = map[c] + 1;
            } else {
                map[c] = 1;
            }
        }
        return map;
    }

    function initCompounds(data) {
        compounds = data;
    }

    function initElements(data) {
        elements = data;
        $.each(data, function (idx, element) {
            mcr.symbols[element.SYMBOL] = element;
        });
        buildDiscoveryTree();
    }

    function buildDiscoveryTree() {
        discoveries =  {
            count: 0,
            symbols: {}
        };

        $.each(compounds, function(idx, compound) {
            discoveries.count++;
        });
    }

    function load() {
        $.when($.ajax(mcr.docRoot + 'json/compounds.json'), $.ajax(mcr.docRoot + 'json/elements.json')).then(function (data1, data2) {
            initCompounds(data1[0]);
            initElements(data2[0].PERIODIC_TABLE.ATOM);
            ready.resolve();
        }, function () {
            console.log('mcr.backend.js: error');
        });
    }
})(this, this.jQuery, this._);