//NEW VIS spectrogram vis start
function Spectrogram() {
    this.name = "spectrogram";

    //store the previous spectra for the spectrogram
    this.spectrogramData = [];

    //variables to control speed and color, hig number move faster
    this.speed = 7; 

    //background color for the spectrogram
    this.backgroundColor = color(0); 

    // Color for the waveform
    this.waveformColor = color(0, 0, 255); 

    this.draw = function() 
    {
        //Set the maximum number of spectra to display (width of the spectrogram)
        var maxSpectra = width / this.speed;

        //current waveform
        var waveform = fourier.waveform();

        // Add the current waveform to the spectrogram data
        this.spectrogramData.push(waveform);

        //remove old waveforms after scrolling
        if (this.spectrogramData.length > maxSpectra) 
        {
            this.spectrogramData.shift();
        }

        //draw the spectrogram background
        background(this.backgroundColor);

        //draw the waveform
        push();
        stroke(0);
        fill(this.waveformColor);

        //translate the canvas origin to the center horizontally
        translate(0, height / 2);

        for (var x = 0; x < this.spectrogramData.length; x++) 
        {
            var currentWaveform = this.spectrogramData[x];
            for (var y = 0; y < currentWaveform.length; y++) 
            {
                var amplitude = currentWaveform[y];

                //map the amplitude to a height value
                var rectHeight = map(amplitude, -1, 1, -height / 2, height / 2);

                //draw the line extending above and below the center line
                rect(x * this.speed, 0, this.speed, rectHeight);
            }
        }
        pop();
    };
}
//spectrogram end
