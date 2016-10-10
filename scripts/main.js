var GameState = {
    preload: function() {
       this.load.tilemap('map1', './assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.tilemap('map2', './assets/map2.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.image('tiles', './assets/tileset.png');
    },

    create: function() {
        this.game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL

        // Objetos principais
        this.map = null;
        this.main = null;
        this.over = null;
        
        this.loadNewMap('map2');
        this.mudWeight = 2;
        this.heuristic = this.manhatanDistance;

        this.input.mouse.capture = true;
        // this.cursors = this.input.keyboard.createCursorKeys();

        this.info = this.add.text(0, 0, "", {});

        var keyaux;
        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.M);
        keyaux.onDown.add(this.changeMap, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.M);
        
        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.Q);
        keyaux.onDown.add(this.heuristicToManhatan, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.Q);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.W);
        keyaux.onDown.add(this.heuristicToPoint, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.W);
        
        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.A);
        keyaux.onDown.add(this.increaseMudWeight, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.A);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.D);
        keyaux.onDown.add(this.decreaseMudWeight, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.D);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.ZERO);
        keyaux.onDown.add(this.clearMap, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.ZERO);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
        keyaux.onDown.add(this.bfs, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.ONE);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.TWO);
        keyaux.onDown.add(this.dijkstra, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.TWO);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.THREE);
        keyaux.onDown.add(this.aStar, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.THREE);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.FOUR);
        keyaux.onDown.add(this.greedy, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.FOUR);

        this.clearMap();
    },

    update: function() {
        if (this.input.activePointer.withinGame) this.input.enabled = true;
        else this.input.enabled = false;

        if (this.input.activePointer.leftButton.isDown) {
            var endTile = this.map.searchTileIndex(this.tiles.end, 0, false, this.main);
            var newEndTile = this.map.getTileWorldXY(this.input.worldX, this.input.worldY, 32, 32, this.main);

            if (newEndTile.index != this.tiles.start && newEndTile.index != this.tiles.end) {
                newEndTile.iwas = newEndTile.index;
                this.map.putTile(endTile.iwas, endTile.x, endTile.y, this.main);
                this.map.putTile(this.tiles.end, newEndTile.x, newEndTile.y, this.main);
            }
        }

        if (this.input.activePointer.middleButton.isDown) {
            var startTile = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
            var newStartTile = this.map.getTileWorldXY(this.input.worldX, this.input.worldY, 32, 32, this.main);

            if (newStartTile.index != this.tiles.start && newStartTile.index != this.tiles.end) {
                newStartTile.iwas = newStartTile.index;
                this.map.putTile(startTile.iwas, startTile.x, startTile.y, this.main);
                this.map.putTile(this.tiles.start, newStartTile.x, newStartTile.y, this.main);
            }
        }
    },

    loadNewMap: function(mapName) {
        if (this.map != null) this.map.destroy()
        if (this.main != null) this.main.destroy()
        if (this.over != null) this.over.destroy()

        this.map = this.add.tilemap(mapName);
        this.map.addTilesetImage('tiles', 'tiles');

        this.main = this.map.createLayer('main_' + mapName);
        this.main.resizeWorld();
        this.main.wrap = true;

        this.over = this.map.createBlankLayer('over_' + mapName, this.map.width, this.map.height, this.map.tileWidth, this.map.tileHeight);
        this.over.alpha = 0.2;

        this.main.scale(this.map.widthInPixels/1750, this.map.heightInPixels/1750);
        this.over.scale(this.map.widthInPixels/1750, this.map.heightInPixels/1750);
    },

    changeMap: function() {
        if (this.map.key == 'map1') {
            this.loadNewMap('map2');
        } else if (this.map.key == 'map2') {
            this.loadNewMap('map1');
        } else {
            console.log("Failed to change maps.");
        }
    },

    clearMap: function() {
        for (var x = 0;  x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                this.map.getTile(x, y, this.main, true).visited = 0;
                this.map.getTile(x, y, this.main, true).traceback = null;
                this.map.getTile(x, y, this.main, true).distance = Infinity;

                this.map.putTile(null, x, y, this.over);
            }
        }

        this.info.text = "";
        // console.log("Map cleared");
    },

    findNeighbors: function(tile) {
        var ans = new Array();
        if(tile.y - 1 >= 0)
            ans.push(this.map.getTile(tile.x, tile.y - 1, this.main, true));

        if(tile.y + 1 < this.map.height)
            ans.push(this.map.getTile(tile.x, tile.y + 1, this.main, true));

        if(tile.x - 1 >= 0)
            ans.push(this.map.getTile(tile.x - 1, tile.y, this.main, true));

        if(tile.x + 1 < this.map.width)
            ans.push(this.map.getTile(tile.x + 1, tile.y, this.main, true));

        return ans;
    },

    bfs: function() {
        var stime = this.time.now;
        var iterations = 0;
        this.clearMap();
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        if (start == null) return;
        
        var parent = null;
        var queue = new Array();

        start.visited = 2;
        start.traceback = null;
        queue.push(start);

        while (queue.length > 0) {
            var current = queue.shift();
            // console.log(current.index);

            var neighbors = this.findNeighbors(current)
            for (var i in neighbors) {
                if (neighbors[i].index == this.tiles.wall 
                    || neighbors[i].index == this.tiles.wall2) continue;

                if (neighbors[i].visited != 2) {
                    neighbors[i].visited = 2;
                    neighbors[i].traceback = current;

                    if (neighbors[i].index == this.tiles.end) {
                        parent = neighbors[i];
                        break;
                    }
                    // pinta de amarelo
                    this.map.putTile(this.tiles.visited, neighbors[i].x, neighbors[i].y, this.over);
                    queue.push(neighbors[i]);
                }
                iterations++;
            }
            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
            if (parent != null && parent.index == this.tiles.end) break;
        }

        console.log("!!!PATH!!!");
        while (parent.index != this.tiles.start) {
            // console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }

        this.info.text = "Iterações: " + iterations + "\n" +
                         "Tempo: " + this.time.elapsedSince(stime);
    },

    dijkstra: function() {
        var stime = this.time.now;
        var iterations = 0;
        this.clearMap();
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        var end = this.map.searchTileIndex(this.tiles.end, 0, false, this.main);
        if (start == null || end == null) return;
        
        var parent = null;
        var queue = new Array();

        start.traceback = null;
        start.distance = 0;
        queue.push(start);

        while (queue.length > 0) {
            var current = queue.shift();
            
            if (current.index == this.tiles.end) break;

            var neighbors = this.findNeighbors(current)
            for (var i in neighbors) {
                if (neighbors[i].index == this.tiles.wall 
                    || neighbors[i].index == this.tiles.wall2) continue;

                var newDistance;
                if (neighbors[i].index == this.tiles.mud)
                    newDistance = current.distance + this.mudWeight;
                else
                    newDistance = current.distance + 1;

                if (neighbors[i].distance > newDistance) {
                    neighbors[i].distance = newDistance;
                    neighbors[i].traceback = current;

                    queue.push(neighbors[i]);
                    queue.sort(function(a, b) { return a.distance > b.distance });
                    
                    // pinta de amarelo
                    this.map.putTile(this.tiles.visited, neighbors[i].x, neighbors[i].y, this.over);
                }
                iterations++;
            }
            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        parent = end;
        while (parent.index != this.tiles.start) {
            // console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }

        this.info.text = "Iterações: " + iterations + "\n" +
                         "Tempo: " + this.time.elapsedSince(stime);
    },

    aStar: function() {
        var stime = this.time.now;
        var iterations = 0;
        this.clearMap();
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        var end = this.map.searchTileIndex(this.tiles.end, 0, false, this.main);
        if (start == null || end == null) return;
        
        var parent = null;
        var queue = new Array();

        start.traceback = null;
        start.distance = 0;
        queue.push(start);

        while (queue.length > 0) {
            var current = queue.shift();
            
            if (current.index == this.tiles.end) break;

            var neighbors = this.findNeighbors(current)
            for (var i in neighbors) {
                if (neighbors[i].index == this.tiles.wall 
                    || neighbors[i].index == this.tiles.wall2) continue;

                var newDistance;
                if (neighbors[i].index == this.tiles.mud)
                    newDistance = current.distance + this.mudWeight + this.heuristic(end, neighbors[i]);
                else
                    newDistance = current.distance + 1 + this.heuristic(end, neighbors[i]);

                if (neighbors[i].distance > newDistance) {
                    neighbors[i].distance = newDistance;
                    neighbors[i].traceback = current;

                    queue.push(neighbors[i]);
                    queue.sort(function(a, b) { return a.distance > b.distance });
                    
                    // pinta de amarelo
                    this.map.putTile(this.tiles.visited, neighbors[i].x, neighbors[i].y, this.over);
                }
                iterations++;
            }
            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        parent = end;
        while (parent.index != this.tiles.start) {
            // console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }

        this.info.text = "Iterações: " + iterations + "\n" +
                         "Tempo: " + this.time.elapsedSince(stime);
    },

    greedy: function() {
        var stime = this.time.now;
        var iterations = 0;
        this.clearMap();
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        var end = this.map.searchTileIndex(this.tiles.end, 0, false, this.main);
        if (start == null || end == null) return;
        
        var parent = null;
        var queue = new Array();

        start.traceback = null;
        start.distance = 0;
        queue.push(start);

        while (queue.length > 0) {
            var current = queue.shift();
            
            if (current.index == this.tiles.end) break;

            var neighbors = this.findNeighbors(current)
            for (var i in neighbors) {
                if (neighbors[i].index == this.tiles.wall 
                    || neighbors[i].index == this.tiles.wall2) continue;

                var newDistance;
                if (neighbors[i].index == this.tiles.mud)
                    newDistance = this.mudWeight + this.heuristic(end, neighbors[i]);
                else
                    newDistance = 1 + this.heuristic(end, neighbors[i]);

                if (neighbors[i].distance > newDistance) {
                    neighbors[i].distance = newDistance;
                    neighbors[i].traceback = current;

                    queue.push(neighbors[i]);
                    queue.sort(function(a, b) { return a.distance > b.distance });
                    
                    // pinta de amarelo
                    this.map.putTile(this.tiles.visited, neighbors[i].x, neighbors[i].y, this.over);
                }

                iterations++;
            }
            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        parent = end;
        while (parent.index != this.tiles.start) {
            // console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }

        this.info.text = "Iterações: " + iterations + "\n" +
                         "Tempo: " + this.time.elapsedSince(stime);
    },

    manhatanDistance: function(a, b) {
        return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
    },

    pointDistance: function(a, b) {
        return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
    },

    heuristicToManhatan: function() {
        this.heuristic = this.manhatanDistance;
    },

    heuristicToPoint: function() {
        this.heuristic = this.pointDistance;
    },

    increaseMudWeight: function() {
        this.mudWeight++;
    },

    decreaseMudWeight: function() {
        this.mudWeight--;
    },

    tiles: {
        finished: 1,
        start:    2,
        empty:    3,
        mud:      4,
        end:      5,
        visited:  6,
        wall:     7,
        wall2:    8
    }
};

var game = new Phaser.Game(1750, 1750, Phaser.Auto);

game.state.add('GameState', GameState);
game.state.start('GameState');