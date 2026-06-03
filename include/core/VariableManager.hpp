#ifndef VARIABLE_MANAGER_HPP
#define VARIABLE_MANAGER_HPP

#include <string>
#include <unordered_map>
#include <mutex>

namespace Core {

    /**
     * @class VariableManager
     * @brief Handles thread-safe in-memory storage and resolution of dynamic placeholders.
     * * This class acts as the centralized state manager of the automation engine, 
     * allowing different steps to share data securely across execution segments.
     */
    class VariableManager {
    public:
        VariableManager() = default;
        ~VariableManager() = default;

        // Prevent copying to ensure thread-safety structures aren't broken
        VariableManager(const VariableManager&) = delete;
        VariableManager& operator=(const VariableManager&) = delete;

        /**
         * @brief Inserts or updates a variable in the registry map.
         * @param name The unique identifier for the variable (e.g., "kernel_ver").
         * @param value The content to be stored (e.g., "6.11.0").
         */
        void set(const std::string& name, const std::string& value);

        /**
         * @brief Retrieves the value associated with a given name.
         * @param name The name of the variable to look up.
         * @return The stored string value, or an empty string if it doesn't exist.
         */
        std::string get(const std::string& name) const; // Fixed: Made const for read-only access

        /**
         * @brief Checks if a specific configuration key exists in the storage.
         */
        bool has(const std::string& name) const;

        /**
         * @brief Scans a string for {{placeholders}} and replaces them with stored values.
         * @param text The raw input string containing potential variables (e.g., "Running {{kernel_ver}}").
         * @return A fully processed string with all registered tokens swapped for actual data.
         */
        std::string replace(const std::string& text) const;

    private:
        /**
         * @brief Internal storage map for O(1) tracking lookups.
         */
        std::unordered_map<std::string, std::string> variables;

        /**
         * @brief Mutex protecting the hash map from simultaneous read/write data races.
         */
        mutable std::mutex mtx; // Fixed: Marked mutable to allow locking inside const functions
    };

} // namespace Core

#endif // VARIABLE_MANAGER_HPP