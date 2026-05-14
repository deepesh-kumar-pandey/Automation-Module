#include "core/VariableManager.hpp"

void VariableManager::set(const std::string& key, const std::string& value) {
    variables[key] = value;
}

std::string VariableManager::get(const std::string& key) const {
    auto it = variables.find(key);
    if (it != variables.end()) {
        return it->second;
    }
    return "";
}

std::string VariableManager::resolve(const std::string& command) const {
    std::string result = command;
    
    // Pattern to match {{key}} placeholders
    std::regex pattern(R"(\{\{(\w+)\}\})");
    std::smatch match;
    
    while (std::regex_search(result, match, pattern)) {
        std::string key = match[1].str();
        std::string value = get(key);
        
        // Replace the first occurrence of {{key}} with its value
        result.replace(match.position(0), match.length(0), value);
    }
    
    return result;
}
