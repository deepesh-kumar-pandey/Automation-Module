#include "Worker.hpp"
#include "ShellTask.hpp" // Added: Include the newly created ShellTask header
#include <iostream>

namespace Core {

    /**
     * @brief Worker constructor initializing internal orchestration dependencies.
     * Maps step string keys directly to their concrete polymorphic task executors.
     */
    Worker::Worker(const std::vector<TaskContext>& steps, 
                   std::shared_ptr<VariableManager> vm,
                   std::shared_ptr<Security::SecurityUtils> sec)
        : m_steps(steps), m_varManager(vm), m_securityUtils(sec) {
        
        // Fixed: Registered the "shell" keyword to instantiate our ShellTask runner
        m_taskRegistry["shell"] = std::make_unique<ShellTask>();
    }

    /**
     * @brief The core execution loop: Resolves placeholders and triggers actions via polymorphic tasks.
     */
    void Worker::execute() {
        std::cout << "\n[Worker] Starting Execution Sequence..." << std::endl;
        std::cout << "---------------------------------------" << std::endl;

        for (const auto& step : m_steps) {
            performAction(step);
        }

        std::cout << "---------------------------------------" << std::endl;
        std::cout << "[Worker] Sequence finished successfully." << std::endl;
    }

    /**
     * @brief Logic Dispatcher: Passes the task context to its respective task component.
     */
    void Worker::performAction(const TaskContext& step) {
        // 1. Resolve variables within the action payload string on the fly using our Manager
        TaskContext resolvedStep = step;
        if (m_varManager) {
            resolvedStep.action = m_varManager->replace(step.action);
        }

        // 2. Lookup the appropriate strategy execution component inside our registry map
        auto it = m_taskRegistry.find(resolvedStep.type);
        if (it != m_taskRegistry.end()) {
            // Polymorphic dispatch passing our state context and security utilities along
            bool success = it->second->execute(resolvedStep, m_varManager, m_securityUtils);
            if (!success) {
                std::cerr << "[Worker Error] Step failed execution: " << resolvedStep.id << std::endl;
            }
        } 
        else {
            std::cerr << "[Worker Warning] Unknown action type: '" << resolvedStep.type 
                      << "'. Skipping step ID: " << resolvedStep.id << std::endl;
        }
    }

} // namespace Core