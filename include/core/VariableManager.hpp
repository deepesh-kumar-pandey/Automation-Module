#ifndef VARIABLE_MANAGER_HPP
#define VARIABLE_MANAGER_HPP

#include <string>
#include <unordered_map>
#include <mutex>

/**
 * @class VariableManager
 * @brief Handles in-memory storage and resolution of dynamic placeholders.
 * 
 * This class acts as the "State" of the automation engine, allowing different
 * steps to share data by storing and retrieving named variables.
 */
class VariableManager {
public:
    /**
     * @brief Inserts or updates a variable in the global map.
     * @param name The unique identifier for the variable (e.g., "kernel_ver").
     * @param value The content to be stored (e.g., "6.11.0").
     * @note This operation is thread-safe using a mutex lock.
     */
    void set(const std::string& name, const std::string& value);

    /**
     * @brief Retrieves the value associated with a given name.
     * @param name The name of the variable to look up.
     * @return The stored string value, or an empty string if the name doesn't exist.
     */
    std::string get(const std::string& name);

    /**
     * @brief Scans a string for {{placeholders}} and replaces them with stored values.
     * @param text The raw input string containing potential variables (e.g., "Running {{kernel_ver}}").
     * @return A processed string with all recognized placeholders swapped for actual data.
     */
    std::string replace(std::string text);

private:
    /**
     * @brief Internal storage using a Hash Map for O(1) average lookup performance.
     */
    std::unordered_map<std::string, std::string> variables;

    /**
     * @brief Mutex to prevent data races when multiple threads access the VariableManager.
     */
    std::mutex mtx;
};

#endif // VARIABLE_MANAGER_HPP