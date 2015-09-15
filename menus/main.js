var HEIGHT = 600;
var WIDTH = 800;
var WORLD_BOUNDS = 1300;
var MAX_TIME = 60;
var VOLUME = 0.5
var game = new Phaser.Game(800, 600, Phaser.AUTO, null);

var MainGame = function(game)
{
    this.game = game;
    this.platformData = [
        {x: 0, y: 570, width: WORLD_BOUNDS, sprite: 'platform_floor'},
        {x: 50, y: 200, width: 240, sprite: 'platform_large'},
        {x: 325, y: 400, width: 160, sprite: 'platform_small'},
        {x: 500, y: 200, width: 240, sprite: 'platform_large'},
        {x: 825, y: 400, width: 160, sprite: 'platform_small'},
        {x: 1100, y: 200, width: 200, sprite: 'platform_large'}
    ];
    this.background;
    this.platforms;
    this.player;
    this.stars;
    this.enemies;
    this.enemyAmount = 2;
    this.sounds = {};
    this.volume = 0.5;

    this.starCount = 0;
    this.startTextCount = null;
    this.timeLeft = MAX_TIME;
    this.startTime = null;
    this.countDownText = null;

    WebFontConfig = {
        active: function() {
            this.createText();
        }.bind(this),

        google: {
            families: ['Chewy']
        }
    };
};

MainGame.prototype = {

    preload: function()
    {
        this.game.load.image('background', '../assets/images/background.png');
        this.game.load.image('platform_small', '../assets/images/platform_small.png'); 
        this.game.load.image('platform_large', '../assets/images/platform_large.png'); 
        this.game.load.image('platform_floor', '../assets/images/platform_floor.png'); 
        this.game.load.image('star', '../assets/images/star.png');
        this.game.load.spritesheet('enemy', '../assets/images/enemy_spritesheet.png', 79.0625, 74);
        this.game.load.spritesheet('player', '../assets/images/player_spritesheet.png', 79, 83);

        game.load.audio('jump', ['../assets/audio/jump.wav']);
        game.load.audio('land', ['../assets/audio/land.wav']);
        game.load.audio('pickup', ['../assets/audio/pickup.wav']);
        game.load.audio('die', ['../assets/audio/die.wav']);
        game.load.audio('theme', ['../assets/audio/theme.mp3']);

        game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    },

    create: function()
    {
        this.game.physics.arcade.gravity.y = 100;

        background = this.game.add.sprite(0, 0, 'background');
        background.height = 600;
        background.width = 2048;
        
        this.platforms = this.createPlatforms();
        this.player = this.createPlayer();
        this.stars = this.createStars();
        this.enemies = this.createEnemies();
        this.registerSounds();

        this.sounds['theme'].loop = true;
        this.sounds['theme'].play();

        this.game.world.setBounds(0, 0, WORLD_BOUNDS, HEIGHT);
        this.game.camera.follow(this.player);

        //this.createText();

        this.startTime = new Date().getTime();
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
            this.starCount++;
            s.destroy();
            this.sounds['pickup'].play();
        }.bind(this));

        this.game.physics.arcade.collide(this.player, this.enemies, function(p) {
            this.endGame(p);
        }.bind(this));

        this.game.physics.arcade.collide(this.enemies, this.player, function(e, p) {
            this.endGame(p);
        }.bind(this));

        this.checkKeysDown();
        this.moveEnemies();

        if (! this.player.body.touching.down)
            this.player.landed = false;

        this.timeLeft = (MAX_TIME - ((new Date().getTime() - this.startTime) / 1000)).toFixed(1);
        this.checkIfGameIsOver();

        this.renderText();
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

        player.animations.add('stand_left', [12, 13, 14, 15], 4, true);
        player.animations.add('stand_right', [0, 1, 2, 3], 4, true);
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
        while (currentX < WORLD_BOUNDS)
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

            if (enemy.x >= WORLD_BOUNDS - enemy.width && enemy.direction === 1)
            {
                enemy.direction = -1;
                enemy.animations.play('walk_left');
            }

            if (enemy.x <= 0 && enemy.direction === -1)
            {
                enemy.direction = 1;
                enemy.animations.play('walk_right');
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
    },

    registerSounds: function()
    {
        this.sounds['theme'] = this.game.add.sound('theme', this.volume);
        this.sounds['jump'] = this.game.add.sound('jump', this.volume);
        this.sounds['land'] = this.game.add.sound('land', this.volume);
        this.sounds['pickup'] = this.game.add.sound('pickup', this.volume);
        this.sounds['die'] = this.game.add.sound('die', this.volume);
    },

    createText: function() 
    {
        var style = { font: "400 18px Chewy", fill: "rgb(24, 24, 107)", align: "left" };

        this.startTextCount = game.add.text(0, 0, "Star Count: "+this.starCount, style);
        this.startTextCount.fixedToCamera = true;
        this.startTextCount.cameraOffset.setTo(10, 10);

        this.countDownText = game.add.text(0, 0, this.timeLeft+" seconds", style);
        this.countDownText.fixedToCamera = true;
        this.countDownText.cameraOffset.setTo(WIDTH - 100, 10);
    },

    renderText: function() 
    {
        if (this.startTextCount != null)
        {
            this.startTextCount.setText("Star Count: "+this.starCount);
            this.countDownText.setText(this.timeLeft+" seconds");
        }
    },

    checkIfGameIsOver: function()
    {
        if (this.timeLeft <= 0) {
            this.timeLeft = 0;
            this.renderText();
            this.game.state.start('StartMenu');
        }
    },

    endGame: function(p)
    {
        this.sounds['die'].play();
        p.kill();

        setTimeout(function() {
            this.sounds['theme'].pause();
            this.game.state.start('StartMenu', true, false, this.starCount);
        }.bind(this), 500);
    }

};

var StartMenu = function(game)
{
    this.game = game;
}

StartMenu.prototype = {

    mountainTile: null,
    hillTile: null,
    cloudsTile: null,
    buttonSound: null,
    score: null,

    init: function(score) {

        if (score !== undefined)
        {
            this.score = score;
        }
    },

    preload: function()
    {
        this.game.load.spritesheet('button', '../assets/images/button_sprite.png', 190, 49);
        this.game.load.image('background_plain', '../assets/images/background_plain.png');
        this.game.load.image('mountain', '../assets/images/mountain.png');
        this.game.load.image('hill', '../assets/images/platform_extra_large.png');
        this.game.load.image('clouds', '../assets/images/clouds2.png');
        this.game.load.audio('button', ['../assets/audio/button.wav']);
    },

    create: function()
    {
        this.game.stage.backgroundColor = '#d0f4f7'
        this.game.add.sprite(0, 0, 'background_plain');
        this.mountainTile = this.game.add.tileSprite(0, 250, 800, 336, 'mountain');
        this.hillTile = this.game.add.tileSprite(0, 570, 800, 30, 'hill');
        this.cloudsTile = this.game.add.tileSprite(0, 40, 800, 300, 'clouds');

        this.buttonSound = this.game.add.sound('button', VOLUME);

        button = this.game.add.button((this.game.camera.x + (WIDTH/2)) - 95, 450, 'button', function(){ this.startGame() }, this, 0, 1, 2);
        button.onInputOver.add(function(){ this.overButton() }, this);
        button.onInputOut.add(function(){ this.offButton() }, this);

        if (this.score)
        {
            text = this.game.add.text((this.game.camera.x + (WIDTH/2)) - 70, 462, "RESTART GAME", { font: "400 18px arial", fill: "#fff" });
        }
        else 
        {
            text = this.game.add.text((this.game.camera.x + (WIDTH/2)) - 57, 462, "START GAME", { font: "400 18px arial", fill: "#fff" });
        }
    },

    update: function()
    {
        this.mountainTile.tilePosition.x -= 0.5;  
        this.hillTile.tilePosition.x -= 0.7; 
        this.cloudsTile.tilePosition.x -= 0.3;   
    },

    overButton: function()
    {
        text.y = text.y + 3;
        this.buttonSound.play();
    },

    offButton: function()
    {
        text.y = text.y-3;
    },

    startGame: function()
    {
        this.game.state.start('MainGame');
    }

}

game.state.add('StartMenu', StartMenu);
game.state.add('MainGame', MainGame);

game.state.start('StartMenu');
