#ifndef PARSER_HPP
#define PARSER_HPP

#include <string>
#include <vector>
#include "BaseTask.hpp" // Pulls in the shared Core::TaskContext definition

namespace Core {

    /**
     * @class Parser
     * @brief Responsible for parsing, validating, and structuring JSON workflow sequences.
     * * The Parser ingests configuration scripts from disk and transforms them into
     * an unrolled linear sequence of TaskContext instructions ready for the Worker.
     */
    class Parser {
    public:
        /**
         * @brief Constructor initializing the parser with a target sequence file path.
         * @param filePath Path to the JSON automation pipeline schema file.
         */
        explicit Parser(const std::string& filePath);
        
        ~Parser() = default;

        /**
         * @brief Ingests and processes the JSON file into an executable sequence vector.
         * @return A vector of fully initialized TaskContext blocks.
         * @note Marked as const because reading/parsing a file does not alter the parser instance state.
         */
        std::vector<TaskContext> parse() const;

    private:
        /**
         * @brief Verifies file existence, readability, and basic JSON structure before parsing.
         */
        bool validateFile() const; 

        std::string m_filePath;
    };

} // namespace Core

#endif // PARSER_HPP