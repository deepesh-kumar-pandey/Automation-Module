#ifndef PARSER_HPP
#define PARSER_HPP

#include <fstream>
#include <iostream>
#include <vector>
#include <string>

// Forward declaration or include of AutomationStep
struct AutomationStep {
    std::string actionType;
    std::string command;
};

class Parser {
public:
    Parser(const std::string& filePath);
    bool validateFile() const;
    std::vector<AutomationStep> parse();

private:
    std::string filePath;
};

/**
 * @brief Constructor for the Parser class.
 * * @param filePath The relative or absolute path to the automation sequence file.
 */
Parser::Parser(const std::string& filePath) : filePath(filePath) {}

/**
 * @brief Validates the existence and readability of the input file.
 * * This helper uses an input file stream to check if the path provided
 * in the constructor points to a valid, accessible file.
 * * @return true if the file is healthy and ready to read; false otherwise.
 */
bool Parser::validateFile() const {
    // Check if the path string is empty before attempting disk I/O
    if (filePath.empty()) {
        return false;
    }

    std::ifstream file(filePath);
    
    // .good() ensures the file exists, is readable, and no error flags are set
    bool isGood = file.good();
    
    // Close explicitly (optional but recommended for clarity)
    file.close();
    
    return isGood;
}

/**
 * @brief Parses the sequence file into executable steps.
 * * Currently, this functions as a mock parser. It validates the file path
 * and returns a hardcoded instruction to verify the engine's execution flow.
 * * @return std::vector<AutomationStep> A list of steps for the Workers to execute.
 */
std::vector<AutomationStep> Parser::parse() {
    std::vector<AutomationStep> steps;
    
    // --- Phase 1: Validation ---
    if (!validateFile()) {
        // Outputting to stderr (std::cerr) is standard for error logging in Linux
        std::cerr << "[ERROR] Parser: Invalid or inaccessible file path: " 
                  << (filePath.empty() ? "EMPTY_PATH" : filePath) << std::endl;
        return steps; // Return empty vector to prevent engine from crashing
    }

    // --- Phase 2: Loading ---
    std::cout << "[INFO] Parser: Successfully verified " << filePath << std::endl;
    
    // --- Phase 3: Extraction ---
    // TODO: Implement nlohmann/json integration here.
    // Logic will involve:
    // 1. Reading the full file into a string.
    // 2. Deserializing the string into a json object.
    // 3. Iterating through the "steps" array and pushing to the vector.
    
    // Placeholder step for initial system testing
    steps.push_back({"shell", "echo \"[SYSTEM] Automation Engine: Core logic initialized\""});
    
    return steps;
}

#endif