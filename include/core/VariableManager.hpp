#ifndef VARIABLE_MANAGER_HPP
#define VARIABLE_MANAGER_HPP

#include <string>
#include <unordered_map>
#include <regex>

/**
 * @class VariableManager
 * @brief Manages dynamic variables and template substitution for automation commands.
 * 
 * This class stores key-value pairs and provides methods to resolve template
 * placeholders (e.g., {{user}}, {{engine_mode}}) in command strings.
 */
class VariableManager {
public:
    /**
     * @brief Constructor: Initialize an empty variable store.
     */
    VariableManager() = default;

    /**
     * @brief Store a variable.
     * @param key The variable name (e.g., "user", "kernel").
     * @param value The variable value (e.g., "Deepesh", "6.11.0").
     */
    void set(const std::string& key, const std::string& value);

    /**
     * @brief Retrieve a stored variable.
     * @param key The variable name.
     * @return The variable value, or an empty string if not found.
     */
    std::string get(const std::string& key) const;

    /**
     * @brief Resolve template placeholders in a command string.
     * Replaces all {{key}} patterns with their corresponding values.
     * @param command The command string containing placeholders.
     * @return The resolved command string.
     */
    std::string resolve(const std::string& command) const;

private:
    // Map to store key-value pairs
    std::unordered_map<std::string, std::string> variables;
};

#endif /* VARIABLE_MANAGER_HPP */
