#include "core/VariableManager.hpp"
#include <iostream>

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
std::string VariableManager::get(const std::string& name) {
    std::lock_guard<std::mutex> lock(mtx);
    auto it = variables.find(name);
    // Standard find check to ensure the key exists before accessing
    return (it != variables.end()) ? it->second : "";
}

/**
 * @brief Resolves placeholders within a string using stored variables.
 * 
 * Iterates through the internal map and replaces all instances of {{key}} with 
 * their corresponding values. This is the bridge between the translation layer 
 * and the actual shell execution.
 */
std::string VariableManager::replace(std::string text) {
    // Lock once for the entire replacement process to ensure a consistent state
    std::lock_guard<std::mutex> lock(mtx);
    
    for(const auto&[key, value] : variables) {
        std::string placeholder = "{{" + key + "}}";
        size_t pos = text.find(placeholder);
        
        // Loop ensures that multiple occurrences of the same variable are replaced
        while(pos != std::string::npos) {
            text.replace(pos, placeholder.length(), value);
            
            // Resume searching from the end of the newly inserted value to avoid
            // infinite loops if the value itself contains a placeholder.
            pos = text.find(placeholder, pos + value.length());
        }
    }
    return text;
}