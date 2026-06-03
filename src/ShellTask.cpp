#include<ShellTask.hpp>
#include <iostream>
#include <cstdlib> // For system()
#include <vector>
#include <string>
#include <memory>
using namespace std;


namespace Core {

    bool ShellTask::execute(const TaskContext& ctx, 
                            std::shared_ptr<VariableManager> varManager, 
                            std::shared_ptr<Security::SecurityUtils> secUtils) {
        
        // 1. Safety Screening: Scan the command text string for accidental secret/credential leakage
        if (secUtils) {
            std::vector<std::string> leakedSecrets;
            if (secUtils->containsSecrets(ctx.action, leakedSecrets)) {
                std::cerr << "\n[SECURITY ALERT] Step ID " << ctx.id 
                          << " execution blocked! Critical secret leakage detected:" << std::endl;
                
                for (const auto& leak : leakedSecrets) {
                    std::cerr << "  -> " << leak << std::endl;
                }
                return false; // Safely halt execution flow for this specific step payload
            }
        }

        // 2. Execution Phase: Forward the processed command directly to the system shell
        std::cout << "[Worker] Executing: " << ctx.action << std::endl;

        /**
         * std::system passes the target command string to the native host environment shell processor (/bin/sh).
         * .c_str() converts the C++ std::string to a standard null-terminated const char* array.
         */
        int result = std::system(ctx.action.c_str());

        // 3. Status Error Evaluation
        if (result != 0) {
            std::cerr << "[Worker Error] Command failed execution with code: " << result << std::endl;
            return false;
        }

        return true;
    }

} // namespace Core