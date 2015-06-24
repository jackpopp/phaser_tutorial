var HEIGHT = 600;
var WIDTH = 800;
var game = new Phaser.Game(800, 600, Phaser.AUTO, null);

var MainGame = function(game)
{
    this.game = game;
    this.platformData = [
        {x: 0, y: 570, width: 800},
        {x: 50, y: 200, width: 250},
        {x: 325, y: 400, width: 180},
        {x: 500, y: 200, width: 250}
    ];
    this.background;
    this.platforms;
    this.player;
}

MainGame.prototype = {
    preload: function()
    {
        this.game.load.image('background', '../assets/images/background.png');
        this.game.load.image('player', '../assets/images/player.png');
        this.game.load.image('platform', '../assets/images/platform.png'); 
        this.game.load.image('enemy', '../assets/images/enemy.png');
        this.game.load.image('star', '../assets/images/star.png');
    },

    create: function()
    {
        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.physics.arcade.gravity.y = 100;

        background = this.game.add.sprite(0, 0, 'background');
        background.height = HEIGHT;
        background.width = WIDTH;
        
        platforms = this.createPlatforms();
        player = this.createPlayer();
    },

    update: function()
    {

    },

    createPlatforms: function()
    {
        // create group
        var platforms = this.game.add.group();
        // enable physics on the body
        platforms.enableBody = true;

        // add platforms
        for (i = 0; i < this.platformData.length; i++)
        {
            p = this.platformData[i];
            platform = platforms.create(p.x, p.y, 'platform');
            platform.width = p.width;
            platform.body.immovable = true;
            platform.body.allowGravity = false;
        }

        return platforms;
    },

    createPlayer: function()
    {
        var player = this.game.add.sprite(0, 0, 'player');
        this.game.physics.arcade.enable(player);
        player.body.collideWorldBounds = true;

        return player;
    }

}

game.state.add('MainGame', MainGame);
game.state.start('MainGame');