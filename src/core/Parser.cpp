#include "core/Parser.hpp" // Include the header for the Parser class
#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp> // External library for JSON handling

// Using an alias to keep the code clean and readable
using json = nlohmann::json;

/**
 * @brief Constructor: Stores the file path for later parsing.
 * @param filePath Path to the JSON automation sequence.
 */
Parser::Parser(const std::string& filePath) : filePath(filePath) {}

/**
 * @brief Private Helper: Checks if the file exists and is readable.
 * @return true if accessible, false if missing or corrupted.
 */
bool Parser::validateFile() const {
    // Basic safety check for an empty string
    if (filePath.empty()) return false;

    std::ifstream file(filePath);
    return file.good(); 
    // std::ifstream's destructor handles file.close() automatically (RAII)
}

/**
 * @brief Main Logic: Translates a JSON file into C++ structs.
 * @return A vector containing all executable steps found in the file.
 */
std::vector<AutomationStep> Parser::parse() const {
    std::vector<AutomationStep> steps;
    
    // 1. Initial Validation
    if (!validateFile()) {
        std::cerr << "[Parser Error] Cannot find or open file: " << filePath << std::endl;
        return steps;
    }

    try {
        // 2. Open the file stream and prepare a JSON object
        std::ifstream file(filePath);
        json data;

        // 3. Deserialize: Load the file content into the JSON object
        // This is where the library checks for valid JSON syntax
        file >> data; 

        // 4. Data Extraction
        // We look for a top-level key named "steps" that must be an array
        if (data.contains("steps") && data["steps"].is_array()) {
            for (const auto& item : data["steps"]) {
                AutomationStep step;
                
                /**
                 * Map JSON keys to C++ struct members.
                 * .value(key, default) is used for safety: if a key is missing 
                 * in one of the JSON objects, it won't crash the program.
                 */
                step.actionType = item.value("type", "undefined"); 
                step.command = item.value("command", "none");
                
                steps.push_back(step);
            }
        }
        
        std::cout << "[Parser] Successfully processed " << steps.size() 
                  << " steps from: " << filePath << std::endl;
        
    } catch (const json::parse_error& e) {
        // Specifically catch JSON syntax errors (e.g., a missing comma in test.json)
        std::cerr << "[JSON Syntax Error] " << e.what() << std::endl;
    } catch (const std::exception& e) {
        // Catch any other generic errors (e.g., memory issues)
        std::cerr << "[Parser Exception] " << e.what() << std::endl;
    }

    return steps;
}