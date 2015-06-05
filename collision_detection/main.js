var HEIGHT = 600;
var WIDTH = 800;
var game = new Phaser.Game(800, 600, Phaser.AUTO, null, { preload: preload, create: create, update: update });
var background;
var platforms;
var platformData = [
    {x: 0, y: 570, width: 800},
    {x: 50, y: 200, width: 250},
    {x: 325, y: 400, width: 180},
    {x: 500, y: 200, width: 250}
]
var player;

function preload()
{
    game.load.image('background', '../assets/images/background.png');
    game.load.image('player', '../assets/images/player.png');
    game.load.image('platform', '../assets/images/platform.png'); 
    game.load.image('enemy', '../assets/images/enemy.png');
    game.load.image('bullet', '../assets/images/bullet.png');
}

function create()
{
    game.physics.arcade.gravity.y = 100;

    background = game.add.sprite(0, 0, 'background');
    background.height = HEIGHT;
    background.width = WIDTH;
    
    platforms = createPlatforms();
    player = createPlayer();
}

function update()
{
    game.physics.arcade.collide(player, platforms);
    checkKeysDown();
}

function checkKeysDown()
{
    if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
    {
          player.body.velocity.x = -150;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
    {
         player.body.velocity.x = +150;
    }
    else if (game.input.keyboard.isDown(Phaser.Keyboard.UP) && ((player.y === (HEIGHT - player.height)) || player.body.touching.down))
    {
         player.body.velocity.y = -200;
    }    
    else
    {
         player.body.velocity.x = 0;
    }
}

function createPlatforms()
{
    // create group
    platforms = game.add.group();
    // enable physics on the body
    platforms.enableBody = true;

    // add platforms
    for (i = 0; i < platformData.length; i++)
    {
        p = platformData[i];
        platform = platforms.create(p.x, p.y, 'platform');
        platform.width = p.width
        platform.body.immovable = true;
        platform.body.allowGravity = false;
    }

    return platforms;
}

function createPlayer()
{
    player = game.add.sprite(0, 0, 'player');
    game.physics.arcade.enable(player);
    player.body.collideWorldBounds = true;

    return player;
}