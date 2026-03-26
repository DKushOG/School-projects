/*
  ==============================================================================

    This file was auto-generated!

  ==============================================================================
*/

#include "MainComponent.h"

MainComponent::MainComponent()
{
    setSize(1200, 800);

    // Request record-audio permissions on platforms that need it
    if (juce::RuntimePermissions::isRequired(juce::RuntimePermissions::recordAudio)
        && !juce::RuntimePermissions::isGranted(juce::RuntimePermissions::recordAudio))
    {
        juce::RuntimePermissions::request(juce::RuntimePermissions::recordAudio,
            [this](bool granted)
            {
                if (granted) setAudioChannels(2, 2);
            });
    }
    else
    {
        setAudioChannels(0, 2); // We only want 2 output channels (no inputs).
    }

    // Add deckGUI 1 & 2
    addAndMakeVisible(deckGUI1);
    addAndMakeVisible(deckGUI2);

    // Add the audio library UI
    addAndMakeVisible(audioLibrary);

    // Buttons to add/remove deck3
    addAndMakeVisible(addDeckButton);
    addAndMakeVisible(removeDeckButton);

    addDeckButton.onClick = [this] { addDeck3(); };
    removeDeckButton.onClick = [this] { removeDeck3(); };

    // Register known formats (WAV, MP3, etc.)
    formatManager.registerBasicFormats();
}

MainComponent::~MainComponent()
{
    // Clean up function, shuts down the audio device and clears the audio source if it is replaced
    shutdownAudio();
}

// Prepares the audio system for playback
void MainComponent::prepareToPlay(int samplesPerBlockExpected, double sampleRate)
{
    // Prepare the first two decks
    player1.prepareToPlay(samplesPerBlockExpected, sampleRate);
    player2.prepareToPlay(samplesPerBlockExpected, sampleRate);

    // Prepare the mixer
    mixerSource.prepareToPlay(samplesPerBlockExpected, sampleRate);
    mixerSource.addInputSource(&player1, false);
    mixerSource.addInputSource(&player2, false);

    // If deck3 is active, prepare it
    if (deck3Active && player3)
    {
        player3->prepareToPlay(samplesPerBlockExpected, sampleRate);
        mixerSource.addInputSource(player3.get(), false);
    }


}

// processes the next block of audio for playback
void MainComponent::getNextAudioBlock(const juce::AudioSourceChannelInfo& bufferToFill)
{
    // the mixer fills the buffer
    mixerSource.getNextAudioBlock(bufferToFill);

    const float** data = const_cast<const float**> (bufferToFill.buffer->getArrayOfReadPointers());
    int numChannels = bufferToFill.buffer->getNumChannels();
    int numSamples = bufferToFill.numSamples;
}

void MainComponent::releaseResources()
{
    // Clean up
    player1.releaseResources();
    player2.releaseResources();

    if (deck3Active && player3)
        player3->releaseResources();

    mixerSource.releaseResources();
}

// Paint main component
void MainComponent::paint(juce::Graphics& g)
{
    // Colour change from a gradient from black at the top to a dark grey at the bottom for the background
    juce::ColourGradient backgroundGradient(
        juce::Colour::fromRGB(15, 15, 15), 
        0.0f, 0.0f,                        
        juce::Colour::fromRGB(40, 40, 40), 
        0.0f, (float)getHeight(),          
        false);

    g.setGradientFill(backgroundGradient);
    g.fillRect(getLocalBounds());
}

// Setting bounds for the program
void MainComponent::resized()
{
    auto area = getLocalBounds();

    // Top bar for Add/Remove Deck 3
    auto topBar = area.removeFromTop(30);
    addDeckButton.setBounds(topBar.removeFromLeft(120).reduced(5));
    removeDeckButton.setBounds(topBar.removeFromLeft(120).reduced(5));

    // Reserve some fixed height for the library
    // It sits at the bottom and doesn't obscure any deck GUI components
    const int libraryHeight = 250;
    auto libraryArea = area.removeFromBottom(libraryHeight);
    audioLibrary.setBounds(libraryArea);

    // Remaining center area is for the decks
    if (!deck3Active)
    {
        // Deck area
        deckGUI1.setBounds(area.removeFromLeft(area.getWidth() / 2));
        deckGUI2.setBounds(area);
    }
    else
    {
        // Deck 3 area if made
        deckGUI1.setBounds(area.removeFromLeft(area.getWidth() / 3));
        deckGUI2.setBounds(area.removeFromLeft(area.getWidth() / 2));
        if (deckGUI3)
            deckGUI3->setBounds(area);
    }
}

// Add in Deck 3
void MainComponent::addDeck3()
{
    if (!deck3Active)
    {
        // Create and set up Deck 3
        player3 = std::make_unique<DJAudioPlayer>(formatManager);
        deckGUI3 = std::make_unique<DeckGUI>(player3.get(), formatManager, thumbCache);

        mixerSource.addInputSource(player3.get(), false);
        addAndMakeVisible(*deckGUI3);

        deck3Active = true;

        // Enable "Load to Deck 3" in the library
        audioLibrary.enableDeck3Button(true);

        audioLibrary.setDeck3Gui(deckGUI3.get());

        // Retrieve the AudioDeviceManager reference from AudioAppComponent
        juce::AudioDeviceManager* deviceManager = &this->deviceManager; 
        if (deviceManager != nullptr)
        {
            juce::AudioIODevice* device = deviceManager->getCurrentAudioDevice();
            if (device != nullptr)
            {
                double sampleRate = device->getCurrentSampleRate();
                int blockSize = device->getCurrentBufferSizeSamples();
                player3->prepareToPlay(blockSize, sampleRate);
            }
        }

        resized();
    }
}

// Remove deck 3
void MainComponent::removeDeck3()
{
    if (deck3Active)
    {
        // Remove from mixer
        if (player3)
            mixerSource.removeInputSource(player3.get());

        if (player3)
            player3->releaseResources();

        deckGUI3.reset();
        player3.reset();
        deck3Active = false;

        // Hide "Load to Deck 3" in library
        audioLibrary.enableDeck3Button(false);

        resized();
    }
}
