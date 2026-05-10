#include "Parser.hpp"
#include <fstream>
#include <iostream>

/**
 * Constructor: Initializes the parser with the path to the automation sequence file.
 * @param filePath Path to the JSON or sequence file (e.g., "sequences/setup.json")
 */
Parser::Parser(const std::string& filePath) : filePath(filePath) {}

/**
 * Private Helper: Checks if the file exists and can be opened for reading.
 * @return true if the file is accessible, false otherwise.
 */
bool Parser::validateFile() const {
    std::ifstream file(filePath);
    // .good() checks for existence, readability, and that it's not a directory
    return file.good();
}

/**
 * Main Logic: Reads the file and converts its contents into a vector of steps.
 * Currently uses a placeholder step for testing the engine loop.
 * @return A vector of AutomationStep structures to be executed by the Workers.
 */
std::vector<AutomationStep> Parser::parse() {
    std::vector<AutomationStep> steps;
    
    // 1. Safety check: Exit early if the file path is invalid
    if(!validateFile()) {
        std::cerr << "[Parser Error] Cannot open: " << filePath << std::endl;
        return steps;
    }

    // 2. Success log for debugging (will be visible in your Fedora terminal)
    std::cout << "[Parser] Successfully loaded: " << filePath << std::endl;
    
    // 3. TODO: Integrate nlohmann/json here to parse real files
    // For now, we manually push a test step to verify the build works
    steps.push_back({"shell", "echo \"Automation Engine: Core logic initialized\""});
    
    return steps;
}