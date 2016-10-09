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

        for (i in this.map.tiles) this.map.tiles[i].visited = 0;
        this.bfs(this.map.searchTileIndex(this.tiles.start))
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

        if(tile.x + 1 < this.map.width)
            ans.push(new Phaser.Point(tile.x + 1, tile.y));

        if(tile.x - 1 > 0)
            ans.push(new Phaser.Point(tile.x - 1, tile.y));
        
        if(tile.y + 1 < this.map.height)
            ans.push(new Phaser.Point(tile.x, tile.y + 1));
        
        if(tile.y - 1 > 0)
            ans.push(new Phaser.Point(tile.x, tile.y - 1));
        
        return ans 
    },

    bfs: function(start) {
        console.log(start)
        var queue = new Array();

        start.visited = 2;
        queue.push(start);

        while (queue.length > 0) {
            current = queue.shift();

            neighbors = findNeighbors(current)
            for (i in neighbors) {
                neighbor = this.map.getTile(neighbors[i].x, neighbors[i].y)
                if (neighbor.visited != 2) {
                    neighbor.visited = 2;
                    neighbor.traceback = current;
                    // pinta de amarelo
                    //this.over.putTile(this.tiles.visited, neighbor.x, neighbor.y);
                    queue.push(neighbor);
                }
            }

            // pinta de azul
            //this.over.putTile(this.tiles.visited, current.x, current.y);
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