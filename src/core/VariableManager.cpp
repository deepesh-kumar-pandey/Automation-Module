#include "VariableManager.hpp"
#include <iostream>

namespace Core {

    /**
     * @brief Thread-safe assignment of variables.
     * Uses std::lock_guard to ensure the mutex is released even if an exception occurs (RAII).
     */
    void VariableManager::set(const std::string& name, const std::string& value) {
        std::lock_guard<std::mutex> lock(mtx);
        variables[name] = value;
    }

    /**
     * @brief Thread-safe retrieval of stored variables.
     * Returns an empty string if the key is not found to prevent iterator-related crashes.
     */
    std::string VariableManager::get(const std::string& name) const {
        std::lock_guard<std::mutex> lock(mtx);
        auto it = variables.find(name);
        // Standard find check to ensure the key exists before accessing
        return (it != variables.end()) ? it->second : "";
    }

    /**
     * @brief Resolves placeholders within a string using stored variables.
     * * Matches signature contract: const reference input parameter + const method execution state.
     */
    std::string VariableManager::replace(const std::string& text) const { // Fixed signature mismatch here!
        // Lock once for the entire replacement process to ensure a consistent state
        std::lock_guard<std::mutex> lock(mtx);
        
        std::string result = text; // Create a local mutable copy to work on since input parameter is const reference
        
        for (const auto& [key, value] : variables) {
            std::string placeholder = "{{" + key + "}}";
            size_t pos = result.find(placeholder);
            
            // Loop ensures that multiple occurrences of the same variable are replaced
            while (pos != std::string::npos) {
                result.replace(pos, placeholder.length(), value);
                
                // Resume searching relative to the structural movement 
                // of the mutated string length offset to safely prevent infinite loops.
                pos = result.find(placeholder, pos + value.length());
            }
        }
        return result;
    }

} // namespace Core