#ifndef PARSER_HPP
#define PARSER_HPP

#include <string>
#include <vector>

struct AutomationStep {
    std::string actionType;
    std::string command;
};

class Parser {
public:
    explicit Parser(const std::string& filePath);
    std::vector<AutomationStep> parse();

private:
    std::string filePath;
    bool validateFile() const; 
};

#endif