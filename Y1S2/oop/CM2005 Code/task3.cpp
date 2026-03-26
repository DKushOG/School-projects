#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <iomanip>
#include <cmath>
#include <limits>
#include <numeric>
#include <algorithm> // For std::max_element and std::min_element
#include "csvReader.h" // Include CSVReader class

// Define the Candlestick class
class Candlestick {
public:
    double openTemp, closeTemp, highTemp, lowTemp;
    int year;

    // Constructor
    Candlestick(int yr, double op, double cl, double hi, double lo)
        : year(yr), openTemp(op), closeTemp(cl), highTemp(hi), lowTemp(lo) {}
};

// Function to safely convert a string to double
inline double stringToDouble(const std::string& str) {
    try {
        return str.empty() ? std::numeric_limits<double>::quiet_NaN() : std::stod(str);
    } catch (...) {
        return std::numeric_limits<double>::quiet_NaN();
    }
}

// Function to process CSV data and compute candlestick data
std::vector<Candlestick> processCSVData(const std::string& filePath, const std::string& country) {
    CSVReader reader(filePath);
    auto data = reader.readAll();
    auto headers = reader.getHeaders();

    if (data.empty() || headers.empty()) {
        std::cerr << "Error: Missing data or headers in the file." << std::endl;
        return {};
    }

    std::map<std::string, int> columnMap;
    for (size_t i = 0; i < headers.size(); ++i) {
        columnMap[headers[i]] = i;
    }

    if (columnMap.find(country) == columnMap.end()) {
        std::cerr << "Error: Country not found in the dataset." << std::endl;
        return {};
    }

    int countryColumnIndex = columnMap[country];
    std::map<int, std::vector<double>> yearlyTemps;

    // Process the data rows
    for (size_t i = 1; i < data.size(); ++i) {
        const auto& row = data[i];
        if (row.size() <= countryColumnIndex) continue;

        int year = std::stoi(row[0].substr(0, 4));
        double temperature = stringToDouble(row[countryColumnIndex]);

        if (!std::isnan(temperature)) {
            yearlyTemps[year].push_back(temperature);
        }
    }

    std::vector<Candlestick> candlesticks;
    std::vector<double> prevYearTemps;

    // Compute candlestick data for each year
    for (const auto& entry : yearlyTemps) {
        int year = entry.first;
        const auto& temps = entry.second;

        if (!temps.empty()) {
            // Compute the average mean temperature for the current year
            double closeTemp = std::accumulate(temps.begin(), temps.end(), 0.0) / temps.size();

            // Compute the average mean temperature for the previous year
            double openTemp = prevYearTemps.empty() ? std::numeric_limits<double>::quiet_NaN()
                                                    : std::accumulate(prevYearTemps.begin(), prevYearTemps.end(), 0.0) / prevYearTemps.size();

            // High and Low temperatures
            double highTemp = *std::max_element(temps.begin(), temps.end());
            double lowTemp = *std::min_element(temps.begin(), temps.end());

            candlesticks.emplace_back(year, openTemp, closeTemp, highTemp, lowTemp);

            // Save the current year's temperatures for the next iteration
            prevYearTemps = temps;
        }
    }

    return candlesticks;
}

// Function to plot the text-based graph
void plotTextGraph(const std::vector<Candlestick>& data, int plotHeight = 10) {
    if (data.empty()) {
        std::cout << "No data to plot.\n";
        return;
    }

    // Determine the global min and max temperatures for scaling
    double globalMin = std::numeric_limits<double>::max();
    double globalMax = std::numeric_limits<double>::lowest();

    for (const auto& c : data) {
        globalMin = std::min(globalMin, c.lowTemp);
        globalMax = std::max(globalMax, c.highTemp);
    }

    // Adjust globalMin and globalMax to the nearest multiple of 5
    int roundedMin = static_cast<int>(std::floor(globalMin / 5.0)) * 5;
    int roundedMax = static_cast<int>(std::ceil(globalMax / 5.0)) * 5;

    // Calculate spacing for years
    const int yearSpacing = 8; // Adjust as necessary for even spacing

    // Ensure the tick interval is 5
    int tickInterval = 5;

    // Display temperature values above the graph
    std::cout << "\nTemperature Values:\n";
    for (const auto& c : data) {
        std::cout << "Year " << c.year << ": "
                  << "openTemp: " << std::fixed << std::setprecision(1) << c.openTemp << " | "
                  << "closeTemp: " << c.closeTemp << " | "
                  << "highTemp: " << c.highTemp << " | "
                  << "lowTemp: " << c.lowTemp << "\n";
    }
    std::cout << "\n";

    // Create a grid to store characters at each row and column
    std::vector<std::vector<std::string>> grid(plotHeight + 1, std::vector<std::string>(data.size(), "   "));

    // Helper function to find the nearest available row
    auto findAvailableRow = [&](int targetRow, size_t col) -> int {
        if (grid[targetRow][col] == "   ") return targetRow;

        // Search upwards and downwards for an available row
        for (int offset = 1; offset <= plotHeight; ++offset) {
            if (targetRow - offset >= 0 && grid[targetRow - offset][col] == "   ") {
                return targetRow - offset;
            }
            if (targetRow + offset <= plotHeight && grid[targetRow + offset][col] == "   ") {
                return targetRow + offset;
            }
        }

        // If no row is available, return the original row
        return targetRow;
    };

    // Populate the grid with dynamically ordered markers
    for (size_t i = 0; i < data.size(); ++i) {
        const auto& c = data[i];

        // Create a vector of temperature-marker pairs
        std::vector<std::pair<double, std::string>> markers = {
            {c.highTemp, " T "},
            {c.closeTemp, " C "},
            {c.openTemp, " O "},
            {c.lowTemp, " B "}
        };

        // Sort markers by temperature in descending order
        std::sort(markers.begin(), markers.end(), [](const auto& a, const auto& b) {
            return a.first > b.first; // Higher temperatures come first
        });

        // Map each temperature to a row on the grid and place the corresponding marker
        for (const auto& marker : markers) {
            int row = static_cast<int>((marker.first - roundedMin) / (roundedMax - roundedMin) * plotHeight);
            row = findAvailableRow(row, i); // Adjust the row if the target row is occupied
            grid[row][i] = marker.second;
        }
    }

    // Generate the graph
    for (int row = plotHeight; row >= 0; --row) {
        int currentValue = roundedMin + (row * tickInterval);

        std::cout << std::setw(6) << currentValue << " |";

        for (size_t col = 0; col < data.size(); ++col) {
            std::cout << std::setw(yearSpacing) << grid[row][col];
        }

        std::cout << "\n";
    }

    // Print year labels centered below the graph
    std::cout << std::setw(6) << " " << " ";
    for (const auto& c : data) {
        std::cout << std::setw(yearSpacing) << c.year;
    }
    std::cout << "\n";
}

int main() {
    std::string filePath = "weather_data_EU_1980-2019_temp_only.csv";
    std::string country;

    std::cout << "Enter the countrycode_temperature (e.g., GB_temperature): ";
    std::cin >> country;

    auto candlestickData = processCSVData(filePath, country);

    if (candlestickData.empty()) {
        std::cerr << "No data available for the selected country." << std::endl;
        return 1;
    }

    while (true) {
        std::cout << "\nOptions:\n"
                  << "1. Display Data\n"
                  << "2. Plot Graph\n"
                  << "3. Reset Filters\n"
                  << "4. Filter by Date Range\n"
                  << "5. Filter by Temperature Range\n"
                  << "6. Exit\n"
                  << "Enter your choice: ";
        int choice;
        std::cin >> choice;

        static std::vector<Candlestick> filteredData = candlestickData;

        if (choice == 1) {
            for (const auto& c : filteredData) {
                std::cout << "Year " << c.year << " | openTemp: " << c.openTemp
                          << " | closeTemp: " << c.closeTemp << " | highTemp: " << c.highTemp
                          << " | lowTemp: " << c.lowTemp << "\n";
            }
        } else if (choice == 2) {
            plotTextGraph(filteredData);
        } else if (choice == 3) {
            filteredData = candlestickData;
            std::cout << "Filters reset." << std::endl;
        } else if (choice == 4) {
            int startYear, endYear;
            std::cout << "Enter start year: ";
            std::cin >> startYear;
            std::cout << "Enter end year: ";
            std::cin >> endYear;
            filteredData.erase(std::remove_if(filteredData.begin(), filteredData.end(),
                                              [startYear, endYear](const Candlestick& c) {
                                                  return c.year < startYear || c.year > endYear;
                                              }),
                               filteredData.end());
            std::cout << "Data filtered by date range." << std::endl;
        } else if (choice == 5) {
            double minTemp, maxTemp;
            std::cout << "Enter minimum temperature: ";
            std::cin >> minTemp;
            std::cout << "Enter maximum temperature: ";
            std::cin >> maxTemp;
            filteredData.erase(std::remove_if(filteredData.begin(), filteredData.end(),
                                              [minTemp, maxTemp](const Candlestick& c) {
                                                  return c.highTemp > maxTemp || c.lowTemp < minTemp;
                                              }),
                               filteredData.end());
            std::cout << "Data filtered by temperature range." << std::endl;
        } else if (choice == 6) {
            std::cout << "Exiting." << std::endl;
            break;
        } else {
            std::cout << "Invalid choice. Try again." << std::endl;
        }
    }

    return 0;
}
