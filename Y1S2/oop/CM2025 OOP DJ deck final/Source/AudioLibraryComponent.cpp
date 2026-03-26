/*
  ==============================================================================

    AudioLibraryComponent.cpp
    Created: 3 Mar 2025 9:27:54pm
    Author:  Admin

  ==============================================================================
*/


#include "AudioLibraryComponent.h"

// Constructor that Initializes the Audio Library Component
// Creates two tabs, Library and Library Settings
AudioLibraryComponent::AudioLibraryComponent(DeckGUI* deck1GuiPtr,
    DeckGUI* deck2GuiPtr)
    : juce::TabbedComponent(juce::TabbedButtonBar::TabsAtTop),
    deck1Gui(deck1GuiPtr),
    deck2Gui(deck2GuiPtr),
    
    libraryTab(deck1GuiPtr, deck2GuiPtr), 
    librarySettingsTab(libraryTab)       
{
    libraryTab.setLibrarySettingsTab(&librarySettingsTab);

    addTab("Library", juce::Colours::darkgrey, &libraryTab, false);
    addTab("Library Settings", juce::Colours::darkgrey, &librarySettingsTab, false);
}

// Destructor component, cleans up audio library component
AudioLibraryComponent::~AudioLibraryComponent() {}

// Enables or disables the Deck 3 button
void AudioLibraryComponent::enableDeck3Button(bool enable)
{
    libraryTab.enableDeck3Button(enable);
}

// Assigns Deck 3 GUI reference
void AudioLibraryComponent::setDeck3Gui(DeckGUI* deck3GuiPtr)
{
    deck3Gui = deck3GuiPtr;
    libraryTab.setDeck3Gui(deck3GuiPtr);
}

// Constructor, Initializes Library Tab, sets up UI elements
AudioLibraryComponent::LibraryTab::LibraryTab(DeckGUI* deck1, DeckGUI* deck2)
    : deck1Gui(deck1), deck2Gui(deck2)
{
    // Setup listBox
    listBox.setModel(this);
    addAndMakeVisible(listBox);

    // Buttons
    addAndMakeVisible(uploadButton);
    uploadButton.addListener(this);

    addAndMakeVisible(loadDeck1Button);
    loadDeck1Button.addListener(this);

    addAndMakeVisible(loadDeck2Button);
    loadDeck2Button.addListener(this);

    addAndMakeVisible(loadDeck3Button);
    loadDeck3Button.addListener(this);
    loadDeck3Button.setVisible(false);

    // Loads library from file on startup
    loadLibraryFromFile();
}

// Paints the Library Tab background to match other parts of the app
void AudioLibraryComponent::LibraryTab::paint(juce::Graphics& g)
{
    juce::ColourGradient backgroundGradient(
        juce::Colour::fromRGB(15, 15, 15),
        0.0f, 0.0f,
        juce::Colour::fromRGB(40, 40, 40),
        0.0f, (float)getHeight(),
        false);

    g.setGradientFill(backgroundGradient);
    g.fillRect(getLocalBounds());
}

// Resizes and arranges UI elements in the library tab
void AudioLibraryComponent::LibraryTab::resized()
{
    auto area = getLocalBounds().reduced(5);

    auto buttonHeight = 30;
    auto buttonRow = area.removeFromTop(buttonHeight);

    int eachWidth = buttonRow.getWidth() / 4;
    uploadButton.setBounds(buttonRow.removeFromLeft(eachWidth).reduced(2));
    loadDeck1Button.setBounds(buttonRow.removeFromLeft(eachWidth).reduced(2));
    loadDeck2Button.setBounds(buttonRow.removeFromLeft(eachWidth).reduced(2));
    loadDeck3Button.setBounds(buttonRow.removeFromLeft(eachWidth).reduced(2));

    listBox.setBounds(area.reduced(2));
}

// Handles button clicks for uploading and loading tracks into decks
void AudioLibraryComponent::LibraryTab::buttonClicked(juce::Button* button)
{
    if (button == &uploadButton)
    {
        auto flags = juce::FileBrowserComponent::canSelectFiles;
        fileChooser.launchAsync(flags, [this](const juce::FileChooser& fc)
            {
                auto chosenFile = fc.getResult();
                if (chosenFile.existsAsFile())
                    addFileToLibrary(chosenFile);
            });
    }
    else
    {
        // User clicked one of the "Load to Deck" buttons
        int sel = listBox.getSelectedRow();
        if (sel >= 0 && sel < libraryFiles.size())
        {
            auto* file = libraryFiles[sel];
            if (file != nullptr)
            {
                if (button == &loadDeck1Button && deck1Gui)
                    deck1Gui->loadFileIntoDeck(*file);
                else if (button == &loadDeck2Button && deck2Gui)
                    deck2Gui->loadFileIntoDeck(*file);
                else if (button == &loadDeck3Button && deck3Gui)
                    deck3Gui->loadFileIntoDeck(*file);
            }
        }
    }
}

// Returns the number of rows (tracks) in the library list
int AudioLibraryComponent::LibraryTab::getNumRows()
{
    return libraryItems.size();
}

// Loads the library data from "libraryData.txt" at startup
void AudioLibraryComponent::LibraryTab::paintListBoxItem(int rowNumber,
    juce::Graphics& g,
    int width, int height,
    bool rowIsSelected)
{
    if (rowIsSelected)
        g.fillAll(juce::Colours::blue.withAlpha(0.5f));

    if (rowNumber >= 0 && rowNumber < libraryItems.size())
    {
        g.setColour(juce::Colours::white);
        g.setFont(14.0f);
        g.drawText(libraryItems[rowNumber],
            0, 0, width, height,
            juce::Justification::centredLeft,
            true);
    }
}

void AudioLibraryComponent::LibraryTab::selectedRowsChanged(int /*lastRowSelected*/)
{
    // optionally handle selection changes
}

// Persistant file loading
// physically copy the uploaded files to "Playlist Data"
// add that new local copy to library
void AudioLibraryComponent::LibraryTab::addFileToLibrary(const juce::File& file)
{
    // Decide on the folder
    juce::File libraryFolder("Playlist Data");
    if (!libraryFolder.exists())
        libraryFolder.createDirectory(); 

    // Our new path for the local copy
    auto localCopy = libraryFolder.getChildFile(file.getFileName());
    if (!localCopy.existsAsFile())
    {
        // copy the file so it is stored in the library folder
        file.copyFileTo(localCopy);
    }

    // Add localCopy to library
    libraryItems.add(localCopy.getFileName());
    libraryFiles.add(new juce::File(localCopy));

    listBox.updateContent();

    // update pointer in the settings tab
    if (settingsTab != nullptr)
        settingsTab->updateLibraryItems();

    // Save library after each upload
    saveLibraryToFile();
}

void AudioLibraryComponent::LibraryTab::enableDeck3Button(bool enable)
{
    loadDeck3Button.setVisible(enable);
}

// Save the current library to "libraryData.txt" so that next run it restores the library
void AudioLibraryComponent::LibraryTab::saveLibraryToFile()
{
    juce::File libraryFolder("Playlist Data");
    if (!libraryFolder.exists())
        libraryFolder.createDirectory();

    juce::File libraryFile = libraryFolder.getChildFile("libraryData.txt");

    juce::String output;
    // store the full absolute path to each local copy
    for (auto* f : libraryFiles)
    {
        if (f != nullptr && f->existsAsFile())
            output << f->getFullPathName() << "\n";
    }
    libraryFile.replaceWithText(output);
    DBG("Library file path: " + libraryFile.getFullPathName());
}

// This method loads from: "/Playlist Data/libraryData.txt"
// in each line, a path to a local file will be expected
void AudioLibraryComponent::LibraryTab::loadLibraryFromFile()
{
    juce::File libraryFolder("Playlist Data");
    juce::File libraryFile = libraryFolder.getChildFile("libraryData.txt");

    if (libraryFile.existsAsFile())
    {
        juce::StringArray lines;
        libraryFile.readLines(lines);

        for (auto& line : lines)
        {
            juce::File localCopy(line.trim());
            if (localCopy.existsAsFile())
            {
                libraryItems.add(localCopy.getFileName());
                libraryFiles.add(new juce::File(localCopy));
            }
        }
        listBox.updateContent();
    }
}

// constructor, initializes the library settings tab
// adds UI components for managing the library such as delete and clear buttons
AudioLibraryComponent::LibrarySettingsTab::LibrarySettingsTab(LibraryTab& libTab)
    : libraryTab(libTab)
{
    addAndMakeVisible(listBox);
    listBox.setModel(this);

    addAndMakeVisible(deleteButton);
    deleteButton.addListener(this);

    addAndMakeVisible(clearButton);
    clearButton.addListener(this);
}

// Paints the Library Settings Tab background (same as library)
void AudioLibraryComponent::LibrarySettingsTab::paint(juce::Graphics& g)
{
    juce::ColourGradient backgroundGradient(
        juce::Colour::fromRGB(15, 15, 15),
        0.0f, 0.0f,
        juce::Colour::fromRGB(40, 40, 40),
        0.0f, (float)getHeight(),
        false);

    g.setGradientFill(backgroundGradient);
    g.fillRect(getLocalBounds());
}

// Resizes and arranges UI elements in the library settings tab
void AudioLibraryComponent::LibrarySettingsTab::resized()
{
    auto area = getLocalBounds().reduced(5);

    // list occupies most of area except a small row for buttons
    listBox.setBounds(area.removeFromTop(area.getHeight() - 40));

    deleteButton.setBounds(area.removeFromLeft(area.getWidth() / 2).reduced(2));
    clearButton.setBounds(area.reduced(2));
}

// Handles button clicks for deleting or clearing library items
void AudioLibraryComponent::LibrarySettingsTab::buttonClicked(juce::Button* button)
{
    int sel = listBox.getSelectedRow();

    if (button == &deleteButton && sel >= 0)
    {
        // remove from library
        libraryTab.getLibraryFiles().remove(sel);
        libraryTab.getLibraryItems().remove(sel);

        // update both lists
        listBox.updateContent();
        libraryTab.getListBox().updateContent();

        // save after deletion
        libraryTab.saveLibraryToFile();
    }
    else if (button == &clearButton)
    {
        // clear library
        libraryTab.getLibraryFiles().clear();
        libraryTab.getLibraryItems().clear();

        // update both lists
        listBox.updateContent();
        libraryTab.getListBox().updateContent();

        // save after clearing
        libraryTab.saveLibraryToFile();
    }
}

// Returns the number of rows of tracks in the library settings list
int AudioLibraryComponent::LibrarySettingsTab::getNumRows()
{
    return libraryTab.getLibraryItems().size();
}

// Paints a single list box item for the library settings
void AudioLibraryComponent::LibrarySettingsTab::paintListBoxItem(int rowNumber,
    juce::Graphics& g,
    int width, int height,
    bool rowIsSelected)
{
    if (rowIsSelected)
        g.fillAll(juce::Colours::blue.withAlpha(0.5f));

    auto& items = libraryTab.getLibraryItems();

    if (rowNumber >= 0 && rowNumber < items.size())
    {
        g.setColour(juce::Colours::white);
        g.setFont(14.0f);
        g.drawText(items[rowNumber],
            0, 0, width, height,
            juce::Justification::centredLeft,
            true);
    }
}

// Updates the list of library items displayed in the settings tab
void AudioLibraryComponent::LibrarySettingsTab::updateLibraryItems()
{
    listBox.updateContent();
    repaint();
}