/*
  ==============================================================================

    DJAudioPlayer.h
    Created: 13 Mar 2020 4:22:22pm
    Author:  matthew

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"

// DJAudioplayer manages audio playback with controls for speed, pitch, and looping
class DJAudioPlayer : public juce::AudioSource
{
public:
    // initializes the player with an audio format manager
    DJAudioPlayer(juce::AudioFormatManager& _formatManager);

    // cleans up resources
    ~DJAudioPlayer() override;

    // prepares the player for audio processing
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;

    // processes the next block of audio
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;
    void releaseResources() override;

    // loads an audio file from a given url
    void loadURL(juce::URL audioURL);

    // handlers for the audio- related sliders
    void setGain(double gain);   
    void setSpeed(double ratio); 
    void setPitch(double semitones);

    // sets the playback position
    void setPosition(double posInSecs);
    void setPositionRelative(double pos);

    // start/stop audio playback
    void start();
    void stop();

    // gets the current playback position as a relative value (0 to 1)
    double getPositionRelative();
    // Returns the total length of the currently loaded track in seconds 
    double getTrackLength();

    // checks if the audio playback has ended
    bool hasPlaybackEnded();

    // Loop region that is scaled by track length
    void setLoopParameters(bool shouldLoop, double loopStart, double loopEnd);

private:
    juce::AudioFormatManager& formatManager;
    std::unique_ptr<juce::AudioFormatReaderSource> readerSource;
    juce::AudioTransportSource transportSource;
    juce::ResamplingAudioSource resampleSource{ &transportSource, false, 2 };

    // looping logic declarations
    bool   looping = false;
    double loopStartPos = 0.0;
    double loopEndPos = 1.0;

    // speed and pitch value declarations
    double currentSpeed = 1.0;
    double currentPitchSemitones = 0.0;

    void updateResampleRatio();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(DJAudioPlayer)
};





