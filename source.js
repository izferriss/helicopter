//canvas dimensions
const canvas=
{
    w: 1024,
    h: 768
};

//default player positions
var startPosX = 128;
var startPosY = 128;

//player
var player =
{
    w: 32,
    h: 32,
    x: startPosX,
    y: startPosY,
    velX: 5,
    velY: 5,
    gravity: 7.5
};

//Obstacle array
var obstacles = [];

//Game states
var isStartGame = true;
var isPlaying = false;
var isGameOver = false;

//canvas context
var ctx;

//Game speed
var gameSpeed = 0.8;

//frame rate stuff
var framesLastSecond = 0;
var currentSecond = 0;
var lastFrameTime = 0;
var currentFrameTime = 0;
var frameCount = 0;
var delta;

//default obstacle variables
var borderHeight = 20;
var obstacleHeightMultiplier = 0.8;
var obstacleWidthMultiplier = 0.1;
var obstacleSpeed = 3;

//input handler array
let keysDown = {};

//POINTS!
var score = 0;

//Runs once page loaded
window.onload = init();

//Event listeners
    //keydown
addEventListener("keydown", function(event)
{
    keysDown[event.key] = true;
    console.log(event.key + " was pressed");
});
    //keyup
addEventListener("keyup", function(event)
{
    delete keysDown[event.key];
    console.log(event.key + " was released");
});
    //click down
addEventListener("mousedown", function(event)
{
    keysDown[event.type] = true;
    console.log("mouse was clicked");
});
    //click up
addEventListener("mouseup", function(event)
{
    delete keysDown["mousedown"];
    console.log("mouse was released");
});

//make the canvas and start the loop
function init()
{
    ctx = document.getElementById("canvas").getContext("2d");
    document.getElementById("canvas").setAttribute("width", canvas.w);
    document.getElementById("canvas").setAttribute("height", canvas.h);

    gameLoop();
}

//draw things depending on the gamestate
function draw()
{
    if(isPlaying)
    {
        drawCanvasBG("white");
        drawTopAndBottom();
        drawPlayer();
        drawObstacles();
        drawStats();
    }
    if(isStartGame)
    {
        drawCanvasBG("white");
        drawTopAndBottom();
        drawStartPrompt();
    }
    if(isGameOver)
    {
        drawCanvasBG("black");
        drawTopAndBottom();
        drawGameOver();
    }
}

//handle user input and difficulty
function update(timePassed)
{
    handleInput(timePassed);

    //normal mode
    if(score % 120 == 0 && score < 5000 && isPlaying)
    {
        createObstacle();
    }
    //tougher
    else if(score % 90 == 0 && score >= 5000 && score < 10000 && isPlaying)
    {
        createObstacle();
    }
    //likely impossible
    else if(score % 60 == 0 && score >= 10000 && score < 1000000 && isPlaying)
    {
        createObstacle();
    }
    //totally screwed
    else
    {
        if(score % 30 == 0 && isPlaying && score >= 1000000)
        {
            createObstacle();
        }
    }

    //update obstacle positions
    moveObstacle(timePassed);

    //delete any that have moved out of context
    deleteObstacle();
}

//bread and butter
function gameLoop()
{
    //do FPS stuff
    currentFrameTime = Date.now();
    delta = currentFrameTime - lastFrameTime;
    delta = Math.min(delta, gameSpeed);
    var sec = Math.floor(Date.now() / 1000);

    if(sec != currentSecond)
    {
        currentSecond = sec;
        framesLastSecond = frameCount;
        frameCount = 1;
    }
    else
    {
        frameCount++;
    }

    //You get a point for each gameloop you survive.
    if(isPlaying)
    {
        score++;
    }

    //If it's game over, reset player position
    if(isGameOver)
    {
        player.x = startPosX;
        player.y = startPosY;
    }

    //Clear
    ctx.clearRect(0,0, canvas.w, canvas.h);
    //Process
    update(delta);
    //Draw
    draw();
    //Play it again, Sam!
    requestAnimationFrame(gameLoop);
}

//Draw splash
function drawStartPrompt()
{
    ctx.fillStyle = "green";
    ctx.fillRect(canvas.w/4, canvas.h/4, canvas.w/2, canvas.h/2);
    ctx.fillStyle= "black";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("Press [Space] to start!", canvas.w/2, canvas.h/2);
    ctx.fillText("Controls", canvas.w/2, canvas.h/2 + 40);
    ctx.fillText("---------------", canvas.w/2, canvas.h/2 + 50);
    ctx.fillText("  [a]                left ", canvas.w/2, canvas.h/2 + 70);
    ctx.fillText("  [d]               right ", canvas.w/2, canvas.h/2 + 90);
    ctx.fillText(" click     fight gravity", canvas.w/2, canvas.h/2 + 110);
}

//Draw death
function drawGameOver()
{
    ctx.fillStyle = "red";
    ctx.fillRect(canvas.w/4, canvas.h/4, canvas.w/2, canvas.h/2);
    ctx.fillStyle= "black";
    ctx.font = "20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("u ded @ " + score + " pts", canvas.w/2, canvas.h/2);
    deleteAllObstacles();
    ctx.fillText("Press [Space] to do better", canvas.w/2, canvas.h/2 + 20);
    ctx.fillText("Press [Esc] to go back to the start screen", canvas.w/2, canvas.h/2 + 40);
}

//Draw bg color
function drawCanvasBG(color)
{
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.w, canvas.h)
}

//Draw player
function drawPlayer()
{
    ctx.fillStyle = "green";
    ctx.fillRect(player.x, player.y, player.w, player.h);
}

//Draw top and bottom borders
function drawTopAndBottom()
{
    ctx.fillStyle = "red";
    ctx.fillRect(0,0, canvas.w, borderHeight);
    ctx.fillRect(0, canvas.h - borderHeight, canvas.w, borderHeight);
}

//Draw obstacles
function drawObstacles()
{
    for(let i = obstacles.length - 1; i >= 0; i--)
    {
        ctx.fillStyle = "red";
        ctx.fillRect(obstacles[i].x, obstacles[i].y, obstacles[i].w, obstacles[i].h);
    }
}

//Draw text info
function drawStats()
{
    ctx.fillStyle= "black";
    ctx.font = "20px monospace";
    ctx.textAlign = "left";
    ctx.fillText("FPS: " + Math.floor(framesLastSecond) + " | # of Obstacles: " + obstacles.length, 0, 15);
    ctx.textAlign = "right";
    ctx.fillText("Score: " + score, canvas.w, 15);
}

//Handle user input (key and mouse) and also apply gravity to player if isPlaying
function handleInput(timePassed)
{
    if(('a' in keysDown || 'A' in keysDown) && isPlaying)
    {
        player.x -= (player.velX * timePassed);
    }
    if(('d' in keysDown || 'D' in keysDown) && isPlaying)
    {
        player.x += (player.velX * timePassed);
    }
    if('mousedown' in keysDown && isPlaying)
    {
        player.y -= ((player.velY + player.gravity) * timePassed);
    }
    if(' ' in keysDown && isStartGame)
    {
        isStartGame = false;
        isPlaying = true;
        frameCount = 0;
        player.y = canvas.h / 3;
    }
    if(' ' in keysDown && isGameOver)
    {
        isGameOver = false;
        frameCount = 0;
        score = 0;
        isPlaying = true;
    }
    if('Escape' in keysDown && isGameOver)
    {
        isGameOver = false;
        frameCount = 0;
        score = 0;
        isStartGame = true;
    }

    //apply gravity
    if(isPlaying)
    {
        player.y += (player.gravity * timePassed);
        checkCollisions();
    }
}

//Check to see if anything got bumped into
function checkCollisions()
{
    var rockBottom = canvas.h - borderHeight;

    //Canvas left
    if(player.x < 0)
    {
        player.x = 0;
    }

    //Canvas right
    if(player.x + player.w > canvas.w)
    {
        player.x = canvas.w - player.w;
    }

    //Border top (g.o.)
    if(player.y < borderHeight)
    {
        player.y = borderHeight;
        isPlaying = false;
        isGameOver = true;
    }

    //border bottom (g.o.)
    if(player.y + player.h > rockBottom)
    {
        player.y = rockBottom - player.h;
        isPlaying = false;
        isGameOver = true;
    }

    //any obstacle (g.o.)
    for(let i = 0; i < obstacles.length; i++)
    {
        if(player.x < obstacles[i].x + obstacles[i].w &&
            player.x + player.w > obstacles[i].x &&
            player.y < obstacles[i].y + obstacles[i].h &&
            player.h + player.y > obstacles[i].y)
            {
                isPlaying = false;
                isGameOver = true;
            }
    }
}

//returns a random height for an obstacle
function getRandomH()
{
    return Math.floor(Math.random() * canvas.h * obstacleHeightMultiplier);
}

//returns a random width for an obstacle
function getRandomW()
{
    return Math.floor(Math.random() * canvas.w * obstacleWidthMultiplier + 40);
}

//create an obstacle and put it at the front of the array
function createObstacle()
{
    var obstacle =
    {
        w: getRandomW(),
        h: getRandomH(),
        x: canvas.w,    //starts on the right side
        y: topOrBottom(),
        velX: 3
    };
    if(obstacle.y == canvas.h)
    {
        obstacle.y -= obstacle.h;
    }
    obstacles.unshift(obstacle); //put it in the front of the array
}

//if the obstacle's right side is off the screen, remove it
function deleteObstacle()
{
    for (let i = obstacles.length - 1; i > 0; i--)
    {
        if(obstacles[i].x + obstacles[i].w < 0)
        {
            obstacles.pop(); //remove the back of the array
        }
    }
}

//Move 
function moveObstacle(timePassed)
{
    for (let i = 0; i < obstacles.length; i++)
    {
        obstacles[i].x -= (obstacles[i].velX * timePassed);
    }
}

//depending on the random result, draw an stalactite or stalagmite
function topOrBottom()
{
    var rand = Math.random();
    if(rand >= 0 && rand < .5)
    {
        return borderHeight;
    }
    else
    {
        return canvas.h;
    }
}

//remove all obstacles
function deleteAllObstacles()
{
    for(let i = 0; i < obstacles.length; i++)
    {
        obstacles.pop();
    }
}
