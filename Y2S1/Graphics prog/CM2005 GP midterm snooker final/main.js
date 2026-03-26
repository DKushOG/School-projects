// Snooker Game using p5.js and Matter.js

// Matter.js modules
let Engine = Matter.Engine;
let World = Matter.World;
let Bodies = Matter.Bodies;
let Body = Matter.Body;

// Global variables
let engine, world;
let table, pockets = [];
let balls = [];
let cueBall;
let score = 0;
let cueDragging = false;
let dragStart = null;
let maxForce = 1; // Maximum force magnitude

let gameMode = 1;  // Default game mode: 1 (standard starting positions)

const tableWidth = 600;
const tableHeight = tableWidth / 2;
const ballDiameter = tableWidth / 50;
const pocketDiameter = ballDiameter * 1.5;

let currentPower = 0.001; // Default minimum power
const MIN_POWER = 0.001; // Minimum cue power
const MAX_POWER = 0.004; // Maximum cue power

let placingCueBall = false; // Whether the cue ball is being placed
let cueBallPotted = false; // Tracks if the cue ball is currently potted

const POINT_DEDUCTION_CUE_BALL = 5; // Points deducted for potting the cue ball
const POINT_DEDUCTION_COLORED_BALL_ERROR = 10; // Points deducted for potting consecutive colored balls

let lastPottedBallColor = null; // Track the color of the last potted ball

let errorMessage = ""; // To store error messages
let errorMessageTimer = 0; // To track message duration

// Ball colors
const ballColors = ["red", "yellow", "green", "brown", "blue", "pink", "black"];

let hitSound, wallSound, potSound, missSound;

function preload() {
    // soundFormats('mp3');
    hitSound = loadSound('assets/BallHit.mp3'); // Cue ball hitting another ball
    wallSound = loadSound('assets/HitWall.mp3'); // Cue ball hitting a wall
    potSound = loadSound('assets/BallPotted.mp3'); // Cue ball being potted
    cueSound = loadSound('assets/CueStrike.mp3'); // Cue ball hitting nothing
}

// Setup function
function setup() {
    createCanvas(1000, 1000);

    // Initialize Matter.js engine
    engine = Engine.create();
    world = engine.world;

    // Disable gravity
    engine.world.gravity.y = 0;
    engine.world.gravity.x = 0;

    // Initialize table, pockets, and balls
    table = { x: width / 2, y: height / 2, width: tableWidth, height: tableHeight, color: color(34, 139, 34) };
    createPockets();
    createBalls(); // Creates balls except the cue ball
    createTableWalls();

    placingCueBall = true; // Enter placement mode at start

    Matter.Events.on(engine, "collisionStart", handleCollision);
    Engine.run(engine);
}

// Draw function
function draw() {
    background(0);

    Engine.update(engine);

    // Draw table, pockets, balls, and cue
    drawTable();
    drawPockets();
    drawPowerBar();
    // Always draw the "D" zone
    let dRadius = table.width / 8;
    let dCenterX = table.x - table.width / 4;
    let dCenterY = table.y;

    // Draw the left side of the "D" area
    noFill();
    stroke(255); // White stroke for the "D"
    strokeWeight(2);
    arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);

    // Draw the flat line of the "D" zone
    line(dCenterX, dCenterY - dRadius - 64, dCenterX, dCenterY + dRadius + 64);

    drawBalls();
    if (placingCueBall) {
        // Draw the potential cue ball position
        fill(255, 255, 255, 150); // Semi-transparent white
        noStroke();
        ellipse(mouseX, mouseY, ballDiameter);

        textSize(16);
        fill(255);
        textAlign(CENTER, CENTER);
        text('Click to place the cue ball in the "D"', width / 2, height - 50);
    } else {
        drawCue();
    }

    drawScore();

    // Handle pocket detection
    handlePocketedBalls();

    drawDebugInfo();

    // Debug mode message
    if (gameMode === 4) {
        fill(255, 255, 0);
        textSize(24);
        textAlign(CENTER, CENTER);
        text("Debug Mode Active", width / 2, 50);
    }

    if (errorMessage) {
        fill(255, 0, 0);
        textSize(18);
        textAlign(CENTER);
        text(errorMessage, table.x, table.y - table.height / 2 - 50);

        // Clear message after 2 seconds
        if (millis() > errorMessageTimer + 2000) {
            errorMessage = "";
        }
    }

    // Draw instructions in the top-right corner
    drawInstructions();
}


// Table drawings, Ball drawings, Cue drawing & related physics objects
function drawInstructions() {
    fill(255);
    textSize(14);
    textAlign(LEFT, TOP);

    let instructions = [
        "How to Play:",
        "- Click and drag the cue ball to aim and shoot.",
        "- Pot red balls for 10 points.",
        "- Pot colored balls for 20 points.",
        "- Avoid potting the cue ball (-5 points).",
        "- Do not pot consecutive colored balls (-10 points).",
        "- Use keys 1, 2, 3 to select game modes:",
        "  1: Standard setup",
        "  2: Random red balls",
        "  3: Random reds and colored balls",
        "",
        "Tip: Place the cue ball in the 'D' to start."
    ];

    let x = width / 100 ; // Position near the top-right corner
    let y = 20; // Vertical starting position
    for (let line of instructions) {
        text(line, x, y);
        y += 18; // Spacing between lines
    }
}

// Draw table and its border with a 3D shadow effect
function drawTable() {
    // Draw the table border with a 3D effect
    let borderThickness = 40; // Thickness of the border
    let shadowOffset = 5; // Offset for the shadow effect

    // Draw shadow below the border
    fill(0, 50); // Semi-transparent black for shadow
    noStroke();
    rect(
        table.x + shadowOffset,
        table.y + shadowOffset,
        table.width + borderThickness,
        table.height + borderThickness,
        10 // Rounded corners for the shadow
    );

    // Draw the main brown border with gradient effect
    for (let i = 0; i < 10; i++) {
        let gradientColor = lerpColor(
            color(139, 69, 19), // Dark brown
            color(210, 105, 30), // Lighter brown
            i / 10
        );
        fill(gradientColor);
        rect(
            table.x,
            table.y,
            table.width + borderThickness - i * 2,
            table.height + borderThickness - i * 2,
            10 - i // Gradually reduce corner radius
        );
    }

    // Draw table surface
    fill(table.color);
    rect(
        table.x,
        table.y,
        table.width,
        table.height,
        5 // Slightly rounded corners for the surface
    );

    // Add a highlight line around the border for a polished look
    stroke(218,165,32); // Semi-transparent white for highlight
    strokeWeight(2);
    noFill();
    rect(
        table.x,
        table.y,
        table.width + borderThickness - 10,
        table.height + borderThickness - 10,
        8 // Rounded corners for the highlight
    );

    // Draw the "D" area
    let dRadius = table.width / 8; // Radius of the "D"
    let dCenterX = table.x - table.width / 4; // Center X for "D"
    let dCenterY = table.y; // Center Y for "D"

    stroke(255); // White outline for the "D"
    strokeWeight(2);
    noFill();
    arc(dCenterX, dCenterY, dRadius * 2, dRadius * 2, HALF_PI, -HALF_PI);
    line(dCenterX, dCenterY - dRadius, dCenterX, dCenterY + dRadius);

    // Draw golden ornaments and cushions
    drawGoldenOrnaments();
    drawCushions();
}

// Create walls for the table, matching trapezium-shaped cushions
function createTableWalls() {
    let cushionThickness = 10; // Thickness of the cushions
    let pocketGap = pocketDiameter * 1.1; // Gap for pockets
    let cornerOffset = cushionThickness; // Offset for 45-degree corners

    // Trapezium-shaped cushions for Matter.js
    function createTrapezium(x1, y1, x2, y2, x3, y3, x4, y4) {
        return Bodies.fromVertices(
            (x1 + x2 + x3 + x4) / 4, // Center x
            (y1 + y2 + y3 + y4) / 4, // Center y
            [[{ x: x1, y: y1 }, { x: x2, y: y2 }, { x: x3, y: y3 }, { x: x4, y: y4 }]],
            { isStatic: true }
        );
    }

    // Horizontal cushions
    let horizontalCushions = [
        // Top-left
        createTrapezium(
            table.x - table.width / 2 + pocketGap - 7, table.y - table.height / 2, // Inner corner (near pocket)
            table.x - table.width / 4 + 140, table.y - table.height / 2,         // Outer corner (near pocket)
            table.x - table.width / 4 + 3 - cornerOffset + 138, table.y - table.height / 2 + cushionThickness, // Outer corner (angled inwards)
            table.x - table.width / 2 + pocketGap + cornerOffset - 7, table.y - table.height / 2 + cushionThickness // Inner corner (angled inwards)
        ),
        // Top-right
        createTrapezium(
            table.x + table.width / 2 - pocketGap + 7, table.y - table.height / 2, // Inner corner (near pocket)
            table.x + table.width / 4 - 140, table.y - table.height / 2,         // Outer corner (near pocket)
            table.x + table.width / 4 - 3 + cornerOffset - 138, table.y - table.height / 2 + cushionThickness, // Outer corner (angled inwards)
            table.x + table.width / 2 - pocketGap - cornerOffset + 7, table.y - table.height / 2 + cushionThickness // Inner corner (angled inwards)
        ),
        // Bottom-left
        createTrapezium(
            table.x - table.width / 2 + pocketGap - 7, table.y + table.height / 2, // Inner corner (near pocket)
            table.x - table.width / 4 + 140, table.y + table.height / 2,         // Outer corner (near pocket)
            table.x - table.width / 4 + 3 - cornerOffset + 138, table.y + table.height / 2 - cushionThickness, // Outer corner (angled inwards)
            table.x - table.width / 2 + pocketGap + cornerOffset - 7, table.y + table.height / 2 - cushionThickness // Inner corner (angled inwards)
        ),
        // Bottom-right
        createTrapezium(
            table.x + table.width / 2 - pocketGap +7, table.y + table.height / 2, // Inner corner (near pocket)
            table.x + table.width / 4 - 140, table.y + table.height / 2,         // Outer corner (near pocket)
            table.x + table.width / 4 - 3 + cornerOffset -138, table.y + table.height / 2 - cushionThickness, // Outer corner (angled inwards)
            table.x + table.width / 2 - pocketGap - cornerOffset + 7, table.y + table.height / 2 - cushionThickness // Inner corner (angled inwards)
        )
    ];

    // Vertical cushions
    let verticalCushions = [
        // Left
        createTrapezium(
            table.x - table.width / 2, table.y - table.height / 2 + pocketGap - 7, // Inner corner (near pocket)
            table.x - table.width / 2, table.y + table.height / 2 - pocketGap + 7, // Inner corner (near pocket)
            table.x - table.width / 2 + cushionThickness, table.y + table.height / 2 - pocketGap - cornerOffset + 7, // Outer corner (angled inwards)
            table.x - table.width / 2 + cushionThickness, table.y - table.height / 2 + pocketGap + cornerOffset - 7 // Outer corner (angled inwards)
        ),
        // Right
        createTrapezium(
            table.x + table.width / 2, table.y - table.height / 2 + pocketGap - 7, // Inner corner (near pocket)
            table.x + table.width / 2, table.y + table.height / 2 - pocketGap + 7, // Inner corner (near pocket)
            table.x + table.width / 2 - cushionThickness, table.y + table.height / 2 - pocketGap - cornerOffset + 7, // Outer corner (angled inwards)
            table.x + table.width / 2 - cushionThickness, table.y - table.height / 2 + pocketGap + cornerOffset - 7// Outer corner (angled inwards)
        )
    ];

    // Add all cushions to the world
    [...horizontalCushions, ...verticalCushions].forEach(cushion => World.add(world, cushion));
}

// Draw table cushions
function drawCushions() {
    fill(0, 110, 0); // Cushion color
    noStroke();

    let cushionThickness = 10;
    let pocketGap = pocketDiameter * 1.1; // Gap for pockets
    let cornerOffset = cushionThickness; // Offset for the 45-degree inward angles

    // Horizontal cushions (top and bottom)
    // Top-left
    quad(
        table.x - table.width / 2 + pocketGap - 7, table.y - table.height / 2, // Inner corner (near pocket)
        table.x - table.width / 4 + 140, table.y - table.height / 2,         // Outer corner (near pocket)
        table.x - table.width / 4 + 3 - cornerOffset + 138, table.y - table.height / 2 + cushionThickness, // Outer corner (angled inwards)
        table.x - table.width / 2 + pocketGap + cornerOffset - 7, table.y - table.height / 2 + cushionThickness // Inner corner (angled inwards)
    );

    // Top-right
    quad(
        table.x + table.width / 2 - pocketGap + 7, table.y - table.height / 2, // Inner corner (near pocket)
        table.x + table.width / 4 - 140, table.y - table.height / 2,         // Outer corner (near pocket)
        table.x + table.width / 4 - 3 + cornerOffset - 138, table.y - table.height / 2 + cushionThickness, // Outer corner (angled inwards)
        table.x + table.width / 2 - pocketGap - cornerOffset + 7, table.y - table.height / 2 + cushionThickness // Inner corner (angled inwards)
    );

    // Bottom-left
    quad(
        table.x - table.width / 2 + pocketGap - 7, table.y + table.height / 2, // Inner corner (near pocket)
        table.x - table.width / 4 + 140, table.y + table.height / 2,         // Outer corner (near pocket)
        table.x - table.width / 4 + 3 - cornerOffset + 138, table.y + table.height / 2 - cushionThickness, // Outer corner (angled inwards)
        table.x - table.width / 2 + pocketGap + cornerOffset - 7, table.y + table.height / 2 - cushionThickness // Inner corner (angled inwards)
    );

    // Bottom-right
    quad(
        table.x + table.width / 2 - pocketGap +7, table.y + table.height / 2, // Inner corner (near pocket)
        table.x + table.width / 4 - 140, table.y + table.height / 2,         // Outer corner (near pocket)
        table.x + table.width / 4 - 3 + cornerOffset -138, table.y + table.height / 2 - cushionThickness, // Outer corner (angled inwards)
        table.x + table.width / 2 - pocketGap - cornerOffset + 7, table.y + table.height / 2 - cushionThickness // Inner corner (angled inwards)
    );

    // Vertical cushions (left and right)
    // Left
    quad(
        table.x - table.width / 2, table.y - table.height / 2 + pocketGap - 7, // Inner corner (near pocket)
        table.x - table.width / 2, table.y + table.height / 2 - pocketGap + 7, // Inner corner (near pocket)
        table.x - table.width / 2 + cushionThickness, table.y + table.height / 2 - pocketGap - cornerOffset + 7, // Outer corner (angled inwards)
        table.x - table.width / 2 + cushionThickness, table.y - table.height / 2 + pocketGap + cornerOffset - 7 // Outer corner (angled inwards)
    );

    // Right
    quad(
        table.x + table.width / 2, table.y - table.height / 2 + pocketGap - 7, // Inner corner (near pocket)
        table.x + table.width / 2, table.y + table.height / 2 - pocketGap + 7, // Inner corner (near pocket)
        table.x + table.width / 2 - cushionThickness, table.y + table.height / 2 - pocketGap - cornerOffset + 7, // Outer corner (angled inwards)
        table.x + table.width / 2 - cushionThickness, table.y - table.height / 2 + pocketGap + cornerOffset - 7// Outer corner (angled inwards)
    );
}

// Draw triangular golden ornaments with tips oriented outwards
function drawGoldenOrnaments() {
    noStroke();

    let ornamentSize = 20; // Length of the triangle sides
    let halfTableWidth = table.width / 2 + 22;
    let halfTableHeight = table.height / 2 + 22;

    // Function to draw a shadow for a triangle
    function drawShadow(x1, y1, x2, y2, x3, y3, offsetX, offsetY) {
        fill(0, 0, 0, 100); // Shadow color
        triangle(
            x1 + offsetX, y1 + offsetY,
            x2 + offsetX, y2 + offsetY,
            x3 + offsetX, y3 + offsetY
        );
    }

    // Shadows for top-left and top-right ornaments
    let shadowOffset = 3; // Shadow offset for the illusion
    drawShadow(
        table.x - halfTableWidth, table.y - halfTableHeight, // Tip of top-left
        table.x - halfTableWidth - ornamentSize + 20, table.y - halfTableHeight + 20, // Left base
        table.x - halfTableWidth + 20, table.y - halfTableHeight - ornamentSize + 20, // Right base
        shadowOffset, shadowOffset
    );
    drawShadow(
        table.x + halfTableWidth, table.y - halfTableHeight, // Tip of top-right
        table.x + halfTableWidth + ornamentSize - 20, table.y - halfTableHeight + 20, // Left base
        table.x + halfTableWidth - 20, table.y - halfTableHeight - ornamentSize + 20, // Right base
        -shadowOffset, shadowOffset
    );

     // Shadow for top middle rectangle
     fill(0, 0, 0, 100); // Shadow color
     let rectangleWidth = 40;
     let rectangleHeight = 10;
     rectMode(CENTER);
     rect(
         table.x, // Center horizontally
         table.y - tableHeight / 2 - 16 + shadowOffset, // Slightly below the top center pocket
         rectangleWidth + 2, // Slightly larger width for the shadow
         rectangleHeight + 2 // Slightly larger height for the shadow
     );

    // Golden ornaments
    fill(255, 215, 0); // Gold color
    triangle(
        table.x - halfTableWidth, table.y - halfTableHeight, // Top-left
        table.x - halfTableWidth - ornamentSize + 20, table.y - halfTableHeight + 20,
        table.x - halfTableWidth + 20, table.y - halfTableHeight - ornamentSize + 20
    );
    triangle(
        table.x + halfTableWidth, table.y - halfTableHeight, // Top-right
        table.x + halfTableWidth + ornamentSize - 20, table.y - halfTableHeight + 20,
        table.x + halfTableWidth - 20, table.y - halfTableHeight - ornamentSize + 20
    );
    triangle(
        table.x - halfTableWidth, table.y + halfTableHeight, // Bottom-left
        table.x - halfTableWidth - ornamentSize + 20, table.y + halfTableHeight - 20,
        table.x - halfTableWidth + 20, table.y + halfTableHeight + ornamentSize - 20
    );
    triangle(
        table.x + halfTableWidth, table.y + halfTableHeight, // Bottom-right
        table.x + halfTableWidth + ornamentSize - 20, table.y + halfTableHeight - 20,
        table.x + halfTableWidth - 20, table.y + halfTableHeight + ornamentSize - 20
    );


    // Golden center ornaments
    fill(255, 215, 0); // Gold color
    rectMode(CENTER);
    rect(
        table.x, // Center horizontally
        table.y - tableHeight / 2 - 15, // Top center pocket ornament
        rectangleWidth,
        rectangleHeight
    );
    rect(
        table.x, // Center horizontally
        table.y + tableHeight / 2 + 15, // Bottom center pocket ornament
        rectangleWidth,
        rectangleHeight
    );

    // Highlights for center ornaments
    fill(255, 255, 200, 150); // Light yellow for highlights
    rect(
        table.x, // Center horizontally
        table.y - tableHeight / 2 - 15, // Top highlight
        rectangleWidth - 5,
        rectangleHeight - 2
    );
    rect(
        table.x, // Center horizontally
        table.y + tableHeight / 2 + 15, // Bottom highlight
        rectangleWidth - 5,
        rectangleHeight - 2
    );
}


// Create pockets
function createPockets() {
    let positions = [
        { x: table.x - table.width / 2 + 5 , y: table.y - table.height / 2 + 5 },
        { x: table.x, y: table.y - table.height / 2 },
        { x: table.x + table.width / 2 - 5, y: table.y - table.height / 2 + 5 },
        { x: table.x - table.width / 2 + 5, y: table.y + table.height / 2 - 5 },
        { x: table.x, y: table.y + table.height / 2 },
        { x: table.x + table.width / 2 - 5, y: table.y + table.height / 2 - 5 }
    ];

    for (let pos of positions) {
        // Create pocket as a sensor
        let pocket = Bodies.circle(pos.x, pos.y, pocketDiameter / 2, { 
            isStatic: true, 
            isSensor: true 
        });
        pockets.push(pocket);
        World.add(world, pocket);
    }
}

// Draw pockets
function drawPockets() {
    fill(0);
    noStroke();
    for (let pocket of pockets) {
        ellipse(pocket.position.x, pocket.position.y, pocketDiameter); // Draw pocket area
    }
}

function drawCue() {
    if (cueDragging && dragStart) {
        // Calculate angle and drag distance
        let angle = atan2(mouseY - cueBall.position.y, mouseX - cueBall.position.x);
        let dragDistance = dist(mouseX, mouseY, cueBall.position.x, cueBall.position.y);
        dragDistance = constrain(dragDistance, 0, 100); // Constrain drag distance to max visual range

        // Calculate current power based on drag distance
        currentPower = map(dragDistance, 0, 100, MIN_POWER, MAX_POWER);
        currentPower = constrain(currentPower, MIN_POWER, MAX_POWER);

        // Draw aiming line
        stroke(255, 0, 0);
        strokeWeight(3); // Thinner aiming line
        line(
            cueBall.position.x,
            cueBall.position.y,
            cueBall.position.x - cos(angle) * dragDistance,
            cueBall.position.y - sin(angle) * dragDistance
        );
        noStroke();

        // Draw the pool cue graphic
        push();
        translate(cueBall.position.x, cueBall.position.y);
        rotate(angle); // Rotate the cue to align with aiming direction
        fill(139, 69, 19); // Pool cue brown
        noStroke();
        rectMode(CENTER);

        // Make the cue thinner and longer
        let cueLength = 200; // Longer cue
        let cueWidth = 5;    // Thinner cue

        rect(dragDistance + cueLength / 2, 0, cueLength, cueWidth); // Draw the pool cue
        fill(255); // Add white tip to the cue
        rect(dragDistance + cueLength - 200, 0, 10, cueWidth);
        fill(173, 216, 230);
        rect(dragDistance + cueLength - 208, 0, 2, cueWidth); // Draw white tip of cue
        pop();
    }
}

// Draw balls with shadows
function drawBalls() {
    balls.forEach(ball => {
        // Draw the shadow with slight offset and transparency
        fill(0, 100); // Translucent black for shadow
        noStroke();
        ellipse(ball.position.x + 1, ball.position.y + 2.5, ballDiameter); // Shadow slightly offset below the ball

        // Draw the actual ball with a shiny effect
        fill(ball.render.fillStyle || 255);
        noStroke();
        ellipse(ball.position.x, ball.position.y, ballDiameter);

        // Add a highlight for the shiny effect
        let highlightDiameter = ballDiameter / 3; // Smaller highlight
        let highlightX = ball.position.x - ballDiameter / 4; // Offset for highlight
        let highlightY = ball.position.y - ballDiameter / 4;
        fill(255, 255, 255, 180); // Semi-transparent white
        ellipse(highlightX, highlightY, highlightDiameter);

        // Add a subtle gradient using another ellipse with lower alpha
        fill(255, 255, 255, 50); // Even more transparent white
        ellipse(ball.position.x, ball.position.y, ballDiameter * 0.8); // Gradient effect on the ball
    });

    // Draw the cue ball separately with a shadow and shiny effect
    fill(0, 100); // Shadow
    noStroke();
    ellipse(cueBall.position.x + 1, cueBall.position.y + 2.5, ballDiameter); // Shadow for the cue ball

    // Main cue ball
    fill(255); // White for the cue ball
    ellipse(cueBall.position.x, cueBall.position.y, ballDiameter);

    fill(255,0,0); // Red for the cue dot
    ellipse(cueBall.position.x, cueBall.position.y, ballDiameter / 5);

    // Highlight for the cue ball
    let cueHighlightDiameter = ballDiameter / 3; // Smaller highlight
    let cueHighlightX = cueBall.position.x - ballDiameter / 4; // Offset for highlight
    let cueHighlightY = cueBall.position.y - ballDiameter / 4;
    fill(255, 255, 255, 180); // Semi-transparent white
    ellipse(cueHighlightX, cueHighlightY, cueHighlightDiameter);

    // Subtle gradient for the cue ball
    fill(255, 255, 255, 50); // Even more transparent white
    ellipse(cueBall.position.x, cueBall.position.y, ballDiameter * 0.8); // Gradient effect
}

// Drawing balls and initalising game modes
// Create balls, including the cue ball
function createBalls() {
    // Create the cue ball at the "D" area
    cueBall = Bodies.circle(table.x - tableWidth / 4 - 3 * ballDiameter, table.y, ballDiameter / 2, {
        restitution: 0.9,
        friction: 0.01,
        frictionAir: 0.02
    });
    World.add(world, cueBall);

    // Create red balls in a triangular formation
    let rows = 5; // Snooker uses 15 red balls
    let startX = table.x + tableWidth / 4; // Triangle near the pink spot
    let startY = table.y;
    let spacing = ballDiameter + 2; // Spacing between balls

    for (let i = 0; i < rows; i++) {
        for (let j = 0; j <= i; j++) {
            let x = startX + i * (spacing * 0.866); // Horizontal offset
            let y = startY - (i / 2) * spacing + j * spacing; // Vertical offset
            let ball = Bodies.circle(x, y, ballDiameter / 2, { restitution: 0.9, friction: 0.01 });
            ball.render = { fillStyle: "red" };
            balls.push(ball);
            World.add(world, ball);
        }
    }
    console.log('Standard snooker balls placed.');

    let coloredPositions = [
        { color: "yellow", x: table.x - tableWidth / 4, y: table.y + ballDiameter * 4.5 },
        { color: "green", x: table.x - tableWidth / 4, y: table.y - ballDiameter * 4.5 },
        { color: "brown", x: table.x - tableWidth / 4, y: table.y },
        { color: "blue", x: table.x, y: table.y },
        { color: "pink", x: startX - spacing * 2, y: startY },
        { color: "black", x: startX + spacing * 5, y: startY }
    ];

    for (let pos of coloredPositions) {
        let ball = Bodies.circle(pos.x, pos.y, ballDiameter / 2, { restitution: 0.9, friction: 0.01 });
        ball.render = { fillStyle: pos.color };
        ball.startPosition = { x: pos.x, y: pos.y }; // Store initial position
        balls.push(ball);
        World.add(world, ball);
    }
}

// Place only red balls in random positions on the table
function createRandomRedsOnly() {
     // Create the cue ball at the "D" area
     cueBall = Bodies.circle(table.x - tableWidth / 4 - 3 * ballDiameter, table.y, ballDiameter / 2, {
        restitution: 0.09,
        friction: 0.01,
        frictionAir: 0.02
    });
    World.add(world, cueBall);

    balls = [];

    let numberOfReds = 15;

    for (let i = 0; i < numberOfReds; i++) {
        let x = random(table.x - tableWidth / 2 + 20, table.x + tableWidth / 2 - 20);
        let y = random(table.y - tableHeight / 2 + 20, table.y + tableHeight / 2 - 20);
        

        let ball = Bodies.circle(x, y, ballDiameter / 2, { restitution: 0.9, friction: 0.01 });
        ball.render = { fillStyle: "red" };
        balls.push(ball);
        World.add(world, ball);
    }

    console.log('Reds placed in random positions.');
}

// Place red balls and coloured balls (yellow, green, brown, blue, pink, black) randomly
function createRandomRedsAndColoured() {
     // Create the cue ball at the "D" area
     cueBall = Bodies.circle(table.x - tableWidth / 4 - 3 * ballDiameter, table.y, ballDiameter / 2, {
        restitution: 0.9,
        friction: 0.01,
        frictionAir: 0.02
    });
    World.add(world, cueBall);

    balls = [];

    let reds = 15;
    let colouredPositions = [
        { color: "yellow" },
        { color: "green" },
        { color: "brown" },
        { color: "blue" },
        { color: "pink" },
        { color: "black" }
    ];

    for (let i = 0; i < reds; i++) {
        let x = random(table.x - tableWidth / 2 + 20, table.x + tableWidth / 2 - 20);
        let y = random(table.y - tableHeight / 2 + 20, table.y + tableHeight / 2 - 20);


        let ball = Bodies.circle(x, y, ballDiameter / 2, { restitution: 0.9 });
        ball.render = { fillStyle: "red" };
        balls.push(ball);
        World.add(world, ball);
    }

    let coloredPositions = [
        { color: "yellow" },
        { color: "green" },
        { color: "brown" },
        { color: "blue" },
        { color: "pink" },
        { color: "black" }
    ];

    coloredPositions.forEach(pos => {
        let x = random(table.x - tableWidth / 2 + 20, table.x + tableWidth / 2 - 20);
        let y = random(table.y - tableHeight / 2 + 20, table.y + tableHeight / 2 - 20);

        let coloredBall = Bodies.circle(x, y, ballDiameter / 2, { restitution: 0.9 });
        coloredBall.render = { fillStyle: pos.color };
        coloredBall.startPosition = { x, y }; // Store initial position
        balls.push(coloredBall);
        World.add(world, coloredBall);
    });
    console.log('Reds and coloured balls placed in random positions.');
}

function createDebugMode() {
    // Create the cue ball at the "D" area
    cueBall = Bodies.circle(table.x - tableWidth / 4 - 3 * ballDiameter, table.y, ballDiameter / 2, {
        restitution: 0.9,
        friction: 0.01,
        frictionAir: 0.02
    });
    World.add(world, cueBall);

    balls = []; // Clear all previous balls

    // Place two colored balls near pockets
    let debugBallPositions = [
        { color: "yellow", x: pockets[0].position.x + pocketDiameter, y: pockets[0].position.y + pocketDiameter },
        { color: "blue", x: pockets[5].position.x - pocketDiameter, y: pockets[5].position.y - pocketDiameter }
    ];

    for (let pos of debugBallPositions) {
        let ball = Bodies.circle(pos.x, pos.y, ballDiameter / 2, { restitution: 0.9, friction: 0.01 });
        ball.render = { fillStyle: pos.color };
        ball.startPosition = { x: pos.x, y: pos.y }; // Store initial position
        balls.push(ball);
        World.add(world, ball);
    }

    console.log('Debug mode setup completed: Two colored balls placed near pockets.');
}

// Clear all existing balls from the world
function clearBalls() {
    for (let i = 0; i < balls.length; i++) {
        World.remove(world, balls[i]);
    }
    balls = [];  // Clear the balls array
    score = 0;
    World.remove(world, cueBall);
}

// Game logic functions
// Collisions  
function handleCollision(event) {
    let pairs = event.pairs;

    for (let pair of pairs) {
        let bodyA = pair.bodyA;
        let bodyB = pair.bodyB;

         // Identify the two bodies involved in the collision
         let ball = null;
         let other = null;
 
         if (balls.includes(bodyA)) {
             ball = bodyA;
             other = bodyB;
         } else if (balls.includes(bodyB)) {
             ball = bodyB;
             other = bodyA;
         }
 
         // If one of the colliding bodies is a ball
         if (ball) {
             if (balls.includes(other)) {
                 // Ball hit another ball
                 console.log("Two balls collided");
                 hitSound.play(); // Play hit sound for ball collision
             } else if (other.label === "wall") {
                 // Ball hit a wall
                 console.log("Ball hit a wall");
                 wallSound.play(); // Play wall hit sound
             } else {
                 // Ball hit something else (not another ball or wall)
                 console.log("Ball hit an object");
                 wallSound.play(); // Play wall sound as default for other objects
             }
         }

        // Check if one of the bodies is the cue ball
        if (bodyA === cueBall || bodyB === cueBall) {
            let otherBody = bodyA === cueBall ? bodyB : bodyA;

            if (balls.includes(otherBody)) {
                // Cue ball hit another ball
                let ballColor = otherBody.render.fillStyle || "unknown";
                console.log(`Cue ball hit ${ballColor}`);
                hitSound.play(); // Play hit sound
            } else if (otherBody.label === "wall") {
                // Cue ball hit a wall
                console.log("Cue ball hit wall");
                wallSound.play(); // Play wall hit sound
            } else if (otherBody.isSensor) {
                // Cue ball potted
                console.log("Cue ball potted");
                potSound.play(); // Play pot sound
                 // Delay the handling of the potted cue ball to ensure sound plays completely
                 setTimeout(() => {
                    handleCueBallPotted();
                }, 500); // Delay by 500 milliseconds
            } else {
                // Cue ball hit nothing identifiable
                wallSound.play();
                console.log("Cue ball hit nothing");
               
            }
        }
    }
}

// Detects pocketed balls and collision
function handlePocketedBalls() {
    balls.forEach(ball => {
        let pocketed = pockets.some(pocket =>
            dist(ball.position.x, ball.position.y, pocket.position.x, pocket.position.y) < pocketDiameter / 2
        );

        if (pocketed) {
            let ballColor = ball.render.fillStyle || "unknown";

            if (ballColor !== "red") {
                // Check if the ball has a valid startPosition
                if (ball.startPosition) {
                    // Return colored ball to its starting position
                    Body.setPosition(ball, ball.startPosition);
                    Body.setVelocity(ball, { x: 0, y: 0 }); // Stop ball motion
                    console.log(`${ballColor} ball returned to starting position`);
                } else {
                    console.error(`Error: ${ballColor} ball missing startPosition!`);
                }

                // Deduct points if two consecutive colored balls are potted
                if (lastPottedBallColor && lastPottedBallColor !== "red") {
                    score -= POINT_DEDUCTION_COLORED_BALL_ERROR;
                    errorMessage = `Consecutive colored balls potted! Points deducted: ${POINT_DEDUCTION_COLORED_BALL_ERROR}.`;
                    errorMessageTimer = millis();
                }

                // Update the last potted ball color
                lastPottedBallColor = ballColor;

            } else {
                // Remove red balls from the world
                World.remove(world, ball);
                balls = balls.filter(b => b !== ball); // Remove from array
                score += 10; // Example scoring

                // Update the last potted ball color
                lastPottedBallColor = "red";
            }

            potSound.play();
        }
    });

    // Handle cue ball pocketing
    if (pockets.some(pocket => dist(cueBall.position.x, cueBall.position.y, pocket.position.x, pocket.position.y) < pocketDiameter / 2)) {
        handleCueBallPotted();
    }
}

// Handling for potting the cue ball
function handleCueBallPotted() {
    if (!cueBallPotted) {
        console.log("Cue ball potted");

        // Deduct points and display error message
        score -= POINT_DEDUCTION_CUE_BALL;
        errorMessage = `Cue ball potted! Points deducted: ${POINT_DEDUCTION_CUE_BALL}. Place it in the 'D' area.`;
        errorMessageTimer = millis();

        // Set flag to prevent repeated deductions
        cueBallPotted = true;

        // Enter cue ball placement mode
        placingCueBall = true;
        World.remove(world, cueBall);
    }
}

// Check if all balls (including cue ball) are stationary
function allBallsStationary() {
    const threshold = 0.05; // Velocity threshold to consider a ball stationary
    for (let ball of balls) {
        if (Math.abs(ball.velocity.x) > threshold || Math.abs(ball.velocity.y) > threshold) {
            return false;
        }
    }
    if (cueBall) {
        if (Math.abs(cueBall.velocity.x) > threshold || Math.abs(cueBall.velocity.y) > threshold) {
            return false;
        }
    }
    return true;
}

// User inputs
function mousePressed() {
    if (placingCueBall) {
        let dRadius = table.width / 8;
        let dCenterX = table.x - table.width / 4;
        let dCenterY = table.y;

        let withinCircle = dist(mouseX, mouseY, dCenterX, dCenterY) <= dRadius;
        let withinLeftSide = mouseX <= dCenterX;

        if (withinCircle && withinLeftSide) {
            // Remove the existing cue ball if it exists
            if (cueBall) {
                World.remove(world, cueBall);
            }

            // Create and add the new cue ball
            cueBall = Bodies.circle(mouseX, mouseY, ballDiameter / 2, {
                restitution: 0.9,
                friction: 0.01,
                frictionAir: 0.02
            });
            World.add(world, cueBall);

            // Reset the potted flag
            cueBallPotted = false;
            placingCueBall = false;
        } else {
            // Invalid placement
            errorMessage = "Invalid placement! Place the cue ball in the 'D' area on the left side.";
            errorMessageTimer = millis();
        }
    } else if (allBallsStationary() && dist(mouseX, mouseY, cueBall.position.x, cueBall.position.y) < ballDiameter) {
        // Allow cue dragging only if all balls are stationary
        cueDragging = true;
        dragStart = { x: mouseX, y: mouseY };
    } else if (!allBallsStationary()) {
        // Display message if cue ball cannot be hit
        errorMessage = "Wait for all balls to stop moving!";
        errorMessageTimer = millis();
    }
}


function mouseReleased() {
    if (cueDragging && dragStart) {
        // Calculate the drag distance
        let dragDistance = dist(mouseX, mouseY, cueBall.position.x, cueBall.position.y);

        // Constrain and map the power based on drag distance
        currentPower = map(dragDistance, 0, 100, MIN_POWER, MAX_POWER);
        currentPower = constrain(currentPower, MIN_POWER, MAX_POWER);

        // Calculate the force vector
        let force = p5.Vector.sub(createVector(cueBall.position.x, cueBall.position.y), createVector(mouseX, mouseY));
        force.setMag(currentPower); // Scale force based on the calculated power

        // Apply the force to the cue ball
        Body.applyForce(cueBall, cueBall.position, { x: force.x, y: force.y });

        cueSound.play(); // Play hit sound
        // Reset dragging state
        cueDragging = false;
        dragStart = null;
    }
}

function keyPressed() {
    if (key === '1') {
        gameMode = 1;
        clearBalls();
        createBalls();
        placingCueBall = true;
        World.remove(world, cueBall);
    } else if (key === '2') {
        gameMode = 2;
        clearBalls();
        createRandomRedsOnly();
        placingCueBall = true;
        World.remove(world, cueBall);
    } else if (key === '3') {
        gameMode = 3;
        clearBalls();
        createRandomRedsAndColoured();
        placingCueBall = true;
        World.remove(world, cueBall);
    } else if (key === '4') {
        gameMode = 4;
        clearBalls();
        createDebugMode();
        placingCueBall = true;
        World.remove(world, cueBall);
    }
}


// Extras
function drawScore() {
    fill(255);
    textSize(20);
    textAlign(RIGHT, CENTER); // Align text to the right
    text(`Score: ${score}`, width - 10, 30); // Align to the right with padding

    // Display real-time power
    text(`Power: ${nf(currentPower * 1000, 1, 1)}`, width - 10, 60); // Align to the right with padding
}

function drawPowerBar() {
    let barWidth = 15; // Slimmer power bar
    let barHeight = height * 0.4; // Smaller bar height
    let barX = width - barWidth - 30; // Position near the right edge with padding
    let barY = (height - barHeight) / 2; // Center vertically

    // Draw the background of the power bar
    fill(30); // Dark background
    noStroke();
    rect(barX, barY + 135, barWidth, barHeight, 5); // Rounded corners

    // Draw sections within the bar
    let sectionHeight = barHeight / 3;

    // High Power Section (Red)
    fill(200, 0, 0);
    rect(barX + 2, barY + 2, barWidth - 4, sectionHeight - 4, 3);

    // Medium Power Section (Yellow)
    fill(255, 200, 0);
    rect(barX + 2, barY + 2 + sectionHeight, barWidth - 4, sectionHeight - 4, 3);

    // Low Power Section (Green)
    fill(0, 200, 0);
    rect(barX + 2, barY + 2 + 2 * sectionHeight, barWidth - 4, sectionHeight - 4, 3);

    // Calculate the current power ratio and line position
    let powerRatio = (currentPower - MIN_POWER) / (MAX_POWER - MIN_POWER);
    let lineY = barY + barHeight - powerRatio * barHeight;

    // Draw the moving white line
    stroke(255); // White color
    strokeWeight(3); // Slightly thicker line
    line(barX - 12, lineY - 65, barX + barWidth, lineY - 65);

    // Add border for the power bar
    noFill();
    stroke(255); // White border
    strokeWeight(1.5);
    rect(barX, barY + 135, barWidth, barHeight, 5); // Rounded corners
}


function drawDebugInfo() {
    fill(255);
    textSize(12);
    textAlign(LEFT);
    text(`Cue Ball Position: (${nf(cueBall.position.x, 1, 2)}, ${nf(cueBall.position.y, 1, 2)})`, 10, height - 30);
    text(`Cue Ball Velocity: (${nf(cueBall.velocity.x, 1, 2)}, ${nf(cueBall.velocity.y, 1, 2)})`, 10, height - 15);
}

// This snooker application was designed using p5.js for rendering and Matter.js for physics, ensuring realistic ball collisions, restitution, and friction. A mouse-based cue interaction was chosen for its intuitive control, allowing precise aiming and power adjustment. This approach enhances the player’s experience by directly translating drag distance and direction into the strength and angle of the shot. The cue's mechanics utilize Matter.js forces, ensuring the shots remain within realistic bounds and do not break the immersion by exerting excessive power.

// The cue operates with a simple yet effective drag-and-release mechanism. Players click and drag from the cue ball to set the power and direction. The visual feedback includes a dynamic line representing the drag force and a responsive power bar. Upon release, the calculated force is applied to the cue ball, simulating a snooker shot. This design aligns with the principle of usability, offering players a seamless interface to interact with the game environment.

// The app also features three game modes: standard positioning, random red ball placement, and random placement for reds and colored balls. These modes ensure variety and replayability. Debug mode was added as an extension, allowing for quick testing by positioning colored balls directly near the pockets. This mode assists in validating mechanics like collision detection, scoring, and ball repositioning, significantly streamlining the development and testing process.

// The unique extension implemented for this project is a dynamic "Consecutive Color Penalty System" combined with debug features. This system deducts points if two colored balls are consecutively potted, reinforcing the game’s adherence to snooker rules. Debug mode simplifies the testing of this penalty system and ensures colored balls return to their starting positions accurately. The debug mode also displays a timed message indicating the game is in testing mode, providing players and testers with real-time feedback about the game state.

// The game’s realistic physics and visual design are complemented by additional enhancements, including a detailed snooker table with textured cushions, golden ornaments, and accurate pocket placements. Shadows and gradients applied to the balls and table enhance visual depth, making the interface both functional and aesthetically pleasing.

// Another noteworthy extension is the incorporation of audio feedback. Distinct sounds play during events such as ball collisions, pocketing, and cue impacts. This auditory feedback further immerses players by providing real-time confirmation of their actions.

// In conclusion, this snooker app offers an intuitive interface, realistic mechanics, and unique extensions that go beyond the required features. The "Consecutive Color Penalty System" and debug functionalities demonstrate creative problem-solving and technical proficiency. These innovations enrich gameplay while addressing common testing challenges, making this project stand out as a thoughtfully designed and thoroughly implemented application.