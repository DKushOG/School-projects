/*
==============================================================================

DJAudioPlayer.cpp
Created: 13 Mar 2020 4:22:22pm
Author:  matthew

==============================================================================
*/

#include "DJAudioPlayer.h"

// initializes the audio player with a format manager
DJAudioPlayer::DJAudioPlayer(juce::AudioFormatManager& _formatManager)
    : formatManager(_formatManager)
{
}

// cleans up the audio player
DJAudioPlayer::~DJAudioPlayer()
{
}

// prepares the audio player for playback
void DJAudioPlayer::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    transportSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    resampleSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
}

// releases all allocated audio resources
void DJAudioPlayer::releaseResources()
{
    transportSource.releaseResources();
    resampleSource.releaseResources();
}

// processes the next block of audio
// applies looping if enabled
void DJAudioPlayer::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    resampleSource.getNextAudioBlock(bufferToFill);

    if (looping)
    {
        double pos = transportSource.getCurrentPosition();
        // Small buffer to handle timing inconsistencies
        double tolerance = 0.02; 

        // Ensure track does not go below loopStartPos
        if (pos < loopStartPos)
        {
            transportSource.setPosition(loopStartPos);
        }
        // If the track reaches or slightly surpasses loopEndPos, reset position
        else if (pos + tolerance >= loopEndPos)
        {
            transportSource.setPosition(loopStartPos);
            // Ensure the function resumes playback properly
            transportSource.start(); 
        }
    }
}

// loads an audio file from a url into the player
void DJAudioPlayer::loadURL(juce::URL audioURL)
{
    auto* reader = formatManager.createReaderFor(audioURL.createInputStream(false));
    if (reader != nullptr)
    {
        DBG("Loading audio file: " << audioURL.toString(false));

        auto newSource = std::make_unique<juce::AudioFormatReaderSource>(reader, true);
        transportSource.setSource(newSource.get(),
            0,       
            nullptr, 
            reader->sampleRate);
        readerSource.reset(newSource.release());

        transportSource.setPosition(0.0);
    }
    else
    {
        DBG("Failed to load audio file from URL.");
    }
}

// sets the volume (gain) of the audio player
void DJAudioPlayer::setGain(double gain)
{
    if (gain < 0.0 || gain > 1.0)
        DBG("DJAudioPlayer::setGain: gain out of range [0..1]");
    else
        transportSource.setGain(gain);
}

// sets the playback speed of the audio player
void DJAudioPlayer::setSpeed(double ratio)
{
    if (ratio <= 0.0 || ratio > 100.0)
    {
        DBG("DJAudioPlayer::setSpeed: ratio out of range");
        return;
    }
    currentSpeed = ratio;
    updateResampleRatio();
}

// sets the pitch shift in semitones (speed since pitch shifting isnt available in JUCE)
void DJAudioPlayer::setPitch(double semitones)
{
    currentPitchSemitones = semitones;
    updateResampleRatio();
}

// updates the resampling ratio based on speed and pitch
void DJAudioPlayer::updateResampleRatio()
{
    double pitchRatio = std::pow(2.0, currentPitchSemitones / 12.0);
    double finalRatio = currentSpeed * pitchRatio;
    resampleSource.setResamplingRatio(finalRatio);
}

// sets the track position in seconds
void DJAudioPlayer::setPosition(double posInSecs)
{
    transportSource.setPosition(posInSecs);
}

// sets the track position as a relative value (0 to 1)
void DJAudioPlayer::setPositionRelative(double pos)
{
    if (pos < 0.0 || pos > 1.0)
        DBG("DJAudioPlayer::setPositionRelative: pos out of range [0..1]");
    else
    {
        double length = transportSource.getLengthInSeconds();
        transportSource.setPosition(length * pos);
    }
}

// starts playback of the loaded audio
void DJAudioPlayer::start()
{
    if (transportSource.getLengthInSeconds() > 0)
        transportSource.start();
    else
        DBG("No audio loaded, cannot play.");
}

// stops playback of the audio
void DJAudioPlayer::stop()
{
    transportSource.stop();
}

// gets the relative track position (0 to 1)
double DJAudioPlayer::getPositionRelative()
{
    double length = transportSource.getLengthInSeconds();
    if (length > 0)
        return transportSource.getCurrentPosition() / length;

    return 0.0;
}

// sets loop parameters for playback looping
void DJAudioPlayer::setLoopParameters(bool shouldLoop, double loopStart, double loopEnd)
{
    looping = shouldLoop;

    double trackLength = transportSource.getLengthInSeconds();
    loopStartPos = juce::jlimit(0.0, trackLength, trackLength * loopStart);
    loopEndPos = juce::jlimit(0.0, trackLength, trackLength * loopEnd);

    if (loopStartPos > loopEndPos)
        std::swap(loopStartPos, loopEndPos);

    if (looping)
    {
        transportSource.setPosition(loopStartPos); // Ensure we start at the loop region
        transportSource.start(); // Restart playback immediately
    }
}

// checks if playback has ended
bool DJAudioPlayer::hasPlaybackEnded()
{
    // If the transport is stopped and at the end of the track, return true
    return (!transportSource.isPlaying() &&
        transportSource.getCurrentPosition() >= transportSource.getLengthInSeconds());
}

// returns the total length of the loaded track in seconds
double DJAudioPlayer::getTrackLength()
{
    return transportSource.getLengthInSeconds();
}
