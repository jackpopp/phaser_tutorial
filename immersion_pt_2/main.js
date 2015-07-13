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
    this.sounds = {};
    this.volume = 0.5;
};

MainGame.prototype = {

    preload: function()
    {
        this.game.load.image('background', '../assets/images/background.png');
        this.game.load.spritesheet('player', '../assets/images/player_spritesheet.png', 22, 35);
        this.game.load.image('platform_small', '../assets/images/platform_small.png'); 
        this.game.load.image('platform_large', '../assets/images/platform_large.png'); 
        this.game.load.image('platform_floor', '../assets/images/platform_floor.png'); 
        this.game.load.spritesheet('enemy', '../assets/images/enemy_spritesheet.png', 22, 35);
        this.game.load.image('star', '../assets/images/star.png');
        this.game.load.image('background', '../assets/images/background.png');

        game.load.audio('jump', ['../assets/audio/jump.wav']);
        game.load.audio('land', ['../assets/audio/land.wav']);
        game.load.audio('pickup', ['../assets/audio/pickup.wav']);
        game.load.audio('die', ['../assets/audio/die.wav']);
        game.load.audio('theme', ['../assets/audio/theme.mp3']);
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
        this.registerSounds();

        this.sounds['theme'].loop = true;
        this.sounds['theme'].play();
    },

    update: function()
    {
        this.game.physics.arcade.collide(this.player, this.platforms, function() {
            if (this.player.landed === false && this.player.body.touching.down)
            {
                this.player.landed = true;
                this.sounds['land'].play();
            }
        }.bind(this));

        this.game.physics.arcade.collide(this.stars, this.platforms, function(star) {
            this.tweenStar(star);
        }.bind(this));

        this.game.physics.arcade.collide(this.enemies, this.platforms);
        this.game.physics.arcade.collide(this.player, this.stars, function(p, s) {
            s.destroy();
            this.sounds['pickup'].play();
        }.bind(this));

        this.game.physics.arcade.collide(this.player, this.enemies, function(p) {
            p.kill();
            this.sounds['die'].play();
        }.bind(this));

        this.game.physics.arcade.collide(this.enemies, this.player, function(e, p) {
            p.kill();
            this.sounds['die'].play();
        }.bind(this));


        this.checkKeysDown();
        this.moveEnemies();

        if (! this.player.body.touching.down)
            this.player.landed = false;
    },

    checkKeysDown: function()
    {
        if (this.game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        {
            this.player.body.velocity.x = -150;
            this.player.animations.play('walk_left');
            this.player.direction = -1;
        }
        else if (this.game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        {
            this.player.body.velocity.x = +150;
            this.player.animations.play('walk_right');
            this.player.direction = 1;
        }
        else if (this.playerIsOnTheGround())
        {
            this.player.body.velocity.y = -200;
            this.player.landed = false;
            this.sounds['jump'].play()
        }
        else
        {
            this.player.body.velocity.x = 0;

            if (this.player.direction === -1)
            {
               this.player.animations.play('stand_left');
            }
            else
            {
               this.player.animations.play('stand_right');
            }
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

        player.animations.add('stand_left', [12, 13, 14, 15], 6, true);
        player.animations.add('stand_right', [0, 1, 2, 3], 6, true);
        player.animations.add('walk_right', [4, 5, 6, 7], 6, true);
        player.animations.add('walk_left', [8, 9, 10, 11], 6, true);
        
        player.animations.play('stand_right');

        player.landed = false;

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

    tweenStar: function(star)
    {
        tweenY = Math.floor(Math.random() * (8 - 4)) + 4;
        tweenDuration = 2000;
        tween = this.game.add.tween(star).to({ y: (star.y - tweenY)}, tweenDuration, 'Linear').to({ y: star.y}, tweenDuration, 'Linear').start();
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

            enemy.animations.add('walk_right', [4, 5, 6, 7], 6, true);
            enemy.animations.add('walk_left', [8, 9, 10, 11], 6, true);
            enemy.animations.play('walk_right');
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
                enemy.animations.play('walk_left');
            }

            if (enemy.x <= 0 && enemy.direction === -1)
            {
                enemy.direction = 1;
                enemy.animations.play('walk_right');
            }

            enemy.x += enemy.direction;
        }
    },

    registerSounds: function()
    {
        this.sounds['theme'] = this.game.add.sound('theme', this.volume - 0.1);
        this.sounds['jump'] = this.game.add.sound('jump', this.volume);
        this.sounds['land'] = this.game.add.sound('land', this.volume);
        this.sounds['pickup'] = this.game.add.sound('pickup', this.volume);
        this.sounds['die'] = this.game.add.sound('die', this.volume);
        this.sounds['die'].onStop.add(function() {
            this.game.paused = true;
        }.bind(this));
    }

    

};

game.state.add('MainGame', MainGame);
game.state.start('MainGame');
