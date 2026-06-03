#pragma once

#include <string>
#include <memory>
#include <mutex>
#include <unordered_map>
#include "VariableManager.hpp"
#include "SecurityUtils.hpp"

namespace Core {

    /**
     * @brief Context structure carrying data parameters parsed for an isolated execution step.
     */
    struct TaskContext {
        std::string id;                                        // Unique identifier for the step execution tracing
        std::string type;                                      // Task target routing string (e.g., "command", "api_call")
        std::string action;                                    // Code payload, terminal string command, or target endpoint
        std::unordered_map<std::string, std::string> metadata; // Optional extensible parameter bindings (headers, env, etc.)
    };

    /**
     * @brief Abstract Base Class serving as the foundational contract for all Engine Workers/Tasks.
     */
    class BaseTask {
    public:
        /**
         * @brief Virtual destructor ensuring clean structural cleanup for derived instances.
         */
        virtual ~BaseTask() = default;

        /**
         * @brief Core execution hook overridden by concrete tasks to process domain-specific operations.
         * * @param ctx Read-only structural blueprint reference carrying target configurations for this step.
         * @param varManager Shared system state register allowing steps to dynamically persist or extract variable metrics.
         * @param secUtils Shared access instance to the core application cryptography/regex scanning utility wrappers.
         * @return true if the process chain finishes cleanly with a success state, false if an error interrupts execution.
         */
        virtual bool execute(const TaskContext& ctx, 
                             std::shared_ptr<VariableManager> varManager, 
                             std::shared_ptr<Security::SecurityUtils> secUtils) = 0;    
    }; // Fixed: Added missing trailing semicolon

} // namespace Core