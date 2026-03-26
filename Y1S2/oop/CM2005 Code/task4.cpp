#include <iostream>
#include <vector>
#include <fstream>
#include <sstream>
#include <string>
#include <cmath>
#include <limits>
#include <numeric>
#include <iomanip>
#include <map>
#include <algorithm>
#include <regex> // For date validation

// Function to safely convert a string to double
double safeStringToDouble(const std::string& str) {
    try {
        if (str.empty()) throw std::invalid_argument("Empty string");
        return std::stod(str);
    } catch (...) {
        return std::numeric_limits<double>::quiet_NaN();
    }
}

// Function to validate the date format (YYYY-MM-DD)
bool isValidDateFormat(const std::string& date) {
    const std::regex dateRegex(R"(^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$)");
    return std::regex_match(date, dateRegex);
}

// Function to convert YYYY-MM-DD to Day-of-Year (DOY)
int dateToDayOfYear(const std::string& date) {
    int year = std::stoi(date.substr(0, 4));
    int month = std::stoi(date.substr(5, 2));
    int day = std::stoi(date.substr(8, 2));

    static const int daysInMonth[] = { 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 };
    int doy = day;

    for (int i = 0; i < month - 1; ++i) {
        doy += daysInMonth[i];
    }

    // Account for leap years
    if (month > 2 && (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0))) {
        ++doy;
    }

    return doy;
}

// Function to read daily data for a specific country
std::map<int, std::vector<double>> readDailyDataByDOY(const std::string& filePath, const std::string& country) {
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cerr << "Error: Unable to open file: " << filePath << std::endl;
        return {};
    }

    std::string line;
    std::map<int, std::vector<double>> dailyTempsByDOY;

    // Parse the header row to find the column for the specified country
    std::getline(file, line);
    std::stringstream headerStream(line);
    std::string columnName;
    int countryColumnIndex = -1;
    int currentIndex = 0;

    while (std::getline(headerStream, columnName, ',')) {
        if (columnName == country) {
            countryColumnIndex = currentIndex;
            break;
        }
        currentIndex++;
    }

    if (countryColumnIndex == -1) {
        std::cerr << "Error: Country not found in the dataset.\n";
        return {};
    }

    // Process daily data for the selected country
    while (std::getline(file, line)) {
        std::stringstream lineStream(line);
        std::string date, tempStr;
        std::getline(lineStream, date, ',');

        int doy = dateToDayOfYear(date);
        for (int i = 0; i <= countryColumnIndex; ++i) {
            std::getline(lineStream, tempStr, ',');
        }

        double temperature = safeStringToDouble(tempStr);
        if (!std::isnan(temperature)) {
            dailyTempsByDOY[doy].push_back(temperature);
        }
    }

    return dailyTempsByDOY;
}

// Function to calculate the historical average temperature for each DOY
std::map<int, double> calculateHistoricalAverages(const std::map<int, std::vector<double>>& dailyTempsByDOY) {
    std::map<int, double> historicalAverages;

    for (const auto& entry : dailyTempsByDOY) {
        int doy = entry.first;
        const auto& temps = entry.second;

        double avgTemp = std::accumulate(temps.begin(), temps.end(), 0.0) / temps.size();
        historicalAverages[doy] = avgTemp;
    }

    return historicalAverages;
}

// Function to plot the temperature graph for a specific DOY
void plotTemperatureForDOY(const std::string& targetDate, double predictedTemp) {
    const int plotHeight = 20;
    const double tickInterval = 0.1; // Scale for Y-axis

    double minTemp = std::floor(predictedTemp - 1.0);
    double maxTemp = std::ceil(predictedTemp + 1.0);

    for (double tempValue = maxTemp; tempValue >= minTemp; tempValue -= tickInterval) {
        std::cout << std::setw(6) << std::fixed << std::setprecision(1) << tempValue << " | ";

        if (std::fabs(tempValue - predictedTemp) < tickInterval / 2) {
            std::cout << "*"; // Highlight predicted temperature
        } else {
            std::cout << " ";
        }

        std::cout << "\n";
    }

    // Print X-axis (target date)
    std::cout << "       " << targetDate << "\n";
}

int main() {
    std::string filePath = "weather_data_EU_1980-2019_temp_only.csv";
    std::string country;

    std::cout << "Enter the countrycode_temperature (e.g., GB_temperature): ";
    std::cin >> country;

    // Read data and compute historical averages
    auto dailyTempsByDOY = readDailyDataByDOY(filePath, country);
    if (dailyTempsByDOY.empty()) {
        std::cerr << "No data available for the selected country.\n";
        return 1;
    }

    auto historicalAverages = calculateHistoricalAverages(dailyTempsByDOY);

    // Input target date
    std::string targetDate;
    std::cout << "Enter the target date for prediction (YYYY-MM-DD): ";
    std::cin >> targetDate;

    // Validate date format
    if (!isValidDateFormat(targetDate)) {
        std::cerr << "Error: Invalid date format. Please use YYYY-MM-DD.\n";
        return 1;
    }

    // Check if the date is before 2020-01-01
    if (targetDate < "2020-01-01") { // String comparison works because YYYY-MM-DD is lexicographically ordered
        std::cerr << "Error: Cannot predict data for dates before 2020-01-01.\n";
        return 1;
    }

    int targetDOY = dateToDayOfYear(targetDate);

    // Predict temperature for the target DOY
    if (historicalAverages.find(targetDOY) != historicalAverages.end()) {
        double predictedTemp = historicalAverages[targetDOY];
        std::cout << "\nPredicted Temperature for " << targetDate << ": "
                  << std::fixed << std::setprecision(2) << predictedTemp << "°C\n";

        // Plot the temperature graph for the specific DOY
        plotTemperatureForDOY(targetDate, predictedTemp);
    } else {
        std::cerr << "No historical data available for the specified date.\n";
    }

    return 0;
}
