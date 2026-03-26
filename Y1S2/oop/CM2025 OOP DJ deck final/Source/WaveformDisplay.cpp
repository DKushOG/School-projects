/*
  ==============================================================================

    WaveformDisplay.cpp
    Created: 14 Mar 2020 3:50:16pm
    Author:  matthew

  ==============================================================================
*/

#include "../JuceLibraryCode/JuceHeader.h"
#include "WaveformDisplay.h"

// initializes the waveform display
// sets up an audio thumbnail for visualizing the waveform
WaveformDisplay::WaveformDisplay(juce::AudioFormatManager& formatManagerToUse,
    juce::AudioThumbnailCache& cacheToUse)
    : audioThumb(1000, formatManagerToUse, cacheToUse),
    fileLoaded(false),
    position(0.0)
{
    audioThumb.addChangeListener(this);
}

// cleans up the waveform display
WaveformDisplay::~WaveformDisplay()
{
}

// paint: draws the waveform visualization
// if no file is loaded, displays "File not loaded..."
void WaveformDisplay::paint(juce::Graphics& g)
{
    g.fillAll(juce::Colours::black);
    g.setColour(juce::Colours::grey);
    g.drawRect(getLocalBounds(), 1);

    if (fileLoaded)
    {
        // draw waveform using a blue-to-white gradient
        juce::ColourGradient gradient(juce::Colours::blue, 0, 0,
            juce::Colours::white, getWidth(), getHeight(),
            false);

        g.setGradientFill(gradient);
        audioThumb.drawChannel(g,
            getLocalBounds(),
            0.0,
            audioThumb.getTotalLength(),
            0,
            1.0f);

        // draw green playhead indicating current playback position
        g.setColour(juce::Colours::green);
        int playheadX = (int)(position * getWidth());
        g.fillRect(playheadX, 0, 3, getHeight());

        // draw loop region start and end markers
        g.setColour(juce::Colours::red);
        int startX = (int)(regionStart * getWidth());
        int endX = (int)(regionEnd * getWidth());

        g.drawLine((float)startX, 0.0f, (float)startX, (float)getHeight(), 2.0f);

        g.setColour(juce::Colours::pink);
        g.drawLine((float)endX, 0.0f, (float)endX, (float)getHeight(), 2.0f);
    }
    else
    {
        // show placeholder text when no file is loaded
        g.setFont(20.0f);
        g.setColour(juce::Colours::white);
        g.drawText("File not loaded...",
            getLocalBounds(),
            juce::Justification::centred,
            true);
    }
}

// resized: adjusts waveform display when the component is resized
void WaveformDisplay::resized()
{
}

// change listener callback, triggered when audio thumbnail changes
// forces repainting of the waveform
void WaveformDisplay::changeListenerCallback(juce::ChangeBroadcaster* source)
{
    if (source == &audioThumb)
    {
        repaint();
    }
}

// load url: loads an audio file and generates a waveform from it
void WaveformDisplay::loadURL(juce::URL audioURL)
{
    audioThumb.clear();
    fileLoaded = audioThumb.setSource(new juce::URLInputSource(audioURL));

    if (fileLoaded)
        repaint();
}

// set position relative: updates the playback position indicator
// position is a value between 0.0 (start) and 1.0 (end)
void WaveformDisplay::setPositionRelative(double pos)
{
    if (pos >= 0.0 && pos <= 1.0)
    {
        position = pos;
        repaint();
    }
}

// set region start and end: sets loop start and end points
void WaveformDisplay::setRegionStartEnd(double start, double end)
{
    if (start < 0.0) start = 0.0;
    if (end > 1.0) end = 1.0;

    if (start <= end)
    {
        regionStart = start;
        regionEnd = end;
    }
    else
    {
        regionStart = end;
        regionEnd = start;
    }
    repaint();
}

