// Block visualisation start
var rotateThresh;
var progThresh;
var seedThresh;

var boxColour = '#0000FF';
var lineColour = '00FF00';

// Store the GUI instance globally to prevent duplication
var gui;
var isCollapsed = false; // Flag to track the collapsed state

function BlockMidHighLow() {
    this.name = "Block Mid High Low"
    var rot = 0;
    var noiseStep = 0.01;
    var prog = 0;

    // Setup for GUI, but only once
    this.setup = function() {
        // Check if the GUI is already created
        if (!gui) {
            rotateThresh = 67;
            progThresh = 100;
            seedThresh = 100;

            gui = createGui('--------BlockMidHighLow GUI------------( Double-click to collapse )----');
            gui.setPosition(width - 200, 0);

            sliderRange(0.001, 1, 0.001);
            gui.addGlobals('noiseStep');

            sliderRange(0, 255, 1);
            gui.addGlobals('rotateThresh');
            gui.addGlobals('progThresh');
            gui.addGlobals('seedThresh');

            gui.addGlobals('boxColour');
            gui.addGlobals('lineColour');
            
            // Add click event listener for the top bar to toggle collapse
            var topBar = document.querySelector('.gui-title');
            if (topBar) {
                topBar.addEventListener('click', this.toggleCollapse);
            }
        } 
        else {
            // If GUI already exists, just update its position
            gui.setPosition(width - 200, 0);
        }
    }
    this.setup();

    // Toggle collapse/expand
    this.toggleCollapse = function() {
        isCollapsed = !isCollapsed;
        if (isCollapsed) {
            // Collapse the GUI into a single bar
            gui.setSize(200, 30);
            var controls = gui._controls;
            controls.forEach(function(control) {
                control.hide();
            });
        } else {
            // Expand the GUI
            gui.setSize(200, 400); // Adjust the height as needed
            var controls = gui._controls;
            controls.forEach(function(control) {
                control.show();
            });
        }
    }

    // Resizing function
    this.onResize = function() {
        if (gui) {
            gui.setPosition(width - 200, 0);
        }
    }
    this.onResize();

    // Draw the blocks and noise line
    this.draw = function() {
        fourier.analyze();
        var b = fourier.getEnergy("bass");
        var t = fourier.getEnergy("treble");

        rotatingBlocks(b);
        noiseLine(b, t);
    }

    // Blocks drawing and animation
    function rotatingBlocks(energy) {
        if (energy < rotateThresh) {
            rot += 0.01;
        }

        var r = map(energy, 0, 255, 20, 100);

        push();
        rectMode(CENTER);
        translate(width / 2, height / 2);
        rotate(rot);

        fill(boxColour);

        var incr = width / (10 - 1);

        for (var i = 0; i < 10; i++) {
            rect(i * incr - width / 2, 0, r, r);
        }
        pop();
    }

    // Noise line animation
    function noiseLine(energy1, energy2) {
        push();
        translate(width / 2, height / 2);

        beginShape();
        noFill();
        stroke(lineColour);
        strokeWeight(3);

        for (var i = 0; i < 100; i++) {
            var x = map(noise(i * noiseStep + prog), 0, 1, -250, 250);
            var y = map(noise(i * noiseStep + prog + 1000), 0, 1, -250, 250);
            vertex(x, y);
        }
        endShape();

        if (energy1 > progThresh) {
            prog += 0.05;
        }

        if (energy2 > progThresh) {
            noiseSeed();
        }
        pop();
    }

    // Detect if mouse is inside the GUI
    this.isMouseInGUI = function() {
        var inGUI = false;
        var gui_x = gui._panel.style.left;
        var gui_y = gui._panel.style.top;
        var gui_height = gui._panel.clientHeight;
        var gui_width = gui._panel.clientWidth;
        gui_x = parseInt(gui_x, 10);
        gui_y = parseInt(gui_y, 10);
        gui_height = parseInt(gui_height, 10);
        gui_width = parseInt(gui_width, 10);

        if (mouseX > gui_x && mouseX < gui_x + gui_width) {
            if (mouseY > gui_y && mouseY < gui_y + gui_height) {
                inGUI = true;
            }
        }
        return inGUI;
    }

    // Show GUI (WIP)
    this.selectVisual = function() {
        console.log("select");
        gui.show();
    }
}
// Block vis end
