/*
  ==============================================================================

    DeckGUI.cpp
    Created: 13 Mar 2020 6:44:48pm
    Author:  matthew

  ==============================================================================
*/

#include "../JuceLibraryCode/JuceHeader.h"
#include "DeckGUI.h"

// Initializes the deck user interface
// Adds playback controls, sliders, labels, and waveform display
DeckGUI::DeckGUI(DJAudioPlayer* _player,
    juce::AudioFormatManager& formatManagerToUse,
    juce::AudioThumbnailCache& cacheToUse)
    : player(_player),
    waveformDisplay(formatManagerToUse, cacheToUse)
{
    // Transport Buttons
    addAndMakeVisible(playButton);
    addAndMakeVisible(stopButton);
    addAndMakeVisible(loadButton);

    playButton.addListener(this);
    stopButton.addListener(this);
    loadButton.addListener(this);

    // Sliders (volume, speed, position, pitch)
    addAndMakeVisible(volSlider);
    volSlider.addListener(this);
    volSlider.setRange(0.0, 1.0, 0.01);
    volSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    volSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    volSlider.setValue(0.5);

    addAndMakeVisible(speedSlider);
    speedSlider.addListener(this);
    speedSlider.setRange(0.5, 2.0, 0.01);
    speedSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    speedSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    speedSlider.setValue(1.0);

    addAndMakeVisible(posSlider);
    posSlider.addListener(this);
    posSlider.setRange(0.0, 1.0, 0.01);
    posSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    posSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);

    addAndMakeVisible(pitchSlider);
    pitchSlider.addListener(this);
    pitchSlider.setRange(-12.0, 12.0, 0.1);
    pitchSlider.setSliderStyle(juce::Slider::RotaryHorizontalVerticalDrag);
    pitchSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 50, 20);
    pitchSlider.setValue(0.0);

    // Loop start/end
    addAndMakeVisible(startSlider);
    startSlider.addListener(this);
    startSlider.setRange(0.0, 1.0, 0.01);
    startSlider.setSliderStyle(juce::Slider::LinearHorizontal);
    startSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 20);
    startSlider.setValue(0.0);

    addAndMakeVisible(endSlider);
    endSlider.addListener(this);
    endSlider.setRange(0.0, 1.0, 0.01);
    endSlider.setSliderStyle(juce::Slider::LinearHorizontal);
    endSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 60, 20);
    endSlider.setValue(1.0);

    // Labels
    addAndMakeVisible(volumeLabel);
    volumeLabel.setJustificationType(juce::Justification::centred);
    volumeLabel.setInterceptsMouseClicks(false, false);

    addAndMakeVisible(speedLabel);
    speedLabel.setJustificationType(juce::Justification::centred);
    speedLabel.setInterceptsMouseClicks(false, false);

    addAndMakeVisible(positionLabel);
    positionLabel.setJustificationType(juce::Justification::centred);
    positionLabel.setInterceptsMouseClicks(false, false);

    addAndMakeVisible(pitchLabel);
    pitchLabel.setJustificationType(juce::Justification::centred);
    pitchLabel.setInterceptsMouseClicks(false, false);

    addAndMakeVisible(startLabel);
    startLabel.setJustificationType(juce::Justification::centred);
    startLabel.setInterceptsMouseClicks(false, false);

    addAndMakeVisible(endLabel);
    endLabel.setJustificationType(juce::Justification::centred);
    endLabel.setInterceptsMouseClicks(false, false);

    // Loop toggle
    addAndMakeVisible(loopToggle);
    loopToggle.addListener(this);
    loopToggle.setToggleState(false, juce::dontSendNotification);

    // Waveform display
    addAndMakeVisible(waveformDisplay);

    // Some color changes
    // Bright neon cyan thumb for rotary sliders
    volSlider.setColour(juce::Slider::thumbColourId, juce::Colours::cyan);
    speedSlider.setColour(juce::Slider::thumbColourId, juce::Colours::cyan);
    posSlider.setColour(juce::Slider::thumbColourId, juce::Colours::cyan);
    pitchSlider.setColour(juce::Slider::thumbColourId, juce::Colours::cyan);

    // Light blue track for better contrast
    volSlider.setColour(juce::Slider::trackColourId, juce::Colours::cyan.withBrightness(0.9f));
    speedSlider.setColour(juce::Slider::trackColourId, juce::Colours::cyan.withBrightness(0.9f));
    posSlider.setColour(juce::Slider::trackColourId, juce::Colours::cyan.withBrightness(0.9f));
    pitchSlider.setColour(juce::Slider::trackColourId, juce::Colours::cyan.withBrightness(0.9f));

    // Light red-pink track for better visibility
    startSlider.setColour(juce::Slider::trackColourId, juce::Colours::red.withBrightness(1.0f));
    endSlider.setColour(juce::Slider::trackColourId, juce::Colours::pink.withBrightness(1.0f));

    // Bright red thumb for better contrast
    startSlider.setColour(juce::Slider::thumbColourId, juce::Colours::red);
    endSlider.setColour(juce::Slider::thumbColourId, juce::Colours::pink);

    // Buttons
    playButton.setColour(juce::TextButton::buttonColourId, juce::Colours::black.brighter(0.2f));
    stopButton.setColour(juce::TextButton::buttonColourId, juce::Colours::black.brighter(0.2f));
    loadButton.setColour(juce::TextButton::buttonColourId, juce::Colours::black.brighter(0.2f));

    // Start a timer to update waveform position ~30 times/sec
    startTimerHz(30);
}

// Stops the timer and cleans up resources
DeckGUI::~DeckGUI()
{
    stopTimer();
}

// Draws the background
void DeckGUI::paint(juce::Graphics& g)
{
    // Background gradient
    juce::ColourGradient backgroundGradient(
        juce::Colour::fromRGB(15, 15, 15), 0.0f, 0.0f,
        juce::Colour::fromRGB(40, 40, 40), 0.0f, (float)getHeight(),
        false);
    g.setGradientFill(backgroundGradient);
    g.fillRect(getLocalBounds());
}

// Adjusts component layout based on window size
void DeckGUI::resized()
{
    auto area = getLocalBounds();

    // Waveform at the top 
    int waveformHeight = juce::roundToInt(area.getHeight() * 0.35f);
    auto waveformArea = area.removeFromTop(waveformHeight);
    waveformDisplay.setBounds(waveformArea);

    // Transport buttons 
    int buttonHeight = juce::roundToInt(area.getHeight() * 0.1f);
    auto buttonArea = area.removeFromTop(buttonHeight);

    int buttonWidth = buttonArea.getWidth() / 3;
    playButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));
    stopButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));
    loadButton.setBounds(buttonArea.removeFromLeft(buttonWidth).reduced(5));

    // Rotary knobs row 
    int knobRowHeight = 150;
    auto knobRow = area.removeFromTop(knobRowHeight);

    int numKnobs = 4;
    int knobWidth = knobRow.getWidth() / numKnobs;

    auto volArea = knobRow.removeFromLeft(knobWidth).reduced(10);
    auto spdArea = knobRow.removeFromLeft(knobWidth).reduced(10);
    auto posArea = knobRow.removeFromLeft(knobWidth).reduced(10);
    auto pitchArea = knobRow.removeFromLeft(knobWidth).reduced(10);

    volSlider.setBounds(volArea);
    speedSlider.setBounds(spdArea);
    posSlider.setBounds(posArea);
    pitchSlider.setBounds(pitchArea);

    // Start/End sliders row 
    int regionRowHeight = 80;
    auto regionRow = area.removeFromTop(regionRowHeight);

    auto startArea = regionRow.removeFromLeft(regionRow.getWidth() / 2).reduced(10);
    auto endArea = regionRow.removeFromLeft(regionRow.getWidth()).reduced(10);

    startSlider.setBounds(startArea.removeFromTop(40));
    endSlider.setBounds(endArea.removeFromTop(40));

    startSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 80, 30);
    endSlider.setTextBoxStyle(juce::Slider::TextBoxBelow, false, 80, 30);

    // Place their labels above
    int labelHeight = 100;
    startLabel.setBounds(startArea.withHeight(labelHeight).translated(0, -labelHeight - 5));
    endLabel.setBounds(endArea.withHeight(labelHeight).translated(0, -labelHeight - 5));

    // Loop toggle
    auto loopArea = area.removeFromTop(40).reduced(10);
    loopToggle.setBounds(loopArea);

    // Labels
    volumeLabel.setBounds(volArea.withHeight(labelHeight).translated(0, -labelHeight + 50));
    speedLabel.setBounds(spdArea.withHeight(labelHeight).translated(0, -labelHeight + 50));
    positionLabel.setBounds(posArea.withHeight(labelHeight).translated(0, -labelHeight + 50));
    pitchLabel.setBounds(pitchArea.withHeight(labelHeight).translated(0, -labelHeight + 50));
}

// Handles play, stop, and load button events
void DeckGUI::buttonClicked(juce::Button* button)
{
    if (button == &playButton)
    {
        // Check if playback has ended
        if (player->hasPlaybackEnded())  
        {
            // Reset to start of playback
            player->setPosition(0.0); 
        }

        player->start();
    }

    else if (button == &stopButton) 
    { 
        player->stop(); 
    }
    else if (button == &loadButton)
    {
        auto fileChooserFlags = juce::FileBrowserComponent::canSelectFiles;
        fChooser.launchAsync(fileChooserFlags, [this](const juce::FileChooser& chooser)
            {
                auto chosenFile = chooser.getResult();
                if (chosenFile.existsAsFile())
                {
                    player->loadURL(juce::URL{ chosenFile });
                    waveformDisplay.loadURL(juce::URL{ chosenFile });
                }
            });
    }
    else if (button == &loopToggle)
    {
        bool shouldLoop = loopToggle.getToggleState();
        double startVal = startSlider.getValue();
        double endVal = endSlider.getValue();

        player->setLoopParameters(shouldLoop, startVal, endVal);

        if (shouldLoop)
        {
            double trackLength = player->getTrackLength();
            player->setPosition(startVal * trackLength); // Use getTrackLength() here
            player->start();  // Ensure playback starts at loop start position
        }
    }
}

// Updates audio properties when sliders are adjusted
void DeckGUI::sliderValueChanged(juce::Slider* slider)
{
    // Adjust gain when the volume slider is changed
    if (slider == &volSlider) 
    { 
        player->setGain(volSlider.getValue()); 
    }
    // Adjust playback speed when the speed slider is changed
    else if (slider == &speedSlider) 
    { 
        player->setSpeed(speedSlider.getValue()); 
    }
    // Update the playback position when the position slider is moved
    else if (slider == &posSlider)
    {
        player->setPositionRelative(posSlider.getValue());
        waveformDisplay.setPositionRelative(posSlider.getValue());
    }
    // Modify the pitch (semitone shift) when the pitch slider is changed
    else if (slider == &pitchSlider)
    {
        double semitones = pitchSlider.getValue();
        player->setPitch(semitones);
    }
    // Handle looping start and end positions when loop sliders are adjusted
    else if (slider == &startSlider || slider == &endSlider)
    {
        double startVal = startSlider.getValue();
        double endVal = endSlider.getValue();
        if (startVal > endVal)
            std::swap(startVal, endVal);

        // Update the loop parameters in the player if looping is enabled
        if (loopToggle.getToggleState())
            player->setLoopParameters(true, startVal, endVal);

        // Update the waveform display to reflect the new loop region
        waveformDisplay.setRegionStartEnd(startVal, endVal);
    }
}

// Checks if the component should accept dragged files
bool DeckGUI::isInterestedInFileDrag(const juce::StringArray& files)
{
    return true;
}

// Handles file drops onto the deck component
void DeckGUI::filesDropped(const juce::StringArray& files, int x, int y)
{
    if (files.size() == 1)
    {
        juce::File file{ files[0] };
        if (file.existsAsFile())
        {
            player->loadURL(juce::URL{ file });
            waveformDisplay.loadURL(juce::URL{ file });
        }
    }
}

// Updates the waveform playhead position and position slider during playback
void DeckGUI::timerCallback()
{
    // Update waveform's playhead
    waveformDisplay.setPositionRelative(player->getPositionRelative());

    // Update the slider to match the playback position
    posSlider.setValue(player->getPositionRelative(), juce::dontSendNotification);
}

// Loads a file into the deck 
void DeckGUI::loadFileIntoDeck(const juce::File& file)
{
    // Programmatically load the file into this deck
    player->loadURL(juce::URL{ file });
    waveformDisplay.loadURL(juce::URL{ file });
}
