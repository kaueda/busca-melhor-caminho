var GameState = {
    preload: function() {
       this.load.tilemap('map1', './assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.image('tiles', './assets/tileset.png');
    },

    create: function() {
        this.input.mouse.capture = true;

        this.map = this.add.tilemap('map1');
        this.map.addTilesetImage('tiles', 'tiles');

        this.main = this.map.createLayer('main');
        this.main.resizeWorld();
        this.main.wrap = true;

        this.over = this.map.createBlankLayer('over', 10, 10, 32, 32);
        this.over.alpha = 0.2;
        
        this.cursors = this.input.keyboard.createCursorKeys();

        for (var x in this.map.width) {
            for(var y in this.map.height) {
                this.map.getTile(x, y, this.main, true).visited = 0;
                this.map.getTile(x, y, this.main, true).distance = Infinity;
            }
        }

        var keyaux;
        
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
            this.map.putTile(this.tiles.empty, 
                              endTile.x, 
                              endTile.y,
                              this.main);

            this.map.putTile(this.tiles.end, 
                              this.main.getTileX(this.input.worldX), 
                              this.main.getTileY(this.input.worldY),
                              this.main);
        }

        if (this.input.activePointer.middleButton.isDown) {
            var startTile = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
            this.map.putTile(this.tiles.empty, 
                              startTile.x, 
                              startTile.y,
                              this.main);

            this.map.putTile(this.tiles.start, 
                              this.main.getTileX(this.input.worldX), 
                              this.main.getTileY(this.input.worldY),
                              this.main);
        }
    },

    findNeighbors: function(tile) {
        var ans = new Array()
        var auxTile = null;

        if(tile.y - 1 >= 0) {
            auxTile = this.map.getTile(tile.x, tile.y - 1, this.main, true)
            if (auxTile.index > 0) ans.push(auxTile)
        }

        if(tile.y + 1 < this.map.height) {
            auxTile = this.map.getTile(tile.x, tile.y + 1, this.main, true)
            if (auxTile.index > 0) ans.push(auxTile)
        }

        if(tile.x - 1 >= 0) {
            auxTile = this.map.getTile(tile.x - 1, tile.y, this.main, true)
            if (auxTile.index > 0) ans.push(auxTile)
        }

        if(tile.x + 1 < this.map.width) {
            auxTile = this.map.getTile(tile.x + 1, tile.y, this.main, true)
            if (auxTile.index > 0) ans.push(auxTile)
        }

        return ans 
    },

    bfs: function() {
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        if (start == null) return;
        
        var parent = null;
        var queue = new Array();

        start.visited = 2;
        start.traceback = null;
        queue.push(start);

        while (queue.length > 0) {
            current = queue.shift();
            // console.log(current.index);

            neighbors = this.findNeighbors(current)
            for (i in neighbors) {
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
            }

            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        while (parent.index != this.tiles.start) {
            console.log(parent);
            this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
            parent = parent.traceback;
        }
    },

    dijkstra: function() {
        var start = this.map.searchTileIndex(this.tiles.start, 0, false, this.main);
        if (start == null) return;
        
        var parent = null;
        var queue = new Array();

        start.traceback = null;
        start.distance = 0;
        queue.push(start);

        while (queue.length > 0) {
            current = queue.shift();
            
            if (current.index == this.tiles.end) break;

            neighbors = this.findNeighbors(current)
            for (i in neighbors) {
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
                }
                // pinta de amarelo
                this.map.putTile(this.tiles.visited, neighbors[i].x, neighbors[i].y, this.over);
                queue.push(neighbors[i]);
                queue.sort(function(a, b) { return a.distance < b.distance })
            }

            // pinta de azul
            this.map.putTile(this.tiles.finished, current.x, current.y, this.over);
        }

        // while (parent.index != this.tiles.start) {
        //     console.log(parent);
        //     this.map.putTile(this.tiles.end, parent.x, parent.y, this.over);
        //     parent = parent.traceback;
        // }
    },

    aStar: function() {
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