#ifndef WORKER_HPP
#define WORKER_HPP

#include <vector>
#include <string>
#include <memory>
#include <unordered_map>
#include "BaseTask.hpp"
#include "VariableManager.hpp"
#include "SecurityUtils.hpp"

namespace Core {

    /**
     * @class Worker
     * @brief Central execution engine responsible for cycling through and running steps.
     * * The Worker walks through a sequential vector of tasks, processes dynamic placeholder 
     * resolutions, and safely routes execution payloads to their corresponding task strategy handlers.
     */
    class Worker {
    public:
        /**
         * @brief Constructor: Initializes the engine loop configuration.
         * @param steps A sequential vector of parsed task contexts to execute.
         * @param vm Shared pointer to the central application state variable registry.
         * @param sec Shared pointer to the application cryptographic core utility engine.
         */
        Worker(const std::vector<TaskContext>& steps, 
               std::shared_ptr<VariableManager> vm,
               std::shared_ptr<Security::SecurityUtils> sec);

        ~Worker() = default;

        /**
         * @brief High-level orchestration trigger that loops through and fires the automation stream.
         */
        void execute();

    private:
        /**
         * @brief Routes an isolated task to its polymorphic processing strategy block.
         * @param step The specific TaskContext step metadata package to process.
         */
        void performAction(const TaskContext& step);

        // Linear sequence sequence array block
        std::vector<TaskContext> m_steps;

        // Shared engine state pointers
        std::shared_ptr<VariableManager> m_varManager;
        std::shared_ptr<Security::SecurityUtils> m_securityUtils;

        /**
         * @brief Map of type strings (e.g., "command", "api") to their respective decoupled task actions.
         */
        std::unordered_map<std::string, std::unique_ptr<BaseTask>> m_taskRegistry;
    };

} // namespace Core

#endif /* WORKER_HPP */