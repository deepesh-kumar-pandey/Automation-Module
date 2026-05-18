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
    // Pass string by const reference to avoid unnecessary memory copies
    explicit Parser(const std::string& filePath);
    
    // Alternative: Use std::filesystem::path for native cross-platform path handling
    // explicit Parser(std::filesystem::path filePath);

    // Marked as const because parsing a file shouldn't modify the Parser instance's internal state
    std::vector<AutomationStep> parse() const;

private:
    std::string filePath;
    
    // Marked as const (already correct in your snippet)
    bool validateFile() const; 
};

#endif // PARSER_HPP