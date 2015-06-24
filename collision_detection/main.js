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
    this.stars;
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
        this.game.physics.arcade.gravity.y = 100;

        background = this.game.add.sprite(0, 0, 'background');
        background.height = HEIGHT;
        background.width = WIDTH;
        
        this.platforms = this.createPlatforms();
        this.player = this.createPlayer();
        this.stars = this.createStars();
    },

    update: function()
    {
        this.game.physics.arcade.collide(this.player, this.platforms);
        this.game.physics.arcade.collide(this.stars, this.platforms);
        this.game.physics.arcade.collide(this.player, this.stars, function(p, s) {
            s.destroy();
        });
        this.checkKeysDown();
    },

    checkKeysDown: function()
    {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        {
            this.player.body.velocity.x = -150;
        }
        else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        {
             this.player.body.velocity.x = +150;
        }
        else if (this.playerIsOnTheGround())
        {
             this.player.body.velocity.y = -200;
        }    
        else
        {
             this.player.body.velocity.x = 0;
        }
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
    },

    playerIsOnTheGround: function()
    {
        return this.game.input.keyboard.isDown(Phaser.Keyboard.UP) && 
            ((this.player.y === (HEIGHT - this.player.height)) || this.player.body.touching.down);
    },

    createStars: function()
    {
        var stars = this.game.add.group();
        stars.enableBody = true;

        currentX = 20;
        while (currentX < WIDTH)
        {
            star = stars.create(currentX, 0, 'star');
            star.body.collideWorldBounds = true;
            currentX += 20;
        }

        return stars;
    }
};

game.state.add('MainGame', MainGame);
game.state.start('MainGame');

