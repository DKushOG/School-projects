// NEW Converging lines vis including particle effects
// ConvergingLines class with particle effects
function ConvergingLines() 
{
    this.name = "ConvergingLines";
    this.musicStarted = false;
    this.baseFrequency = 0.02;
    this.maxFrequencyMultiplier = 5;
    this.lineColors = [];
    // Array to store particles
    this.particles = []; 

    // Initialize colors for each line
    this.initColors = function(numLines) 
    {
        this.lineColors = [];
        for (var i = 0; i < numLines; i++) 
        {
            this.lineColors.push(color(random(255), random(255), random(255)));
        }
    };
    // draw vis
    this.draw = function() 
    {
        push();
        // Get frequency spectrum and the intensity of the music
        var wave = fourier.waveform();
        var spectrum = fourier.analyze(); 
        var intensity = max(spectrum); 

        // Set number of lines and gap between them
        var numLines = 10;
        var lineSpacing = width / (numLines * 2);

        var centerX = width / 2;
        var centerY = height / 2;

        if (this.lineColors.length === 0) 
        {
            this.initColors(numLines);
        }

        if (sound && sound.isPlaying()) 
        {
            this.musicStarted = true;
        } 
        else 
        {
            this.musicStarted = false;
        }

        // Draw lines
        for (var i = 0; i < numLines; i++) 
        {
            var xPos = i * lineSpacing;
            if (xPos > width / 2) break;

            var amplitude = map(wave[i], -1, 1, 0, height / 2);
            var frequency = this.baseFrequency + (intensity / 255) * this.maxFrequencyMultiplier;
            var waveOffset = sin(xPos * frequency + frameCount * 0.1) * (10 + (intensity / 255) * 10);

            stroke(this.lineColors[i]);

            if (this.musicStarted) 
            {
                line(centerX, centerY, xPos, height - amplitude + waveOffset);
                line(centerX, centerY, width - xPos, height - amplitude + waveOffset);
            } 

            else 
            {
                line(centerX, centerY, xPos, height - amplitude);
                line(centerX, centerY, width - xPos, height - amplitude);
            }
        }

        // Handle particles
        if (this.musicStarted) {
            // Add new particles
            for (var i = 0; i < 1; i++) 
            { 
                this.particles.push(new Particle());
            }

            // Update and display particles
            for (var i = this.particles.length - 1; i >= 0; i--) 
            {
                this.particles[i].update(intensity);
                this.particles[i].display();

                if (this.particles[i].lifetime <= 0) 
                {
                    this.particles.splice(i, 1);
                }
            }
        }

        pop();
    };

    this.setup = function() 
    {
        this.initColors(10);
    };
}
// Particle class 
class Particle 
{
    constructor() 
    {
        // Start at the center
        this.position = createVector(width / 2, height / 2); 
        // Random initial direction
        this.velocity = p5.Vector.random2D(); 
        // Speed and size of the particles
        this.speed = random(0.5, 1); 
        this.size = random(5, 10);
        // Lifetime of the particle
        this.lifetime = 255; 
    }

    update(intensity) 
    {
        // Adjust speed based on the intensity
        this.speed = map(intensity, 0, 255, 0.5, 2); 
        
        // Update velocity based on speed
        this.velocity.setMag(this.speed);
        
        // Update position based on velocity
        this.position.add(this.velocity);
        
        // Reduce lifetime and speed up the fadeout
        this.lifetime -= 1;
        
        // If the particle reaches the edge of the canvas, mark it for removal
        if (this.position.x < 0 || this.position.x > width || this.position.y < 0 || this.position.y > height || this.lifetime <= 0) {
            // Ensure the particle is marked to fade out
            this.lifetime = 0; 
        }
    }
    //display the particles
    display() 
    {
        noStroke();
        fill(255, this.lifetime);
        ellipse(this.position.x, this.position.y, this.size);
    }
}
// end of convergingLines vis