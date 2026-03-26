//global for the controls and input
var controls = null;
//store visualisations in a container
var vis = null;
//variable for the p5 sound object
var sound;
//variable for p5 fast fourier transform
var fourier;
var blockMidHighLowApp;

//soundbar variable
var soundBarHeight = 50;

//setup
function setup()
{
    createCanvas(windowWidth, windowHeight - soundBarHeight);
    background(0);

    controls = new ControlsAndInput();
    fourier = new p5.FFT();

    vis = new Visualisations();
    //new blockmidhighlow
    blockMidHighLowApp = new BlockMidHighLow();
    vis.add(blockMidHighLowApp);
    vis.add(new RidgePlots());
    vis.add(new Spectrogram());
    vis.add(new Spectrum());
    vis.add(new Spectrum2());
    vis.add(new WavePattern());
    vis.add(new WavePattern2());
    vis.add(new Needles());
    vis.add(new RainbowCube());
    //setup for converging lines
    var convergingLines = new ConvergingLines();
    convergingLines.setup();
    vis.add(convergingLines);

    // Add event listeners for the control soundbar
    document.getElementById('fileSelect').addEventListener('change', handleFileSelect);

    var playbackButton = document.getElementById('playbackButton');
    playbackButton.addEventListener('click', togglePlayback);

    var songSlider = document.getElementById('songSlider');
    songSlider.addEventListener('input', updatePlaybackPosition);

    var fullscreenButton = document.getElementById('fullscreenButton');
    fullscreenButton.addEventListener('click', toggleFullscreen);

    
    var volumeSlider = document.getElementById('volumeSlider');
    volumeSlider.addEventListener('input', updateVolume);

}

//call draw for the visualisation constructors
function draw()
{
    background(0);
    // if statement to update the song slider on the sound bar
    if (sound && sound.isPlaying())
    {   
        var songSlider = document.getElementById('songSlider');
        songSlider.value = map(sound.currentTime(), 0, sound.duration(), 0, 100);
        document.getElementById('currentTime').textContent = formatTime(sound.currentTime());
        document.getElementById('totalTime').textContent = formatTime(sound.duration());
    }
    // draw the visual
    vis.selectedVisual.draw();
    controls.draw();
}

//detect keystrokes
function keyPressed(event) {
   
    controls.keyPressed(keyCode, event);
}


//resize for when the window is fullscreened
function windowResized()
{
    resizeCanvas(windowWidth, windowHeight - soundBarHeight);
    if (vis.selectedVisual.hasOwnProperty('onResize')) 
    {
        vis.selectedVisual.onResize();
    }
}

//file selector for different music
function handleFileSelect(event) 
{
    // Get the selected file from the dropdown
    var file = event.target.value;  

    var volumeSlider = document.getElementById('volumeSlider');
    // Get the current volume value from the slider
    var volumeValue = parseFloat(volumeSlider.value); 

    // Stops the previous sound if any
    if (sound) 
        {  
        sound.stop();
        sound = null;
    }

    // Load the selected file
    sound = loadSound(file, function() 
    {
        sound.play();  // Automatically start playing the new sound
        sound.setVolume(volumeValue); // Set the volume to the previous value
        document.getElementById('playbackButton').textContent = 'Pause';
    });
}

//new playback button in the soundbar
function togglePlayback() 
{
    if (sound) 
		{
        if (sound.isPlaying()) 
		{
            sound.pause();
            document.getElementById('playbackButton').textContent = 'Play';
        } 
		else 
		{
            sound.play();
            document.getElementById('playbackButton').textContent = 'Pause';
        }
    }
}

//soundbar music slider to fast forward or rewind the song
function updatePlaybackPosition() 
{
    if (sound) 
	{
        var songSlider = document.getElementById('songSlider');
        var newTime = map(songSlider.value, 0, 100, 0, sound.duration());
        sound.jump(newTime);
    }
}

// update the volume
function updateVolume() {
    if (sound && sound.isLoaded()) {
        var volumeSlider = document.getElementById('volumeSlider');
        var volumeValue = parseFloat(volumeSlider.value);
        console.log("Volume Value Being Set:", volumeValue);
        sound.setVolume(volumeValue);
    } else {
        console.log("Sound is not loaded yet.");
    }
}

//show the runtime of the song in the soundbar
function formatTime(seconds) 
{
    var min = Math.floor(seconds / 60);
    var sec = Math.floor(seconds % 60);
    return min + ':' + (sec < 10 ? '0' : '') + sec;
}

//fullscreen function for the new fullscreen button
function toggleFullscreen() 
{
    let fs = fullscreen();
    fullscreen(!fs);
    if (fullscreen()) 
	{
        resizeCanvas(windowWidth, windowHeight);
    } 
	else 
	{
        resizeCanvas(windowWidth, windowHeight - soundBarHeight);
    }
}