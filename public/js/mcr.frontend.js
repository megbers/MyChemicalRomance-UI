
$(document).ready(function(){
	var suspendRedraw = false;
    var currentId = 1;

    var hotbar1 = new Hotbar();

	mcr.load();
    hotbar1.init(200, 25);

	mcr.ready.done(function() {
		'use strict';
		//------Game Loop-----------
        var ONE_FRAME_TIME = 1000 / 60;

        var mainLoop = function() {
            drawGame();
        };

        var drawGame = function() {
            if(!suspendRedraw) {
                resetUI();
                drawAllChemicals();
            }
        };

        setInterval( mainLoop, ONE_FRAME_TIME );
        //--------End Game Loop------


        var clickedDownHotbar = false;
        var clickedUpHotbar = false;
        var selectedHotbarChemical = null;
        var selectedHotbarIndex = -1;
        $('canvas').mousedown(function(event) {
            if (hotbar1.intersects(event.offsetX, event.offsetY)) {
                clickedDownHotbar = true;
                selectedHotbarIndex = hotbar1.getIndexFromCoord(event.offsetY);
                selectedHotbarChemical = hotbar1.getCompoundFromSlot(selectedHotbarIndex);
            }
        });

        $('canvas').mouseup(function(event) {
            if (hotbar1.intersects(event.offsetX, event.offsetY)) {
                clickedUpHotbar = true;
            }
            checkHotbarInteraction(event);
            clickedDownHotbar = clickedUpHotbar = false;
        });

        function checkHotbarInteraction(event) {
            if (clickedDownHotbar && clickedUpHotbar) { //clicked down and up on hotbar
                addChemicalToWorkspace(selectedHotbarChemical.symbol);
                var result = mcr.add(selectedHotbarChemical.symbol);
                checkForDiscovery(result);
            } else if (clickedDownHotbar && !clickedUpHotbar) { //clicked hotbar and dragged off
                hotbar1.removeChemicalFromSlot(selectedHotbarIndex);
            } else if (!clickedDownHotbar && clickedUpHotbar) { //clicked workspace and dragged to hotbar

            }
        }

        function checkForDiscovery(result) {
            if(result.discovered.length > 0) {
                var x = Math.floor((Math.random()*300)+275);
                var y = Math.floor((Math.random()*200)+100);
                var group = result.discovered[0].group;
                var tabSelect = "";
                if (group === "covalent") {
                    tabSelect = "#tabs-3";
                } else if (group === "ionic") {
                    tabSelect = "#tabs-2";
                } else if (group === "cation") {
                    tabSelect = "#tabs-4";
                } else if (group === "anion") {
                    tabSelect = "#tabs-5";
                }
                renderCompoundsTabs(tabSelect,mcr.discoveredCompounds(group));
                workspace.removeAll();
                var foundChemical = {
                    id: currentId++,
                    symbol: result.discovered[0].formula,
                    x: x,
                    y: y,
                    elements: result.discovered[0].elements,
                    name: result.discovered[0].name
                };
                resetUI();
                workspace.addChemical(foundChemical);
                drawChemical(foundChemical, x, y);
                mcr.add(foundChemical.symbol);
                drawChemicals(foundChemical.elements);
            }
        }

        function drawAllChemicals() {
            for(var i = 0; i < workspace.chemicals.length; i++) {
                var chemical = workspace.chemicals[i];
                drawChemical(chemical, chemical.x, chemical.y);
            }
        }

        function renderCompoundsTabs(tabSelector, compounds) {
            $(tabSelector).empty();
            for(var i = 0; i < compounds.length; i++) {
                $(tabSelector).append('<div class=\"sym\" id=\"' + compounds[i].formula + '\">' +transformNumbers(compounds[i].formula) + ' - ' + compounds[i].name + '</div>');
            }
            $(tabSelector + "-count").empty();
            $(tabSelector + "-count").append(compounds.length);
        }

        $( "#tabs" ).tabs();

        $.jCanvas.extend({
            name: "drawChemicalElement",
            props: {},
            fn: function(ctx, params) {

                var symbolWidth = getChemicalNamePixelWidth(params.symbol);

                $('canvas')
                .drawRect({
                    fillStyle: params.fillStyle,
                    strokeStyle: '#000',
                    strokeWidth: 1,
                    x: params.x, y: params.y,
                    width: symbolWidth+10,
                    height: params.height
                }).drawText({
                    name: 'myText',
                    fillStyle: "#36c",
                    strokeStyle: "#25a",
                    strokeWidth: 2,
                    x: params.x, y: params.y,
                    font: "36pt Verdana, sans-serif",
                    text: params.symbol
                });



                $.jCanvas.detectEvents(this, ctx, params);
            }
        });

        function resetUI() {
            $("canvas").removeLayers();
            $("canvas").clearCanvas();


            $("canvas").drawImage({
                name:'background',
                layer: true,
                source: "images/blackboard.jpg",
                x: 0, y: 0,
                scaleX : 1.5
            });

            $("canvas").drawImage({
                name:'controls',
                layer: true,
                source: "images/reactor_area.jpg",
                x: 450, y: 185,
                scale: 1
            });

            $("canvas").drawImage({
                name:'controls',
                layer: true,
                source: "images/trashcan_full.png",
                x: 450, y: 375,
                scale: 0.3
            });

            hotbar1.render();

    //        $("canvas").drawImage({
    //            name:'controls',
    //            layer: true,
    //            source: "images/search.png",
    //            x: 455, y: 375,
    //            scale: 0.5,
    //            click : function(layer) {
    //                $("#searchDialog").dialog('open');
    //            }
    //        });

    //        $("canvas").drawImage({
    //            name:'controls',
    //            layer: true,
    //            source: "images/help.png",
    //            x: 25, y: 375,
    //            scale: 0.3
    //        });



            drawPotentialCount(mcr.undiscoveredCompounds());

        }

        function drawPotentialCount(count) {
            $("canvas").removeLayer("potentialCount");
            $("canvas").drawText({
                name: "potentialCount",
                layer: true,
                fillStyle: "#fff",
                x: 50, y: 15,
                font: "10pt Verdana, sans-serif",
                text: "Potential: " + count
            });
        }

        //Attach Events to Table
        $(".symbol").each(function(i, periodicElement) {
            debugger;
            var symbol = $(this).find("abbr").text();
            $(periodicElement).on('click', function(event) {
                addChemicalToHotbar(symbol);
            });
        });

        function drawChemicals(elements) {
            var keys = _.keys(elements);
            for (var i=0;i < keys.length; i++) {
                var elementSymbol = keys[i];
                $(".symbol").each(function(j, periodicElement) {
                    var symbol = $(this).find("abbr").text();
                    if (symbol === elementSymbol && mcr.undiscoveredCompounds(symbol) === 0) {
                        $(this).find("abbr").addClass('noPotential');
                    }
                });
            }
        }

        function createChemical(symbol) {
            return {
                id: currentId++,
                symbol: symbol,
                x: 0,
                y: 0
            }
        }

        function addChemicalToHotbar(symbol) {
            var freeHotbarIndex = hotbar1.getNextAvailableIndex();
            var chemical = createChemical(symbol);
            if (freeHotbarIndex !== -1) {
                hotbar1.addChemicalToSlot(chemical, freeHotbarIndex);
            }
        }

        function addChemicalToWorkspace(addedSymbol) {
            var symbol = addedSymbol ? addedSymbol : $('#chemSymbol').val();

            if(symbol === '') {
                return;
            }

            var x = Math.floor((Math.random()*350)+275);
            var y = Math.floor((Math.random()*200)+100);
            var chemical = {
                id: currentId++,
                symbol: symbol,
                x: x,
                y: y
            };

            workspace.addChemical(chemical);
            drawChemical(chemical, x, y);
        }

        function drawChemical(chemical,x,y) {
            var x = x !==undefined? x : Math.floor((Math.random()*300)+275);
            var y = y!==undefined? y : Math.floor((Math.random()*200)+100);
            $("canvas").drawChemicalElement({
                name: ''+chemical.id,
                chemical: chemical,
                layer: true,
                draggable: true,
                fillStyle: "#fff",
                symbol: transformNumbers(chemical.symbol),
                width: 50,
                height: 50,
                x: x,
                y: y,
                dragstop: function(event) {
                    debugger;
                    if (event.x > 425 && event.x < 475 && event.y > 350) {


                        workspace.removeChemical(chemical);
                    }
                    if (hotbar1.intersects(event.x, event.y)) {
                        hotbar1.addChemicalToSlot(chemical, hotbar1.getIndexFromCoord(event.y));
                        workspace.removeChemical(chemical);
                    }
                    suspendRedraw = false;
                },
                mousedown: function(event) {
                    suspendRedraw = true;
                },
                drag: function(layer) {
                    var chemical = layer.chemical;
                    chemical.x = layer.x;
                    chemical.y = layer.y;
                    workspace.updateChemical(chemical);
                }
            });
	    }

        var searchDialog = $( "#searchDialog" ).dialog({
            autoOpen: false,
            draggable: false,
            modal: true,
            resizable:false,
            title:'Search',
            position: {at:'center', of:$("canvas")}
        });

	});
});

