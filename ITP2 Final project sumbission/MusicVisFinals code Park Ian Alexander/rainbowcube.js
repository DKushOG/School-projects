//NEW rainbowcube Vis featuring WEBGL
function RainbowCube() 
{
    this.name = "Rainbow Cube";
    let angleX = 0;
    let angleY = 0;
    let bulgeAmount = 0;
    let rotationSpeedX = 0.01;
    let rotationSpeedY = 0.01;

    // Create a 3D graphics object
    let pg;

    // Function to center the cube on resize
    this.onResize = function() 
    {
        resizeCanvas(windowWidth, windowHeight - soundBarHeight);
        setupGraphics();
    };

     // Setup the graphics using webGL
    function setupGraphics() 
    {
        pg = createGraphics(windowWidth, windowHeight - soundBarHeight, WEBGL);
        pg.strokeWeight(2);
    }
    setupGraphics(); 

    // Draw the 3D rainbow cube
    this.draw = function() 
    {
        push();
        let spectrum = fourier.analyze();
        let wave = fourier.waveform();

        // Clear the previous frame
        pg.clear();

        // Update angles based on the music
        rotationSpeedX = map(spectrum[1], 0, 255, 0.005, 0.05);  
        rotationSpeedY = map(spectrum[1], 0, 255, 0.005, 0.05);
        angleX += rotationSpeedX;
        angleY += rotationSpeedY;

        // Bulge the sides based on bass frequencies
        bulgeAmount = map(spectrum[0], 0, 255, -50, 50);
        pg.push(); 
        pg.translate(0,0); 
        pg.rotateX(angleX);
        pg.rotateY(angleY);

        // Define cube vertices with bulge effect
        let vertices = [
            {x: -100, y: -100, z: -100},
            {x:  100, y: -100, z: -100},
            {x:  100, y:  100, z: -100},
            {x: -100, y:  100, z: -100},
            {x: -100, y: -100, z:  100},
            {x:  100, y: -100, z:  100},
            {x:  100, y:  100, z:  100},
            {x: -100, y:  100, z:  100}
        ];

        // Apply bulge effect to vertices
        for (let i = 0; i < vertices.length; i++) 
        {
            let v = vertices[i];
            let distance = dist(v.x, v.y, v.z, 0, 0, 0);
            let bulge = map(spectrum[1], 0, 255, -50, 50);
            v.x += bulge * (v.x / distance);
            v.y += bulge * (v.y / distance);
            v.z += bulge * (v.z / distance);
        }

        // Draw the cube faces with different colors
        let faces = 
        [
            [0, 1, 2, 3], // Front
            [4, 5, 6, 7], // Back
            [0, 1, 5, 4], // Bottom
            [2, 3, 7, 6], // Top
            [0, 3, 7, 4], // Left
            [1, 2, 6, 5]  // Right
        ];
        // Rainbow colours
        let colors = 
        [
            color(255, 0, 0, 150),  // Red
            color(255, 127, 0, 150), // Orange
            color(255, 255, 0, 150), // Yellow
            color(0, 255, 0, 150),  // Green
            color(0, 0, 255, 150),  // Blue
            color(75, 0, 130, 150)  // Indigo
        ];

        pg.noStroke();
        for (let i = 0; i < faces.length; i++) 
            {
            let face = faces[i];
            pg.beginShape();
            pg.fill(colors[i]);

            for (let j = 0; j < face.length; j++) 
            {
                let vertexIndex = face[j];
                pg.vertex(vertices[vertexIndex].x, vertices[vertexIndex].y, vertices[vertexIndex].z);
            }

            pg.endShape(CLOSE);
        }

        pg.pop();
        image(pg, 0, 0);
        pop();
    };
}
// End of RainbowCube vis