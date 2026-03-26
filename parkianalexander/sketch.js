//start
//Vuvuzela's hunt for loot

//instruction page
var instructions;

//floor
var grass;

//clouds
var cloud;
var cloud1;
var cloud2;
var cloud3;
var cloud4;
var cloud5;
var clouds;

//mountain array
var mountains;

//tree array and x co-ordinates
var tree;
var trees;

//canyon array and canyon 
var canyon1;
var canyon2;
var canyon3;
var canyon4;
var chasms;

//collectible engram objects
var collectible;
var collectible2;
var collectible3;
var collectible4;
var collectible5;

//collectible array and collection 
var engram;
var engram_x;

//game character 
var Vuvuzela;
var VuvuzelaWorldPos;

//scrolling
var cameraXposition;

//movement
var isLeft;
var isRight;
var isPlummeting;
var isFalling;

//scoring
var Score;

//revives
var revives;
var skillIssue;

//flagpole object
var tower;

//music and sound effects
var deathsound;
var deathsound2;
var jumpsound;
var winsound;
var collectablesound;
var musicLoop;
var gameStartsound;

//platforms
var platforms;
var contactPlatform;
var contacted;

//enemies
var enemy;
var enemycontacted;

//preloading sound effects
function preload()
{
    soundFormats("mp3","wav");

    musicLoop = loadSound("assets/backgroundmusic.mp3");
    musicLoop.setVolume(0.1);

    deathsound = loadSound("assets/oof_death.mp3");
    deathsound.setVolume(0.1);

    deathsound2 = loadSound("assets/magic_jump.mp3");
    deathsound2.setVolume(0.5);

    jumpsound = loadSound("assets/D2JumpSFX.mp3");
    jumpsound.setVolume(1);

    winsound = loadSound("assets/indeed.mp3");
    winsound.setVolume(0.2);

    collectablesound = loadSound("assets/engrampickup.mp3");
    collectablesound.setVolume(0.5);

    gameStartsound = loadSound("assets/boom.mp3");
    gameStartsound.setVolume(0.3);
}

//initial setup
function setup()
{
    createCanvas(1024, 576);
    //lives
    revives = 3;

    //gamestate
    skillIssue = false;

    //platform
    contactPlatform = false;

    //make instruction window
    instructions = true;
    
    //BGM
    musicLoop.loop();

    //initalising game
    initalise();

    //making platforms
    platforms = [];
    platforms.push(makePlatform(400, grass.y - 100, 100));
    platforms.push(makePlatform(550, grass.y - 175, 100));
    platforms.push(makePlatform(800, grass.y - 200, 100));
    platforms.push(makePlatform(300, grass.y - 200, 100));
    platforms.push(makePlatform(100, grass.y - 250, 100));

    //making enemies
    enemy = [];
    enemy.push(createEnemy(10 , grass.y - 10, 100));
    enemy.push(createEnemy(850, grass.y - 10, 100));
}

function draw()
{
    
    //fill the sky blue
    background(135, 206, 230); 

    //ball in the sky sketch
    drawGardener();

    //grass colour
    noStroke();
    fill(34, 139, 34);
    //grass sketch
    rect(grass.x, grass.y, 1024, 144); 

    //push command for scrolling
    push();

    //camera scrolling
    translate(cameraXposition, 0);

    //cloud
    drawClouds();
    animateClouds();

    //mountains sketch
    drawMountains()

    //a tree
    drawTree();

    //flagpole
    drawTower();

    //a canyon
    drawChasm();

    //collectable engram
    drawCollectibles();

    //platforms
    drawPlatform();

    //enemies
    drawEnemy();

    //pop for scrolling
    pop();
   
    //score and lives
    gameScoring();
    reviveCount();
    
    //Character functions

    //character jumping left
    if(contactPlatform && isLeft)
    {
        VuvuzelaLeftGround();
    }
    else if(contactPlatform && isRight)
    {
        VuvuzelaRightGround();
    }
    else if(isLeft && isFalling)
    {
        VuvuzelaLeftJump();
    }

    //character jumping right
    else if(isRight && isFalling)
    {
        VuvuzelaRightJump();
    }

    //character walking left
    else if(isLeft == true)
    {
        VuvuzelaLeftGround();
    }

    //character walking right
    else if(isRight == true)
    {
        VuvuzelaRightGround();
    }
    else if(contactPlatform)
    {
        VuvuzelaFrontGround();
    }

    //character jumping facing forward
    else if((isFalling || isPlummeting) == true)
    {
        VuvuzelaFrontJump();
    }

    //character standing still
    else
    {
        VuvuzelaFrontGround();
    }

    //gameover
    if(skillIssue)
    {
        skillIssueGameOver();
        return;
    }
   
    //control lock for character falling into chasm
    if(isPlummeting == true)
    {
        Vuvuzela.y += 10;
        isFalling = true;
        checkifDed();
        return;
    }

    //double jump stopper
    if (Vuvuzela.y < grass.y)
    {
        isFalling = true;
    }      
    else
    {
        isFalling = false;
    }
   
    //left and right movement, including scrolling
    if(isLeft == true)
    {
        if(Vuvuzela.x > width * 0.5)
        {
            Vuvuzela.x -= 3;
        }
        else
        {
            cameraXposition += 3;
        }
    }
    else if(isRight == true)
    {
        if(Vuvuzela.x < width * 0.5)
        {
            Vuvuzela.x += 3;
        }
        else
        {
            cameraXposition -= 3;
        }
    }

    //function to check for collectable
    collectibleCheckany();

    //Game win check
    commanderIsHome();

    //anchoring camera
    VuvuzelaWorldPos = Vuvuzela.x - cameraXposition;
   
    //check for game character falling into the canyon
    chasmanycheck();

    //platform contact check
    checkIfGamechartouchplatform();

    //enemy checks
    checkIfGamecharishitbyanyenemy();
    checkifdedtoenemy();

    //instruction window
    if(instructions)
    {
        drawInstructions();
    }
}

//character wasd & spacebar controls
function keyPressed()
{   
    //close instruction window
    if(keyCode == 32 && instructions == true)
    {
        instructions = false;
        gameStartsound.play();
    }

    //lock controls when game over
    if(skillIssue)
    {
        return;
    }
    console.log("keyPressed: " + key);
    console.log("keyPressed: " + keyCode);

    if(keyCode == 65)
    {
        isLeft = true;
    }

    else if(keyCode == 68)
    {
        isRight = true;
    }
    //jump function
    else if(keyCode == 87)
    {
        if(isPlummeting)
        {
            Vuvuzela.y -= 0;
        }
        else if (Vuvuzela.y >= grass.y || contactPlatform == true)
        {
            Vuvuzela.y -= 120;
            jumpsound.play();
        }
    }
}
function keyReleased()
{
    //lock controls when game over
    if(skillIssue)
    {
        return;
    }

    if(keyCode == 65)
    {
        isLeft = false;
    }

    else if(keyCode == 68)
    {
        isRight = false;
    }
}

//check if game character is in range to pick up the collectable
function collectibleCheckany()
{
    for(var i = 0; i < engram_x.length; i++)
    {
        CollectibleCheck(engram_x[i]);
    }
}
function CollectibleCheck(coll)
{
    var engramProx = dist(VuvuzelaWorldPos, Vuvuzela.y, coll.insideX1, coll.y)
    if( engramProx < 30 && coll.isFound == false)
    {
        collectablesound.play();
        coll.isFound = true;
        Score += 1;
    }
}
//engrams collected display
function gameScoring()
{
    fill(0)
    textSize(30);
    text("Engrams:"+Score,10,30)
}

//checks if the game character is over a chasm
function chasmCheck(canyon)
{
    //check if game character is on the ground
    var cond1 = Vuvuzela.y >= grass.y

    //check if the game character is within the right side of the chasm
    var cond2 = VuvuzelaWorldPos - Vuvuzela.width / 2 > (canyon.x)

    //check if the game character is within the left side of the canyon
    var cond3 = VuvuzelaWorldPos + Vuvuzela.width / 2 < (canyon.x  + canyon.width)

    //determine if Vuvuzelaacter should be falling into the canyon
    if(cond1 && cond2 && cond3)
    {
        isPlummeting = true;
    }
}
//checks if the character is over any chasm
function chasmanycheck()
{
    for(var i=0; i < chasms.length; i++)
    {
        chasmCheck(chasms[i]);
    }
}

//canyon sketch 
function chasmSketch(canyon)
{
    fill(0,0,0);
    rect(canyon.x, canyon.y, canyon.height, canyon.width);
}

//draw multiple canyons
function drawChasm()
{
    for(i =0; i < chasms.length; i++)
    {
        chasmSketch(chasms[i]);
    }
}

//draw the engrams
function drawCollectibles()
{
    for(var i= 0; i < engram_x.length; i++)
    {
        drawCollectible(engram_x[i]);
    }
}
//Collectible sketch
function drawCollectible(coll)
{
    if(coll.isFound == false)
    {
        noStroke();
        fill(153,50,204);
        quad(coll.width1,coll.height1, coll.x1,coll.y, coll.x2,coll.y, coll.width2,coll.height1);
        quad(coll.width1,coll.height2, coll.x1,coll.y, coll.x2,coll.y, coll.width2,coll.height2);

        fill(138,43,226);
        quad(coll.insideW1,coll.insideH1, coll.insideX1,coll.y, coll.insideX2,coll.y, coll.insideW2,coll.insideH1);
        quad(coll.insideW1,coll.insideH2, coll.insideX1,coll.y, coll.insideX2,coll.y, coll.insideW2,coll.insideH2);
    }
}

//cloud animation
function animateClouds()
{
    clouds[0].x = clouds[0].x + 0.5;
    clouds[1].x = clouds[1].x + 0.2;
    clouds[2].x = clouds[2].x + 1;
    clouds[3].x = clouds[3].x + 0.7;
    clouds[4].x = clouds[4].x + 0.1;
}

//clouds for loop using array for 3 different clouds
function drawClouds()
{
    for (let i = 0; i < clouds.length; i++) 
    {
        fill(255);
        ellipse(clouds[i].x, clouds[i].y - 10, clouds[i].size);
        ellipse(clouds[i].x, clouds[i].y, clouds[i].y + 30, clouds[i].size);
        ellipse(clouds[i].x + 50, clouds[i].y - 10, clouds[i].size, clouds[i].size);
        ellipse(clouds[i].x - 50, clouds[i].y - 10, clouds[i].size, clouds[i].size);
    }
}

//trees for loop using x coordinate array
function drawTree()
{
    //for loop to sketch trees
    for(var i = 0; i < trees_x.length; i++)
    {
        //trunk
        fill(160,82,45);
        rect(trees_x[i], grass.y - 100, 20, 100);

        //leaves
        fill(0,128,0);
        ellipse(trees_x[i] + 10, grass.y - 90, 90, 50);
        ellipse(trees_x[i] + 10, grass.y - 110, 60, 50);
    }
}

//mountain for loop using array values
function drawMountains()
{
    for (let i = 0; i < mountains.length; i++)
    {
        fill(128,128,128);
        triangle(mountains[i].x, mountains[i].y, mountains[i].width + 200, mountains[i].height, mountains[i].width + 450 ,mountains[i].height);

        fill(255,255,255);
        triangle(mountains[i].x, mountains[i].y, mountains[i].snow1, mountains[i].y + 50, mountains[i].snow2, mountains[i].y + 50);
    }
}

//revive tokens
function drawHeart(x, y, size) 
{
    //revive tokens
    fill(255, 0, 0); 
    beginShape();
    vertex(x, y - size / 2);
    bezierVertex(x + size / 2, y - size / 2, x + size / 2, y + size / 4, x, y + size);
    bezierVertex(x - size / 2, y + size / 4, x - size / 2, y - size / 2, x, y - size / 2);
    endShape(CLOSE);
}

//revive counter
function reviveCount()
{
    if(revives == 3)
    {
        drawHeart(20, 70, 30);
        drawHeart(20, 130, 30);
        drawHeart(20, 190, 30);
        fill(0)
        textSize(30);
        text("Revives:"+ revives ,40,80)
    }
    else if(revives == 2)
    {
        drawHeart(20, 70, 30);
        drawHeart(20, 130, 30);
        fill(0)
        textSize(30);
        text("Revives:"+ revives ,40,80)
    }
    else if(revives == 1)
    {
        drawHeart(20, 70, 30);
        fill(0)
        textSize(30);
        text("Revives:"+ revives ,40,80)
    }
    else
    {
        fill(0)
        textSize(30);
        text("DEAD!" ,30,80)
    }
}

//check if the character is out of lives, seperate checks if it was killed by an enemy or canyon
function checkifDed()
{
    if((Vuvuzela.y > height))
    {
        revives --;
        deathsound.play();

        if(revives > 0)
        {
            initalise();
        }
        else
        {
            skillIssue = true;
        }
    }
}
function checkifdedtoenemy()
{
    if(enemycontacted)
    {
        revives --;
        deathsound2.play();

        if(revives > 0)
        {
            initalise();
        }
        else
        {
            skillIssue = true;
        }
    }
}

//text display for game win or game over
function skillIssueGameOver()
{
    fill(0);
    textSize(50);
    if(revives > 0)
    {
        text("Mission Completed!", width/2 -175, height/2);
        text("Refresh the window to play again!", width/2 - 300, height/2 + 50);
        musicLoop.stop();
    }
    else
    {
        fill(0);
        textSize(50);
        text("Your power fades away", width/2 - 200, height/2);
        fill(0);
        text("Refresh the window to try again!", width/2 - 300, height/2 + 50);
        musicLoop.stop();
    }
}

//draw the flagpole
function drawTower()
{
    fill(105,105,105);
    rect(tower.x, grass.y, 130, -275)

    fill(189,183,107);
    rect(tower.x, grass.y, 130, -175)

    fill(189,183,107);
    rect(tower.x - 20, grass.y - 300, 170, -15);

    fill(120,120,120);
    rect(tower.x + 55, grass.y, 20, -325)

    fill(189,183,107);
    triangle(tower.x - 20, grass.y - 300, tower.x + 55, grass.y - 300, tower.x + 55, 150);

    fill(189,183,107);
    triangle(tower.x + 150, grass.y - 300, tower.x + 75, grass.y - 300, tower.x + 75, 150);

    stroke(0,0,0);
    fill(120,120,120);
    rect(tower.x, grass.y, 25, -40)

    //flagpole raised
    if(tower.docked)
    {
        noStroke();
        fill(0);
        rect(tower.x + 30, grass.y - 340, 10, 30);

        fill(0);
        rect(tower.x + 90, grass.y - 340, 10, 30);

        fill(255);
        ellipse(tower.x + 35, grass.y -340, 15, 15)
        fill(255,255,255,200);
        ellipse(tower.x + 35, grass.y -340, 25, 25)

        fill(255);
        ellipse(tower.x + 95, grass.y -340, 15, 15)

        fill(255,255,255,200);
        ellipse(tower.x + 95, grass.y -340, 25, 25)
       
        stroke(0,0,0);
        fill(120,120,120);
        rect(tower.x, grass.y, 25, -40)

        fill(0);
        noStroke();
        textSize(20);
        text("Welcome Home, Commander", tower.x - 50, grass.y -400)

    }

}

//game win 
function commanderIsHome()
{
    if(tower.docked == false)
    {
        var v = dist(VuvuzelaWorldPos, Vuvuzela.y, tower.x, grass.y);

        if(v < 10 && Score == 5)
        {
            winsound.play();
            tower.docked = true;
            skillIssue = true;
        }
    }
}

//platform constructor
function Platform(x,y,length)
{
    this.x = x;
    this.y = y;
    this.length = length;

    this.draw = function()
    {
        fill(155,155,155);
        rect(this.x, this.y, this.length, 20);
    }

    this.checkContact = function(vu_x, vu_y)
    {
        if(vu_x + 20 > this.x && vu_x < this.x + 20 + this.length)
        {
            var d = this.y - vu_y;
            if(d >= 0 && d < 1)
            {
                return true
            }
        }
        return false;
    }
}

//construct the platforms
function makePlatform(x,y,length)
{
    return new Platform(x,y,length);
}

function drawPlatform()
{
    for(var i=0; i < platforms.length; i++)
    {
        platforms[i].draw();
    }
}

//check if the game character is touching the platforms
function checkIfGamechartouchplatform()
{
    if(isFalling == true)
    {
        var isContact = false;
        contactPlatform = false;
        for(var i=0; i < platforms.length; i++)
        {
            isContact = platforms[i].checkContact(VuvuzelaWorldPos, Vuvuzela.y);
            if(isContact)
            {
                contactPlatform = true;
                isFalling = false;
                break;
            }
        }
        if(isContact == false)
        {
            Vuvuzela.y += 1.5;
        }
    }
}

//creating enemies
function enemies(x,y,range)
{
    this.x = x;
    this.y = y;
    this.range = range;
    this.currentX = x;
    this.inc = 1;

    this.update = function()
    {
        this.currentX += this.inc;
        if(this.currentX > this.x + this.range)
        {
            this.inc = -1;
        }
        else if(this.currentX < this.x)
        {
            this.inc = 1;
        }
        else if(skillIssue)
        {
            this.inc = 0;
        }
    }

    this.draw = function()
    {
        this.update();
        fill(0,250,154);
        ellipse(this.currentX, this.y - 30  , 20,20);
        fill(240,230,140);
        rect(this.currentX - 10, this.y + 10, 20, -30); 
    }

    this.checkContact = function(Vu_x, Vu_y)
    {
        var d = dist(Vu_x, Vu_y, this.currentX, this.y);
        if(d < 20)
        {
            return true;
        }
        return false;
    }
}

function createEnemy(x, y, range)
{
    return new enemies(x, y, range);
}

function drawEnemy()
{
    for(var i = 0; i < enemy.length; i++)
    {
        enemy[i].draw();
    }
}
//check for contacting the enemy
function checkIfGamecharishitbyanyenemy()
{
    if(enemycontacted)
    {
        return;
    }

    for(var i = 0; i < enemy.length; i++)
    {
        var isContact = enemy[i].checkContact(VuvuzelaWorldPos, Vuvuzela.y)
        if(isContact)
        {
            enemycontacted = true;
            break;
        }
    }
}

//instruction window
function drawInstructions()
{
    fill(0);
    stroke(255);
    rect(100,50, 740,400);

    fill(255);
    noStroke();
    textSize(40);
    text("How to play!", height/2 - 175, width/2 - 420);
    textSize(30);
    text("Use 'WASD' keys to control Vuvuzela.", height/2 - 150, width/2 - 350);

    text("Traverse the platforms and collect his lost engrams!", height/2 - 150, width/2 - 300);
    textSize(27);
    text("Collect 5 engrams and touch the door on the tower to win!", height/2 - 150, width/2 - 250);
    
    text("Press the spacebar to close this window", height/2 - 100, width/2 - 100);
}

//initalise game
function initalise()
{
    //character start position
    Vuvuzela =
    {
        x : width/2,
        y : 425,
        width : 30,
    }

    //the floor
    grass = 
    {
        x : 0,
        y : 432,
    }

    //clouds
    cloud1 = 
    {
        x : 200,
        y : 150,
        size : 75,
    }
    cloud2 = 
    {
        x : 250,
        y : 150,
        size : 90,
    }
    cloud3 = 
    {
        x : 180,
        y : 150,
        size : 50,
    }
    cloud4 = 
    {
        x : 250,
        y : 150,
        size : 90,
    }
    cloud5 = 
    {
        x : 200,
        y : 150,
        size : 75,
    }
    //cloud array
    clouds = 
    [
        cloud1,
        cloud2,
        cloud3,
        cloud4,
        cloud5
    ]

    //mountain array
    mountains = 
    [
        //mountain1
        {
            x : 575,
            y : 100,
            height : grass.y,
            width : 250,
            snow1 : 555,
            snow2 : 595,
        }, 
        //mountain2
        {
            x : 700,
            y : 200, 
            height : grass.y,
            width : 375,
            snow1 : 673,
            snow2 : 727,
        },
        //mountain3
        {
            x : 350,
            y : 250,
            height : grass.y,
            width : 25,
            snow1 : 315,
            snow2 : 385, 
        }
    ]

    //array of tree x locations
    trees_x = 
    [
        random(200,300),
        random(700,800),
        random(400,500)
    ];

    //canyon sketches
    canyon1 = 
    {
        x : 50,
        y : 432,
        height : 140,
        width : 144,
    };
    canyon2 = 
    {
        x : 750,
        y : 432,
        height : 140,
        width : 144,
    };
    canyon3 = 
    {
        x : 1100,
        y : 432,
        height : 140,
        width : 144,
    };
    canyon4 = 
    {
        x : -200,
        y : 432,
        height : 140,
        width : 144,
    };
    //canyon array
    chasms = 
    [
        canyon1,
        canyon2,
        canyon3,
        canyon4,
    ];

    //collectible sketch values
    collectible = 
    {
        x1 : 340 + 70,
        x2 : 400 + 70,
        y : 410 - 95,

        width1 : 355 + 70, 
        width2 : 385 + 70,
        height1 : 430 - 95,
        height2 : 390 - 95,

        insideX1 : 355 + 70,
        insideX2 : 385 + 70,

        insideW1 : 365 + 70,
        insideW2 : 375 + 70,
        insideH1 : 420 - 95,
        insideH2 : 400 - 95,

        isFound : false
    };
    collectible2 = 
    {
        x1 : 340 + 700,
        x2 : 400 + 700,
        y : 410,

        width1 : 355 + 700, 
        width2 : 385 + 700,
        height1 : 430,
        height2 : 390,

        insideX1 : 355 + 700,
        insideX2 : 385 + 700,

        insideW1 : 365 + 700,
        insideW2 : 375 + 700,
        insideH1 : 420,
        insideH2 : 400,

        isFound : false
    };
    collectible3 = 
    {
        x1 : 340 + 475,
        x2 : 400 + 475,
        y : 410 - 195,

        width1 : 355 + 475, 
        width2 : 385 + 475,
        height1 : 430 - 195,
        height2 : 390 - 195,

        insideX1 : 355 + 475,
        insideX2 : 385 + 475,

        insideW1 : 365 + 475,
        insideW2 : 375 + 475,
        insideH1 : 420 - 195,
        insideH2 : 400 - 195,

        isFound : false
    };
    collectible4 = 
    {
        x1 : 340 + 350,
        x2 : 400 + 350,
        y : 410,

        width1 : 355 + 350, 
        width2 : 385 + 350,
        height1 : 430,
        height2 : 390,

        insideX1 : 355 + 350,
        insideX2 : 385 + 350,

        insideW1 : 365 + 350,
        insideW2 : 375 + 350,
        insideH1 : 420,
        insideH2 : 400,

        isFound : false
    };
    collectible5 = 
    {
        x1 : 340 - 400,
        x2 : 400 - 400,
        y : 410,

        width1 : 355 - 400, 
        width2 : 385 - 400,
        height1 : 430,
        height2 : 390,

        insideX1 : 355 - 400,
        insideX2 : 385 - 400,

        insideW1 : 365 - 400,
        insideW2 : 375 - 400,
        insideH1 : 420,
        insideH2 : 400,

        isFound : false
    };
    //collectibles array
    engram_x = 
    [
       collectible,
       collectible2,
       collectible3,
       collectible4,
       collectible5
    ]


    //setting movement variable 
    isLeft = false;
    isRight = false;
    isFalling = false;
    isPlummeting = false;

    //scrolling
    cameraXposition = 0;
    VuvuzelaWorldPos = Vuvuzela.x;
    Score = 0;

    //flagpole inital values
    tower = {x: 900, docked: false};

    //enemy
    enemycontacted = false;
}

//background art sketch
function drawGardener()
{
     //the machine that gives Vuvuzela his powers
     fill(220);
     ellipse(width/2, height/4, 300);
     fill(0);
     ellipse(width/2, height/4, 100);
     noStroke();
     fill(220);
     ellipse(470, 170, 60, 80)
     ellipse(555, 170, 60, 80)
     ellipse(width/2, 80, 30, 130)
     if(revives == 0)
     {
        fill(255,0,0);
        ellipse(width/2, height/4, 300);
     }
}

//character sketches
function VuvuzelaFrontGround()
{
     //player standing facing front
     stroke(230,230,250);
     //Light sky blue skin
     //head
     fill(135,206,250);
     ellipse(Vuvuzela.x, Vuvuzela.y - 50, 20,20);

     noStroke();
     fill(0,255,255);
     ellipse(Vuvuzela.x - 4, Vuvuzela.y - 52, 4,4);
     ellipse(Vuvuzela.x + 4, Vuvuzela.y - 52, 4,4);

     //mouth
     stroke(0,0,0);
     line(Vuvuzela.x- 3, Vuvuzela.y - 46, Vuvuzela.x + 3, Vuvuzela.y - 46);

     //body and armour
     stroke(0,0,0);
     fill(255,0,0);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 40, 20, 30);
     fill(112,128,144);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 40, 5, 20);
     rect(Vuvuzela.x + 5, Vuvuzela.y - 40, 5, 20);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 35, 20, 15);

     //right arm
     //underarm
     fill(255,0,0);
     rect(Vuvuzela.x - 15, Vuvuzela.y - 40, 5, 20);

     //armour
     fill(112,128,144);
     rect(Vuvuzela.x - 20, Vuvuzela.y - 40, 5, 20);
     rect(Vuvuzela.x - 20, Vuvuzela.y - 25, 10, 5);

     //hand
     fill(135,206,250)
     rect(Vuvuzela.x - 20, Vuvuzela.y - 20, 10, 5);

     //left arm
     //underarm
     fill(255,0,0);
     rect(Vuvuzela.x + 10, Vuvuzela.y - 40, 5, 20);

     //armour
     fill(112,128,144);
     rect(Vuvuzela.x + 15, Vuvuzela.y - 50, 5, 25);
     rect(Vuvuzela.x + 10, Vuvuzela.y - 25, 10, 5);

     //hand
     fill(135,206,250)
     rect(Vuvuzela.x + 10, Vuvuzela.y - 20, 10, 5);

     //left leg & armour
     fill(255,0,0);
     rect(Vuvuzela.x, Vuvuzela.y - 10, 10, 15);
     fill(112,128,144);
     rect(Vuvuzela.x, Vuvuzela.y - 5, 10, 5);

     //right leg & armour
     fill(255,0,0);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 10, 10, 15);
     fill(112,128,144);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 5, 10, 5);
}

function VuvuzelaFrontJump()
{
     //Jumping
     stroke(230,230,250);
     fill(135,206,250);
     ellipse(Vuvuzela.x, Vuvuzela.y - 70, 20,20);

     //eyes
     noStroke();
     fill(0,255,255);
     ellipse(Vuvuzela.x - 4, Vuvuzela.y - 72, 4,4);
     ellipse(Vuvuzela.x + 4, Vuvuzela.y - 72, 4,4);

     //mouth
     fill(0,0,0);
     ellipse(Vuvuzela.x, Vuvuzela.y - 66, 4,5);
     //body and armour
     stroke(0,0,0);
     fill(255,0,0);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 60, 20, 30);
     fill(112,128,144);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 60, 5, 20);
     rect(Vuvuzela.x + 5, Vuvuzela.y - 60, 5, 20);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 55, 20, 15);

     //right arm
     //underarm
     fill(255,0,0);
     rect(Vuvuzela.x - 15, Vuvuzela.y - 60, 5, 20);
     //armour
     fill(112,128,144);
     rect(Vuvuzela.x - 20, Vuvuzela.y - 60, 5, 20);
     rect(Vuvuzela.x - 20, Vuvuzela.y - 45, 10, 5);
     //hand
     fill(135,206,250)
     rect(Vuvuzela.x - 20, Vuvuzela.y - 40, 10, 5);

     //left arm
     //underarm
     fill(255,0,0);
     rect(Vuvuzela.x + 10, Vuvuzela.y - 60, 5, 20);
     //armour
     fill(112,128,144);
     rect(Vuvuzela.x + 15, Vuvuzela.y - 70, 5, 25);
     rect(Vuvuzela.x + 10, Vuvuzela.y - 45, 10, 5);
     //hand
     fill(135,206,250)
     rect(Vuvuzela.x + 10, Vuvuzela.y - 40, 10, 5);

     //legs
     //left leg & armour
     fill(255,0,0);
     rect(Vuvuzela.x, Vuvuzela.y - 30, 10, 15);
     fill(112,128,144);
     rect(Vuvuzela.x, Vuvuzela.y - 25, 10, 5);
     //right leg & armour
     fill(255,0,0);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 30, 10, 15);
     fill(112,128,144);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 25, 10, 5);

     //jump sfx
     noStroke();
     fill(176,224,230);
     rect(Vuvuzela.x - 10, Vuvuzela.y - 10, 3, 8);
     rect(Vuvuzela.x + 5, Vuvuzela.y - 10, 3, 10);
     rect(Vuvuzela.x - 3, Vuvuzela.y - 10, 3, 7);
     ellipse(Vuvuzela.x - 15, Vuvuzela.y - 10, 5, 5);
     ellipse(Vuvuzela.x + 17, Vuvuzela.y - 5, 5, 5);
     ellipse(Vuvuzela.x + 14, Vuvuzela.y - 15, 5, 5);
}

function VuvuzelaRightGround()
{
    //Walking right
    //head
    fill(135,206,250);
    ellipse(Vuvuzela.x, Vuvuzela.y - 50, 20,20);

    //eye
    noStroke();
    fill(0,255,255);
    ellipse(Vuvuzela.x + 6, Vuvuzela.y - 52, 4,4);

    //mouth
    stroke(0,0,0);
    line(Vuvuzela.x + 3, Vuvuzela.y - 46, Vuvuzela.x + 7, Vuvuzela.y - 46);

    stroke(0,0,0);
    //red arm
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 40, 10, 20);

    //hand
    fill(135,206,250);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 20, 10, 5);

    //leg
    fill(255,0,0);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 15, 10, 20);

    //leg armour
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 5, 10, 5);
}

function VuvuzelaLeftGround()
{
    //Walking left
    stroke(230,230,250);
    //head
    fill(135,206,250);
    ellipse(Vuvuzela.x, Vuvuzela.y - 50, 20,20);

    //eye
    noStroke();
    fill(0,255,255);
    ellipse(Vuvuzela.x - 6, Vuvuzela.y - 52, 4,4);

    //left arm
    stroke(0,0,0);
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 40, 10, 20);

    //armour plate
    rect(Vuvuzela.x - 7, Vuvuzela.y - 50, 15, 20);

    //hand
    fill(135,206,250);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 20, 10, 5);

    //leg
    fill(255,0,0);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 15, 10, 20);

    //leg armour
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 5, 10, 5);
}

function VuvuzelaRightJump()
{
     //Jumping right
     stroke(230,230,250);
     //head
     fill(135,206,250);
     ellipse(Vuvuzela.x, Vuvuzela.y - 70, 20,20);

     //eye
     noStroke();
     fill(0,255,255);
     ellipse(Vuvuzela.x + 6, Vuvuzela.y - 72, 4,4);

     //mouth
     fill(0,0,0);
     ellipse(Vuvuzela.x + 6, Vuvuzela.y - 65, 3,5);

     //right arm
     stroke(0,0,0);
     fill(112,128,144);
     rect(Vuvuzela.x - 5, Vuvuzela.y - 60, 10, 20);

     //hand
     fill(135,206,250);
     rect(Vuvuzela.x - 5, Vuvuzela.y - 40, 10, 5);

     //leg
     fill(255,0,0);
     rect(Vuvuzela.x - 5, Vuvuzela.y - 35, 10, 20);

     //leg armour
     fill(112,128,144);
     rect(Vuvuzela.x - 5, Vuvuzela.y - 25, 10, 5);

     //jump sfx
     noStroke();
     fill(176,224,230);
     rect(Vuvuzela.x + 5, Vuvuzela.y - 10, 3, 10);
     rect(Vuvuzela.x - 3, Vuvuzela.y - 10, 3, 7);
     rect(Vuvuzela.x -19, Vuvuzela.y - 50, 12, 3);
     rect(Vuvuzela.x -19, Vuvuzela.y - 40, 7, 3);
     ellipse(Vuvuzela.x - 15, Vuvuzela.y - 10, 5, 5);
     ellipse(Vuvuzela.x - 17, Vuvuzela.y - 3, 5, 5);
     ellipse(Vuvuzela.x + 14, Vuvuzela.y - 15, 5, 5);
}

function VuvuzelaLeftJump()
{
    //Jumping left
    stroke(230,230,250);
    //head
    fill(135,206,250);
    ellipse(Vuvuzela.x, Vuvuzela.y - 70, 20,20);

    //eye
    noStroke();
    fill(0,255,255);
    ellipse(Vuvuzela.x - 6, Vuvuzela.y - 72, 4,4);

    stroke(0,0,0);
    //left arm
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 60, 10, 20);

    //armour plate
    rect(Vuvuzela.x - 7, Vuvuzela.y - 70, 15, 20);

    //hand
    fill(135,206,250);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 40, 10, 5);

    //leg
    fill(255,0,0);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 35, 10, 20);

    //leg armour
    fill(112,128,144);
    rect(Vuvuzela.x - 5, Vuvuzela.y - 25, 10, 5);

    //jump sfx
    noStroke();
    fill(176,224,230);
    rect(Vuvuzela.x + 5, Vuvuzela.y - 10, 3, 10);
    rect(Vuvuzela.x - 3, Vuvuzela.y - 10, 3, 7);
    rect(Vuvuzela.x + 11, Vuvuzela.y - 50, 12, 3);
    rect(Vuvuzela.x + 11, Vuvuzela.y - 40, 7, 3);
    ellipse(Vuvuzela.x + 17, Vuvuzela.y - 5, 5, 5);
    ellipse(Vuvuzela.x + 14, Vuvuzela.y - 15, 5, 5);
}
//end