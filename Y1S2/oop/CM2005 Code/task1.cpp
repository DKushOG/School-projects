#include <iostream>
#include <vector>
#include <string>
#include <map>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <iomanip>
#include "csvReader.h"

class Candlestick {
public:
    double openTemp, closeTemp, highTemp, lowTemp;
    int year;

    Candlestick(int yr, double open, double close, double high, double low)
        : year(yr), openTemp(open), closeTemp(close), highTemp(high), lowTemp(low) {}
};

std::vector<Candlestick> generateCandlestickData(const std::string& country, const std::string& csvFilePath) {
    CSVReader csvReader(csvFilePath);
    auto rows = csvReader.readAll();
    auto headers = csvReader.getHeaders();

    std::vector<Candlestick> candlestickData;
    if (rows.empty() || headers.empty()) {
        std::cerr << "Error: Missing data or headers in the file.\n";
        return candlestickData;
    }

    std::map<std::string, int> headerIndexMap;
    for (size_t i = 0; i < headers.size(); ++i) {
        headerIndexMap[headers[i]] = i;
    }

    if (headerIndexMap.find(country) == headerIndexMap.end()) {
        std::cerr << "Error: Country '" << country << "' not found in the dataset.\n";
        return candlestickData;
    }

    int countryIndex = headerIndexMap[country];
    int currentYear = 0;
    double highestTemp = std::numeric_limits<double>::lowest();
    double lowestTemp = std::numeric_limits<double>::max();
    std::vector<double> previousYearTemperatures, currentYearTemperatures;

    for (size_t rowIdx = 1; rowIdx < rows.size(); ++rowIdx) {
        const auto& row = rows[rowIdx];
        if (row.size() <= countryIndex) continue;

        int year = std::stoi(row[0].substr(0, 4));
        double temp = std::stod(row[countryIndex]);

        if (currentYear != year) {
            if (currentYear != 0 && !currentYearTemperatures.empty()) {
                double openTemp = previousYearTemperatures.empty() ? std::numeric_limits<double>::quiet_NaN()
                                                                    : std::accumulate(previousYearTemperatures.begin(), previousYearTemperatures.end(), 0.0) / previousYearTemperatures.size();
                double closeTemp = std::accumulate(currentYearTemperatures.begin(), currentYearTemperatures.end(), 0.0) / currentYearTemperatures.size();

                candlestickData.emplace_back(currentYear, openTemp, closeTemp, highestTemp, lowestTemp);
            }

            previousYearTemperatures = currentYearTemperatures;
            currentYearTemperatures.clear();
            currentYear = year;
            highestTemp = std::numeric_limits<double>::lowest();
            lowestTemp = std::numeric_limits<double>::max();
        }

        currentYearTemperatures.push_back(temp);
        highestTemp = std::max(highestTemp, temp);
        lowestTemp = std::min(lowestTemp, temp);
    }

    if (!currentYearTemperatures.empty()) {
        double openTemp = previousYearTemperatures.empty() ? std::numeric_limits<double>::quiet_NaN()
                                                            : std::accumulate(previousYearTemperatures.begin(), previousYearTemperatures.end(), 0.0) / previousYearTemperatures.size();
        double closeTemp = std::accumulate(currentYearTemperatures.begin(), currentYearTemperatures.end(), 0.0) / currentYearTemperatures.size();

        candlestickData.emplace_back(currentYear, openTemp, closeTemp, highestTemp, lowestTemp);
    }

    return candlestickData;
}

void displayCandlestickData(const std::vector<Candlestick>& candlesticks) {
    std::cout << std::setw(8) << "Year" << std::setw(12) << "Open"
              << std::setw(12) << "Close" << std::setw(12) << "High"
              << std::setw(12) << "Low" << "\n";
    std::cout << std::string(56, '-') << "\n";

    for (const auto& candlestick : candlesticks) {
        std::cout << std::setw(8) << candlestick.year
                  << std::setw(12) << std::fixed << std::setprecision(2) << candlestick.openTemp
                  << std::setw(12) << candlestick.closeTemp
                  << std::setw(12) << candlestick.highTemp
                  << std::setw(12) << candlestick.lowTemp << "\n";
    }
}

int main() {
    std::string csvFilePath = "weather_data_EU_1980-2019_temp_only.csv";
    std::string country;

    std::cout << "Enter Country Code (e.g., GB_temperature): ";
    std::cin >> country;

    auto candlestickData = generateCandlestickData(country, csvFilePath);
    if (candlestickData.empty()) {
        std::cerr << "No data available for the specified country.\n";
        return 1;
    }

    displayCandlestickData(candlestickData);
    return 0;
}
