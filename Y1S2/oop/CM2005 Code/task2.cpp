#include <iostream>
#include <vector>
#include <map>
#include <iomanip>
#include <cmath>
#include <limits>
#include <numeric>
#include "csvReader.h"

class Candlestick {
public:
    double openTemp, closeTemp, highTemp, lowTemp;
    int year;

    Candlestick(int yr, double op, double cl, double hi, double lo)
        : year(yr), openTemp(op), closeTemp(cl), highTemp(hi), lowTemp(lo) {}
};

inline double stringToDouble(const std::string& str) {
    try {
        return str.empty() ? std::numeric_limits<double>::quiet_NaN() : std::stod(str);
    } catch (...) {
        return std::numeric_limits<double>::quiet_NaN();
    }
}

std::vector<Candlestick> parseCSVToCandlesticks(const std::string& location, const std::string& filePath) {
    CSVReader reader(filePath);
    auto data = reader.readAll();
    auto headers = reader.getHeaders();

    std::vector<Candlestick> candlesticks;
    if (data.empty() || headers.empty()) {
        std::cerr << "Error: Missing data or headers in the file." << std::endl;
        return candlesticks;
    }

    std::map<std::string, int> columnMap;
    for (size_t i = 0; i < headers.size(); ++i) {
        columnMap[headers[i]] = i;
    }

    if (columnMap.find(location) == columnMap.end()) {
        std::cerr << "Error: Location '" << location << "' not found in the dataset." << std::endl;
        return candlesticks;
    }

    int locationIndex = columnMap[location];
    int currentYear = 0;
    std::vector<double> yearTemps, prevYearTemps;
    double yearlyhighTemp = std::numeric_limits<double>::lowest();
    double yearlylowTemp = std::numeric_limits<double>::max();

    for (size_t i = 1; i < data.size(); ++i) {
        const auto& row = data[i];
        if (row.size() <= locationIndex) continue;

        int year = std::stoi(row[0].substr(0, 4));
        double temp = stringToDouble(row[locationIndex]);
        if (std::isnan(temp)) continue;

        if (year != currentYear) {
            if (!yearTemps.empty()) {
                double openTemp = prevYearTemps.empty() ? std::numeric_limits<double>::quiet_NaN() : std::accumulate(prevYearTemps.begin(), prevYearTemps.end(), 0.0) / prevYearTemps.size();
                double closeTemp = std::accumulate(yearTemps.begin(), yearTemps.end(), 0.0) / yearTemps.size();
                candlesticks.emplace_back(currentYear, openTemp, closeTemp, yearlyhighTemp, yearlylowTemp);
            }
            prevYearTemps = yearTemps;
            yearTemps.clear();
            currentYear = year;
            yearlyhighTemp = std::numeric_limits<double>::lowest();
            yearlylowTemp = std::numeric_limits<double>::max();
        }

        yearTemps.push_back(temp);
        yearlyhighTemp = std::max(yearlyhighTemp, temp);
        yearlylowTemp = std::min(yearlylowTemp, temp);
    }

    if (!yearTemps.empty()) {
        double openTemp = prevYearTemps.empty() ? std::numeric_limits<double>::quiet_NaN() : std::accumulate(prevYearTemps.begin(), prevYearTemps.end(), 0.0) / prevYearTemps.size();
        double closeTemp = std::accumulate(yearTemps.begin(), yearTemps.end(), 0.0) / yearTemps.size();
        candlesticks.emplace_back(currentYear, openTemp, closeTemp, yearlyhighTemp, yearlylowTemp);
    }

    return candlesticks;
}

void plotCandlestickGraph(const std::vector<Candlestick>& candlesticks) {
    const int graphHeight = 10;
    for (const auto& candle : candlesticks) {
        std::cout << "Year " << candle.year << ":\n";
        std::cout << "  openTemp: " << candle.openTemp << " | closeTemp: " << candle.closeTemp
                  << " | highTemp: " << candle.highTemp << " | lowTemp: " << candle.lowTemp << "\n";

        double range = candle.highTemp - candle.lowTemp;
        int openTempPos = static_cast<int>((candle.openTemp - candle.lowTemp) / range * (graphHeight - 1));
        int closeTempPos = static_cast<int>((candle.closeTemp - candle.lowTemp) / range * (graphHeight - 1));
        int highTempPos = 0;
        int lowTempPos = graphHeight - 1;

        // Adjust for overlaps
        if (openTempPos == closeTempPos) {
            if (closeTempPos < graphHeight - 1) {
                ++closeTempPos; // Shift closeTemp marker one position up
            } else {
                --openTempPos; // Shift openTemp marker one position down
            }
        }

        // Create temperature scale
        int minTemp = static_cast<int>(std::floor(candle.lowTemp / 5.0)) * 5;
        int maxTemp = static_cast<int>(std::ceil(candle.highTemp / 5.0)) * 5;
        std::vector<int> tempScale;
        for (int temp = maxTemp; temp >= minTemp; temp -= 5) {
            tempScale.push_back(temp);
        }

        std::map<int, int> tempRows;
        for (size_t i = 0; i < tempScale.size(); ++i) {
            int row = static_cast<int>((candle.highTemp - tempScale[i]) / range * (graphHeight - 1));
            tempRows[row] = tempScale[i];
        }

        for (int i = 0; i < graphHeight; ++i) {
            // Print temperature scale
            if (tempRows.find(i) != tempRows.end()) {
                std::cout << std::setw(4) << tempRows[i] << " ";
            } else {
                std::cout << "     ";
            }

            // Plot markers
            if (i == highTempPos) std::cout << " T  ";
            else if (i == lowTempPos) std::cout << " B  ";
            else if (i == openTempPos) std::cout << " O  ";
            else if (i == closeTempPos) std::cout << " C  ";
            else std::cout << " |  ";

            std::cout << '\n';
        }

        std::cout << '\n';
    }
}

int main() {
    std::string filePath = "weather_data_EU_1980-2019_temp_only.csv";
    std::string location;
    std::cout << "Enter the country code (e.g., GB_temperature): ";
    std::cin >> location;

    auto candlestickData = parseCSVToCandlesticks(location, filePath);
    if (candlestickData.empty()) {
        std::cerr << "No data available for the specified country." << std::endl;
        return 1;
    }

    plotCandlestickGraph(candlestickData);
    return 0;
}
