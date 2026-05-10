#include "../../include/core/Parser.hpp" // FIX: Remove ../include/. CMake already knows where 'include' is.
#include <fstream>
#include <iostream>

/**
 * @brief Constructor: Initializes the parser with the path to the automation sequence file.
 * @param filePath Path to the sequence file.
 */
Parser::Parser(const std::string& filePath) : filePath(filePath) {}

/**
 * @brief Private Helper: Checks if the file exists and can be opened for reading.
 * @return true if the file is accessible, false otherwise.
 */
bool Parser::validateFile() const {
    // Check for empty path before disk access to avoid unnecessary system calls
    if (filePath.empty()) return false;

    std::ifstream file(filePath);
    return file.good(); 
    // RAII: std::ifstream closes automatically when the 'file' object goes out of scope
}

/**
 * @brief Main Logic: Reads the file and converts its contents into a vector of steps.
 * @return A vector of AutomationStep structures.
 */
std::vector<AutomationStep> Parser::parse() {
    std::vector<AutomationStep> steps;
    
    // 1. Safety check: Exit early if the file path is invalid
    if (!validateFile()) {
        // cerr is better for errors as it is unbuffered and goes to the error stream
        std::cerr << "[Parser Error] Cannot open: " << filePath << std::endl;
        return steps;
    }

    // 2. Success log for debugging
    std::cout << "[Parser] Successfully loaded: " << filePath << std::endl;
    
    // 3. Mock Data
    // Matches the struct {string actionType; string command;} in your .hpp
    steps.push_back({"shell", "echo \"Automation Engine: Core logic initialized\""});
    
    return steps;
}