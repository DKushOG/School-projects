//MODIFIED radial waveform
function WavePattern2() 
{
    this.name = "Wavepattern 2";

    // Rainbow waves
    function getRainbowColor() 
    {
        let t = (frameCount % 360) / 360; // This creates a value that loops from 0 to 1
        let r = Math.sin(2 * Math.PI * t + 0) * 127 + 128; // Red component
        let g = Math.sin(2 * Math.PI * t + 2 * Math.PI / 3) * 127 + 128; // Green component
        let b = Math.sin(2 * Math.PI * t + 4 * Math.PI / 3) * 127 + 128; // Blue component
        return color(r, g, b);
    }
    // Draw the wave form on the screen
    this.draw = function() 
    {
        push();
        noFill();

        stroke(getRainbowColor());
        strokeWeight(2);

        // Designate center of the window
        var centerX = width / 2;
        var centerY = height / 2;
        // Circle radius
        var radius = min(width, height) / 3;
        var smallRadius = radius / 2; // Radius for the smaller circle

        // Draw the bigger circle waveform
        beginShape();
        var wave = fourier.waveform();
        var angleStep = TWO_PI / wave.length;

        for (var i = 0; i < wave.length; i++) 
        {
            var amplitude = map(wave[i], -1, 1, 0, radius);
            var angle = i * angleStep;

            var x = centerX + amplitude * cos(angle);
            var y = centerY + amplitude * sin(angle);

            vertex(x, y);
        }

        endShape(CLOSE);

        stroke(getRainbowColor());
        // Draw the smaller circle waveform
        beginShape();
        var smallWave = fourier.waveform(); // Optionally, you can use a different waveform or modify the smallWave array
        var smallAngleStep = TWO_PI / smallWave.length;

        for (var i = 0; i < smallWave.length; i++) {
            var smallAmplitude = map(smallWave[i], -1, 1, 0, smallRadius);
            var angle = i * smallAngleStep;

            var x = centerX + smallAmplitude * cos(angle);
            var y = centerY + smallAmplitude * sin(angle);

            vertex(x, y);
        }

        endShape(CLOSE);

        // red right line
        stroke(255,0,0); 
        strokeWeight(2);
        beginShape();
		//calculate the waveform from the fft.
		var wave = fourier.waveform();
		for (var i = 0; i < wave.length; i++) 
        {
			//for each element of the waveform map it to screen
			//coordinates and make a new vertex at the point.
			var x = map(i, 0, wave.length, 0, width/2 - radius/2);
			var y = map(wave[i], -1, 1, 0, height);

			vertex(x, y);
		}

		endShape();

        // blue left line
        stroke(0,0,255);
        strokeWeight(2);
        beginShape();
		var wave = fourier.waveform();
        for (var i = 0; i < wave.length; i++) 
        {
            // Map the x-coordinate from the full width of the screen
            var x = map(i, 0, wave.length, width, width / 2 + radius / 2);
            var y = map(wave[i], -1, 1, 0, height);

            vertex(x, y);
		}

		endShape();

        pop();
    };
}
//end of wavePattern