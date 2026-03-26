//MODIFIED new radial rotating spectrum vis start
function Spectrum2() {
    this.name = "Spectrum 2";

    var rotationAngle = 0; 

    //draw the new radial spectrum
    this.draw = function() 
    {
        push();
        var spectrum = fourier.analyze();
        //new variables to modify the spectrum to be radial
        var angleStep = TWO_PI / spectrum.length;
        var centerX = width / 2;
        var centerY = height / 2;

        //increase amplitude multiplier make the circle bigger
        var amplitudeMultiplier = 2.5; 

        //rotate the radial spectrum around the center
        rotationAngle += 0.001; 

        //draw the lines coming out of the middle when song is played
        for (var i = 0; i < spectrum.length; i++) 
        {
            //limit amp range
            var amplitude = map(spectrum[i], 0, 255, 10, min(width, height) / 2 * amplitudeMultiplier);

            //calculate the outward lines
            var x1_out = centerX + cos(i * angleStep + rotationAngle) * amplitude;
            var y1_out = centerY + sin(i * angleStep + rotationAngle) * amplitude;

            //calculate inward lines
            var x1_in = centerX + cos(i * angleStep + PI + rotationAngle) * amplitude;
            var y1_in = centerY + sin(i * angleStep + PI + rotationAngle) * amplitude;

            //draw outward line
            stroke(spectrum[i], 255 - spectrum[i], 0); 
            line(centerX, centerY, x1_out, y1_out);

            //draw inward line
            stroke(0, spectrum[i], 255 - spectrum[i]); 
            line(centerX, centerY, x1_in, y1_in);
        }
        pop();
    };
}
//end of radial spectrum
