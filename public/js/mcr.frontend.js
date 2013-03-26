$(document).ready(function(){
    'use strict';
    var currentId = 1;

    $("canvas").drawImage({
        name:'trashcan',
        layer: true,
        source: "images/trashcan_full.png",
        x: 800, y: 30,
        scale: 0.3
    });

    $.jCanvas.extend({
        name: "drawChemicalElement",
        props: {},
        fn: function(ctx, params) {

            $("canvas").drawRect({
                fillStyle: params.fillStyle,
                x: params.x,
                y: params.y,
                width: params.width,
                height: params.height,
                shadowColor: "#000",
                shadowBlur: 10,
                fromCenter: false
            })
            .drawText({
                fillStyle: "#9cf",
                strokeStyle: "#25a",
                strokeWidth: 2,
                x: params.x + 25,
                y: params.y + 25,
                font: "28pt Verdana, sans-serif",
                text: params.symbol

            });

            $.jCanvas.detectEvents(this, ctx, params);

        }
    });

    $('#chemSymbol').on('change', function() {
        var symbol = $('#chemSymbol').val();
        if(symbol === '') {
            return;
        }
        var chemical = {
            id: currentId++,
            symbol: symbol
        };

        mixingBoard.addChemical(chemical);
        var x = Math.floor((Math.random()*800)+100);
        var y = Math.floor((Math.random()*300)+100);
        $("canvas").drawChemicalElement({
            name: ''+chemical.id,
            chemical: chemical,
            layer: true,
            draggable: true,
            fillStyle: "#fff",
            symbol: $('#chemSymbol').val(),
            width: 50,
            height: 50,
            x: x,
            y: y,
            dragstop: function(event) {
                var withinXBoundry = (event.x < 800 && event.x > 770);
                var withinYBoundry = (event.y < 45);
                if(withinXBoundry && withinYBoundry) {
                    mixingBoard.removeChemical(chemical);
                }
            }
        });
    });

});

var mixingBoard = {
    chemicals: [],

    addChemical: function(chemical) {
        this.chemicals.push(chemical);
    },

    removeChemical: function(chemical) {
        for(var i = 0; i < this.chemicals.length; i++) {
            if(this.chemicals[i].id === chemical.id) {
                $("canvas").removeLayer(''+this.chemicals[i].id);
                this.chemicals.splice(i, 1);
            }
        }
    },

    updateChemical: function(chemical) {
        for(var i = 0; i < this.chemicals.length; i++) {
            if(this.chemicals[i].id === chemical.id) {
                this.chemicals[i] = chemical;
            }
        }
    }
};