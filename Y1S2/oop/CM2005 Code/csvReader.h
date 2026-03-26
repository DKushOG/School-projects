#ifndef CSVREADER_H
#define CSVREADER_H

#include <string>
#include <vector>

class CSVReader {
public:
    explicit CSVReader(const std::string& filePath);
    std::vector<std::vector<std::string>> readAll();
    std::vector<std::string> getHeaders();
private:
    std::string filePath;
};

#endif // CSVREADER_H
