var GameState = {
    preload: function() {
       this.load.tilemap('map1', 'map1.json', null, Phaser.Tilemap.TILED_JSON);
       this.load.image('tiles', 'tileset.png');
    },

    create: function() {
        map = this.add.tilemap('map1');
        map.addTilesetImage('tiles', 'tiles');

        layer = map.createLayer('terrain');
        layer.resizeWorld();
        layer.wrap = true;
    },

    update: function() {
    }
};

var game = new Phaser.Game(320, 320, Phaser.Auto);

game.state.add('GameState', GameState);
game.state.start('GameState');