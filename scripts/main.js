var GameState = {
    preload: function() {
       this.load.tilemap('map1', './assets/map1.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.image('tiles', './assets/tileset.png');
    },

    create: function() {
        this.map = this.add.tilemap('map1');
        this.map.addTilesetImage('tiles', 'tiles');

        this.layer = this.map.createLayer('terrain');
        this.layer.resizeWorld();
        this.layer.wrap = true;

        this.cursors = this.game.input.keyboard.createCursorKeys();
    },

    update: function() {
        if (this.input.mousePointer.isDown) {
            this.map.getTile(this.input.x, this.input.y, this.layer, false).index = 5
        }
    }
};

var game = new Phaser.Game(320, 320, Phaser.Auto);

game.state.add('GameState', GameState);
game.state.start('GameState');