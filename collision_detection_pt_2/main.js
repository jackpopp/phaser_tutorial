var HEIGHT = 600;
var WIDTH = 800;
var game = new Phaser.Game(800, 600, Phaser.AUTO, null);

var MainGame = function(game)
{
    this.game = game;
    this.platformData = [
        {x: 0, y: 570, width: 800, sprite: 'platform_floor'},
        {x: 50, y: 200, width: 240, sprite: 'platform_large'},
        {x: 325, y: 400, width: 160, sprite: 'platform_small'},
        {x: 500, y: 200, width: 240, sprite: 'platform_large'}
    ];
    this.background;
    this.platforms;
    this.player;
    this.stars;
    this.enemies;
    this.enemyAmount = 2;
}

MainGame.prototype = {

    preload: function()
    {
        this.game.load.image('background', '../assets/images/background.png');
        this.game.load.image('player', '../assets/images/player.png');
        this.game.load.image('platform_small', '../assets/images/platform_small.png'); 
        this.game.load.image('platform_large', '../assets/images/platform_large.png'); 
        this.game.load.image('platform_floor', '../assets/images/platform_floor.png'); 
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
        this.enemies = this.createEnemies();
    },

    update: function()
    {
        this.game.physics.arcade.collide(this.player, this.platforms);
        this.game.physics.arcade.collide(this.stars, this.platforms);
        this.game.physics.arcade.collide(this.enemies, this.platforms);
        this.game.physics.arcade.collide(this.player, this.stars, function(p, s) {
            s.destroy();
        });

        this.game.physics.arcade.collide(this.player, this.enemies, function(p) {
            p.kill();
            this.game.paused = true;
        }.bind(this));

        this.game.physics.arcade.collide(this.enemies, this.player, function(e, p) {
            p.kill();
            this.game.paused = true;
        }.bind(this));
        
        this.checkKeysDown();
        this.moveEnemies();
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
            platform = platforms.create(p.x, p.y, p.sprite);
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
            star = stars.create(currentX, HEIGHT - 100, 'star');
            star.body.collideWorldBounds = true;
            currentX += 20;
        }

        return stars;
    },

    createEnemies: function()
    {
        var enemies = this.game.add.group();
        enemies.enableBody = true;
        x = 200;

        for (var i = 0; i < this.enemyAmount; i++)
        {
            enemy = enemies.create(x, 0, 'enemy');
            enemy.body.collideWorldBounds = true;
            enemy.direction = 1;
            x += 200;
        }

        return enemies;
    },

    moveEnemies: function()
    {
        var enemies = this.enemies.children;
        for (var i = 0; i < enemies.length; i++)
        {
            enemy = enemies[i];

            if (enemy.x >= WIDTH - enemy.width && enemy.direction === 1)
            {
                enemy.direction = -1;
            }

            if (enemy.x <= 0 && enemy.direction === -1)
            {
                enemy.direction = 1;
            }

            if (enemy.direction === 1)
            {
                enemy.body.velocity.x = 100;
            }
            else
            {
                enemy.body.velocity.x = -100;
            }
        }
    }
};

game.state.add('MainGame', MainGame);
game.state.start('MainGame');

