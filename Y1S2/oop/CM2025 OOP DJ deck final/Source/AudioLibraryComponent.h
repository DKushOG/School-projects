/*
  ==============================================================================

    AudioLibraryComponent.h
    Created: 3 Mar 2025 9:28:06pm
    Author:  Admin

  ==============================================================================
*/

#pragma once

#include "../JuceLibraryCode/JuceHeader.h"
#include "DJAudioPlayer.h"
#include "DeckGUI.h"

// New audio library/playlist
class AudioLibraryComponent : public juce::TabbedComponent
{
public:
    // Initializes the library with references to the two decks
    AudioLibraryComponent(DeckGUI* deck1Gui, DeckGUI* deck2Gui);

    // Destructor, Cleans up library resources
    ~AudioLibraryComponent() override;

    // Enables or disables the Deck 3 button
    void enableDeck3Button(bool enable);

    // Assigns a reference to Deck 3 GUI for optional third-deck support
    void setDeck3Gui(DeckGUI* deck3GuiPtr);

private:
    // Pointers to the decks
    DeckGUI* deck1Gui = nullptr; 
    DeckGUI* deck2Gui = nullptr; 
    DeckGUI* deck3Gui = nullptr; 

    // forward declaring the settings tab
    class LibrarySettingsTab; 

    // LibraryTab
    // Displays the music library in a list format.
    // Allows users to upload new files and load them into decks.
    class LibraryTab : public juce::Component,
        public juce::Button::Listener,
        public juce::ListBoxModel
    {
    public:
        // Initializes the Library Tab UI
        LibraryTab(DeckGUI* deck1, DeckGUI* deck2);

        // Cleans up the Library Tab
        ~LibraryTab() override = default;

        // Paints the background of the Library Tab
        void paint(juce::Graphics& g) override;

        // Resizes and arranges all UI elements
        void resized() override;

        // Handles button clicks for uploading and loading tracks
        void buttonClicked(juce::Button* button) override;

        // Returns the number of tracks currently in the library
        int getNumRows() override;

        // Paints each row in the list box
        void paintListBoxItem(int rowNumber, juce::Graphics& g,
            int width, int height, bool rowIsSelected) override;

        // Handles changes in track selection
        void selectedRowsChanged(int lastRowSelected) override;

        // Adds a new file to the library, storing it in the persistent folder
        void addFileToLibrary(const juce::File& file);

        // Enables or disables the Deck 3 button
        void enableDeck3Button(bool enable);

        // Assigns Deck 3 reference for loading tracks
        void setDeck3Gui(DeckGUI* d3) { deck3Gui = d3; }

        // Loads the saved library state from the libraryData.txt file
        void loadLibraryFromFile();

        // Saves the current library state to the libraryData.txt file
        void saveLibraryToFile();

        // Returns the list of file names in the library (for settings tab)
        juce::StringArray& getLibraryItems() { return libraryItems; }

        // Returns the list of file objects in the library
        juce::OwnedArray<juce::File>& getLibraryFiles() { return libraryFiles; }

        // Returns a reference to the ListBox component
        juce::ListBox& getListBox() { return listBox; }

        // Sets a reference to the LibrarySettingsTab for updating purposes
        void setLibrarySettingsTab(class LibrarySettingsTab* lst) { settingsTab = lst; }

    private:
        // pointers
        DeckGUI* deck1Gui = nullptr; 
        DeckGUI* deck2Gui = nullptr; 
        DeckGUI* deck3Gui = nullptr; 

        // Stores track names
        juce::StringArray libraryItems;  
        // Stores file paths for track management
        juce::OwnedArray<juce::File> libraryFiles;  

        // UI elements displaying track list and button texts
        juce::ListBox listBox;  
        juce::TextButton uploadButton{ "Upload File" };
        juce::TextButton loadDeck1Button{ "Load to Deck 1" };
        juce::TextButton loadDeck2Button{ "Load to Deck 2" };
        juce::TextButton loadDeck3Button{ "Load to Deck 3" };

        juce::FileChooser fileChooser{ "Select Audio File..." };

        // Pointer to settings tab
        class LibrarySettingsTab* settingsTab = nullptr; 

        JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(LibraryTab)
    };

    // LibrarySettingsTab:
    // Allows users to delete tracks or clear the entire library.
    // Updates the list of available tracks dynamically.
    class LibrarySettingsTab : public juce::Component,
        public juce::Button::Listener,
        public juce::ListBoxModel
    {
    public:
        // Initializes the Library Settings Tab
        LibrarySettingsTab(LibraryTab& libTab);

        // Cleans up resources
        ~LibrarySettingsTab() override = default;

        // Paints the background of the library settings tab
        void paint(juce::Graphics& g) override;

        // Resizes and arranges all UI elements
        void resized() override;

        // Handles button clicks for deleting or clearing tracks
        void buttonClicked(juce::Button* button) override;

        // Returns the number of rows in the settings tab list
        int getNumRows() override;

        // Paints a single item in the settings list box
        void paintListBoxItem(int rowNumber, juce::Graphics& g,
            int width, int height, bool rowIsSelected) override;

        // Updates the settings tab list when the library is modified
        void updateLibraryItems();

    private:
        // Reference to the Library Tab
        LibraryTab& libraryTab; 

        // UI element displaying library files
        juce::ListBox listBox;  
        juce::TextButton deleteButton{ "Delete File" };
        juce::TextButton clearButton{ "Clear Library" };

        JUCE_DECLARE_NON_COPYABLE_WITH_LEAK_DETECTOR(LibrarySettingsTab)
    };

    // Instance of the Library Tab
    LibraryTab libraryTab; 
    // Instance of the Library Settings Tab
    LibrarySettingsTab librarySettingsTab; 
};
