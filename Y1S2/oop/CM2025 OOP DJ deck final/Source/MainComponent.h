/*
  ==============================================================================

    This file was auto-generated!

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"
#include "DJAudioPlayer.h"
#include "DeckGUI.h"
#include "AudioLibraryComponent.h"

// Main component to handle the decks and audio
class MainComponent : public juce::AudioAppComponent
{
public:
    MainComponent();
    ~MainComponent() override;

    // AudioAppComponent overrides
    void prepareToPlay(int samplesPerBlockExpected, double sampleRate) override;
    void getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill) override;
    void releaseResources() override;

    // UI overrides
    void paint(juce::Graphics& g) override;
    void resized() override;

private:
    // Format manager & thumbnail cache
    juce::AudioFormatManager formatManager;
    juce::AudioThumbnailCache thumbCache{ 100 };

    // Two default decks (call to DeckGUI)
    DJAudioPlayer player1{ formatManager };
    DeckGUI deckGUI1{ &player1, formatManager, thumbCache };

    DJAudioPlayer player2{ formatManager };
    DeckGUI deckGUI2{ &player2, formatManager, thumbCache };

    // Optional third deck
    std::unique_ptr<DJAudioPlayer> player3;
    std::unique_ptr<DeckGUI> deckGUI3;
    bool deck3Active = false;

    // Mixer that combines all decks
    juce::MixerAudioSource mixerSource;

    // Audio library with two tabs
    AudioLibraryComponent audioLibrary{ &deckGUI1, &deckGUI2 };

    // Buttons to add/remove a third deck
    juce::TextButton addDeckButton{ "Add Deck 3" };
    juce::TextButton removeDeckButton{ "Remove Deck 3" };

    // Helpers for deck 3
    void addDeck3();
    void removeDeck3();

    JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(MainComponent)
};


