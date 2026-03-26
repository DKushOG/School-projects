/*
  ==============================================================================

    WaveformDisplay.h
    Created: 14 Mar 2020 3:50:16pm
    Author:  matthew

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"

// waveform display: renders an audio waveform visualization
// updates dynamically based on playback and looping region
class WaveformDisplay : public juce::Component,
    public juce::ChangeListener
{
public:
    // constructor: initializes the waveform display with an audio format manager and cache
    WaveformDisplay(juce::AudioFormatManager& formatManagerToUse,
        juce::AudioThumbnailCache& cacheToUse);

    // destructor: cleans up the waveform display
    ~WaveformDisplay() override;

    // paint: draws the waveform visualization
    void paint(juce::Graphics&) override;

    // resized: handles resizing of the waveform display
    void resized() override;

    // change listener callback: updates the waveform when the audio thumbnail changes
    void changeListenerCallback(juce::ChangeBroadcaster* source) override;

    // load url: loads an audio file into the waveform display
    void loadURL(juce::URL audioURL);

    // set position relative: moves the playhead in the waveform
    // accepts a value from 0.0 (start) to 1.0 (end)
    void setPositionRelative(double pos);

    // set region start and end: defines the loop start and end points
    void setRegionStartEnd(double start, double end);

private:
    // handles waveform generation
    juce::AudioThumbnail audioThumb; 
    // whether a file is currently loaded
    bool   fileLoaded = false; 
    // playhead position (0 to 1)
    double position = 0.0; 
    // loop start position
    double regionStart = 0.0; 
    // loop end position
    double regionEnd = 1.0; 

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(WaveformDisplay)
};
