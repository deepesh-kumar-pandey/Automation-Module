#ifndef WORKER_HPP
#define WORKER_HPP

#include <vector>
#include <string>
#include <memory>
#include "Parser.hpp" 
#include "VariableManager.hpp" // Include the header so Worker knows the class size

/**
 * @class Worker
 * @brief Responsible for taking a sequence of automation steps and executing them.
 * 
 * The Worker acts as the execution engine. It processes a list of instructions 
 * (AutomationSteps) and translates them into system-level actions.
 */
class Worker {
public:
    /**
     * @brief Constructor: Takes a pre-parsed list of steps and a shared VariableManager.
     * @param steps A vector of AutomationStep objects to be executed.
     * @param vm Shared pointer to the global VariableManager instance.
     */
    Worker(const std::vector<AutomationStep>& steps, std::shared_ptr<VariableManager> vm) 
        : steps(steps), varManager(vm) {}

    /**
     * @brief High-level trigger to start the execution of the entire sequence.
     * Iterates through the stored 'steps' and calls performAction on each.
     */
    void execute();

private:
    // The internal list of tasks to run
    std::vector<AutomationStep> steps;

    // Shared pointer to the VariableManager for resolving placeholders
    std::shared_ptr<VariableManager> varManager;

    /**
     * @brief Internal logic to execute a single task based on its actionType.
     * @param step The specific AutomationStep to process.
     */
    void performAction(const AutomationStep& step);
}; 

#endif /* WORKER_HPP */