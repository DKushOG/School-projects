#include "csvReader.h"
#include <fstream>
#include <sstream>
#include <iostream>

CSVReader::CSVReader(const std::string& filePath) : filePath(filePath) {}

std::vector<std::vector<std::string>> CSVReader::readAll() {
    std::vector<std::vector<std::string>> data;
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cerr << "Error: Unable to open file: " << filePath << std::endl;
        return data;
    }

    std::string line;
    while (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string cell;
        std::vector<std::string> row;

        while (std::getline(ss, cell, ',')) {
            row.push_back(cell);
        }
        data.push_back(row);
    }
    return data;
}

std::vector<std::string> CSVReader::getHeaders() {
    std::vector<std::string> headers;
    std::ifstream file(filePath);
    if (!file.is_open()) {
        std::cerr << "Error: Unable to open file: " << filePath << std::endl;
        return headers;
    }

    std::string line;
    if (std::getline(file, line)) {
        std::stringstream ss(line);
        std::string header;

        while (std::getline(ss, header, ',')) {
            headers.push_back(header);
        }
    }
    return headers;
}
