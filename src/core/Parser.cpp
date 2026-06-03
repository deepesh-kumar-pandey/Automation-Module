#include "Parser.hpp"
#include <fstream>
#include <iostream>
#include <nlohmann/json.hpp> // External library for JSON handling

// Using an alias to keep the code clean and readable
using json = nlohmann::json;

namespace Core {

    /**
     * @brief Constructor: Stores the file path for later parsing.
     * @param filePath Path to the JSON automation sequence.
     */
    Parser::Parser(const std::string& filePath) : m_filePath(filePath) {}

    /**
     * @brief Private Helper: Checks if the file exists and is readable.
     * @return true if accessible, false if missing or corrupted.
     */
    bool Parser::validateFile() const {
        // Basic safety check for an empty string
        if (m_filePath.empty()) return false;

        std::ifstream file(m_filePath);
        return file.good(); 
        // std::ifstream's destructor handles file.close() automatically (RAII)
    }

    /**
     * @brief Main Logic: Translates a JSON file into unified C++ TaskContext structs.
     * @return A vector containing all executable steps found in the file.
     */
    std::vector<TaskContext> Parser::parse() const {
        std::vector<TaskContext> steps;
        
        // 1. Initial Validation
        if (!validateFile()) {
            std::cerr << "[Parser Error] Cannot find or open file: " << m_filePath << std::endl;
            return steps;
        }

        try {
            // 2. Open the file stream and prepare a JSON object
            std::ifstream file(m_filePath);
            json data;

            // 3. Deserialize: Load the file content into the JSON object
            file >> data; 

            // 4. Data Extraction
            // Look for a top-level key named "steps" that must be an array
            if (data.contains("steps") && data["steps"].is_array()) {
                for (const auto& item : data["steps"]) {
                    TaskContext step;
                    
                    /**
                     * Map JSON keys to our unified C++ TaskContext struct members.
                     * .value(key, default) prevents crashes if structural elements are omitted.
                     */
                    step.id = item.value("id", "step_" + std::to_string(steps.size() + 1));
                    step.type = item.value("type", "undefined"); 
                    step.action = item.value("action", item.value("command", "none")); // Fallback support for old schema files
                    
                    // Safely extract the optional "metadata" map block if provided
                    if (item.contains("metadata") && item["metadata"].is_object()) {
                        for (auto& [key, value] : item["metadata"].items()) {
                            if (value.is_string()) {
                                step.metadata[key] = value.get<std::string>();
                            }
                        }
                    }
                    
                    steps.push_back(step);
                }
            }
            
            std::cout << "[Parser] Successfully processed " << steps.size() 
                      << " workflow steps from: " << m_filePath << std::endl;
            
        } catch (const json::parse_error& e) {
            // Specifically catch JSON syntax errors (e.g., a missing comma in workflow_schema.json)
            std::cerr << "[JSON Syntax Error] " << e.what() << std::endl;
        } catch (const std::exception& e) {
            // Catch any other generic errors (e.g., memory issues)
            std::cerr << "[Parser Exception] " << e.what() << std::endl;
        }

        return steps;
    }

} // namespace Core