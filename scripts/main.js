var GameState = {
    preload: function() {
       this.load.tilemap('map1', './assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.image('tiles', './assets/tileset.png');
    },

    create: function() {
        this.map = this.add.tilemap('map1');
        this.map.addTilesetImage('tiles', 'tiles');

        this.main = this.map.createLayer('main');
        this.main.resizeWorld();
        this.main.wrap = true;

        this.over = this.map.createBlankLayer('over', 10, 10, 32, 32);
        this.over.alpha = 0.2;
        
        this.clearMap();

        this.input.mouse.capture = true;
        // this.cursors = this.input.keyboard.createCursorKeys();

        var keyaux;
        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.ZERO);
        keyaux.onDown.add(this.clearMap, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.ZERO);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.ONE);
        keyaux.onDown.add(this.bfs, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.ONE);

        keyaux = this.input.keyboard.addKey(Phaser.Keyboard.TWO);
        keyaux.onDown.add(this.dijkstra, this);
        this.input.keyboard.removeKeyCapture(Phaser.Keyboard.TWO);

        // keyaux = this.input.keyboard.addKey(Phaser.Keyboard.THREE);
        // keyaux.onDown.add(this.aStar, this);
        // this.input.keyboard.removeKeyCapture(Phaser.Keyboard.THREE);
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

    clearMap: function() {
        for (var x = 0;  x < this.map.width; x++) {
            for (var y = 0; y < this.map.height; y++) {
                this.map.getTile(x, y, this.main, true).visited = 0;
                this.map.getTile(x, y, this.main, true).traceback = null;
                this.map.getTile(x, y, this.main, true).distance = Infinity;1

                this.map.putTile(null, x, y, this.over);
            }
        }
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
            };
            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        while (parent.index != this.tiles.start) {
            // console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }
    },

    dijkstra: function() {
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
                    newDistance = current.distance + 2;
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
    },

    aStar: function() {
        this.clearMap();
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        var end = this.map.searchTileIndex(this.tiles.end, 0, false, this.main);
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

var game = new Phaser.Game(320, 320, Phaser.Auto);

game.state.add('GameState', GameState);
game.state.start('GameState');