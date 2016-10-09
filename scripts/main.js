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
        
        this.cursors = this.input.keyboard.createCursorKeys();

        for (var x in this.map.width)
            for(var y in this.map.height)
                this.map.getTile(x, y, this.main, true).visited = 0;

        this.bfs(this.map.searchTileIndex(this.tiles.start, 0, false, this.main))
    },

    update: function() {
        if (this.input.mousePointer.isDown) {
            this.map.putTile(this.tiles.finished, 
                              this.over.getTileX(this.input.worldX), 
                              this.over.getTileY(this.input.worldY));
        }
    },

    findNeighbors: function(tile) {
        var ans = new Array()
        var auxTile = null;

        if(tile.x + 1 < this.map.width) {
            auxTile = this.map.getTile(tile.x + 1, tile.y, this.main, true)
            if (aux.index > 0) ans.push(auxTile)
        }

        if(tile.x - 1 > 0) {
            auxTile = this.map.getTile(tile.x - 1, tile.y, this.main, true)
            if (aux.index > 0) ans.push(auxTile)
        }

        if(tile.y + 1 < this.map.height) {
            auxTile = this.map.getTile(tile.x, tile.y + 1, this.main, true)
            if (aux.index > 0) ans.push(auxTile)
        }

        if(tile.y - 1 > 0) {
            auxTile = this.map.getTile(tile.x, tile.y - 1, this.main, true)
            if (aux.index > 0) ans.push(auxTile)
        }

        return ans 
    },

    bfs: function(start) {
        console.log(start)
        if (start == null) return;
        
        var queue = new Array();

        start.visited = 2;
        queue.push(start);

        while (queue.length > 0) {
            current = queue.shift();

            neighbors = this.findNeighbors(current)
            for (i in neighbors) {
                if (neighbors[i].visited != 2) {
                    neighbors[i].visited = 2;
                    neighbors[i].traceback = current;
                    // pinta de amarelo
                    //this.map.putTile(this.tiles.visited, neighbor.x, neighbor.y);
                    queue.push(neighbors[i]);
                }
            }

            // pinta de azul
            //this.map.putTile(this.tiles.visited, current.x, current.y);
        }
    },

    a_star: function(start, end) {

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