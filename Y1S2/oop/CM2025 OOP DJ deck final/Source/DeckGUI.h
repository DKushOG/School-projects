/*
  ==============================================================================

    DeckGUI.h
    Created: 13 Mar 2020 6:44:48pm
    Author:  matthew

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"
#include "DJAudioPlayer.h"
#include "WaveformDisplay.h"

// Graphical user interface for the decks
class DeckGUI : public juce::Component,
    public juce::Button::Listener,
    public juce::Slider::Listener,
    public juce::FileDragAndDropTarget,
    public juce::Timer
{
public:
    DeckGUI(DJAudioPlayer* player,
        juce::AudioFormatManager& formatManagerToUse,
        juce::AudioThumbnailCache& cacheToUse);
    ~DeckGUI() override;

    void paint(juce::Graphics&) override;
    void resized() override;

    // button listener
    void buttonClicked(juce::Button*) override;

    // Slider listener
    void sliderValueChanged(juce::Slider* slider) override;

    // For dragging and dropping files
    bool isInterestedInFileDrag(const juce::StringArray& files) override;
    void filesDropped(const juce::StringArray& files, int x, int y) override;

    // Timer
    void timerCallback() override;

    // Programmatic load
    void loadFileIntoDeck(const juce::File& file);

private:
    juce::FileChooser fChooser{ "Select a file..." };

    // Transport Buttons
    juce::TextButton playButton{ "PLAY" };
    juce::TextButton stopButton{ "STOP" };
    juce::TextButton loadButton{ "LOAD" };

    // Rotary Sliders
    juce::Slider volSlider;
    juce::Slider speedSlider;
    juce::Slider posSlider;
    juce::Slider pitchSlider;

    // Horizontal Sliders for loop start/end
    juce::Slider startSlider;
    juce::Slider endSlider;

    // Loop toggle
    juce::ToggleButton loopToggle{ "LOOP Selected Region" };

    // Labels
    juce::Label volumeLabel{ {}, "Volume" };
    juce::Label speedLabel{ {}, "Speed" };
    juce::Label positionLabel{ {}, "Track Pos" };
    juce::Label pitchLabel{ {}, "Pitch" };
    juce::Label startLabel{ {}, "Start" };
    juce::Label endLabel{ {}, "End" };

    // Waveform
    WaveformDisplay waveformDisplay;

    DJAudioPlayer* player = nullptr;

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DeckGUI)
};
