#include <iostream>
#include <vector>
#include <memory>
#include "Parser.hpp"
#include "VariableManager.hpp"
#include "Worker.hpp"
#include "SecurityUtils.hpp"

using namespace std;

int main(int argc, char* argv[]) {
    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: ONLINE   " << endl;
    cout << "-------------------------------" << endl;

    // 1. Initialize Security Module with an Engine Key via a Shared Pointer
    string engineSecretKey = "automation_engine_secure_key_2026";
    auto security = std::make_shared<Security::SecurityUtils>(engineSecretKey);
    
    // Write an encrypted startup footprint to disk
    security->readEncryptLog("engine_runtime.log", "[SYSTEM] Automation Engine initialized successfully.");

    // 2. Initialize the Shared State (VariableManager) wrapped in Core namespace
    auto varManager = make_shared<Core::VariableManager>();

    // Pre-load environment context variables
    varManager->set("user", "Deepesh");
    varManager->set("engine_mode", "High-Performance");

    // 3. Parse the JSON workflow sequence using Core namespace qualifiers
    string sequencePath = (argc > 1 ? argv[1] : "shared/workflow_schema.json");
    Core::Parser engineParser(sequencePath);
    std::vector<Core::TaskContext> sequence = engineParser.parse();

    if (sequence.empty()) {
        cout << "[SYSTEM] No valid steps found. Check '" << sequencePath << "'." << endl;
        security->readEncryptLog("engine_runtime.log", "[WARN] Engine started with an empty execution sequence.");
    } else {
        cout << "[SYSTEM] Found " << sequence.size() << " steps. Running Static Security Audit..." << endl;

        // 4. Pre-Execution Security Guard Stage
        vector<string> leakedSecrets;
        bool structuralThreatDetected = false;
        
        for (const auto& step : sequence) {
            // Explicitly uses step.action string instead of missing toString()
            if (security->containsSecrets(step.action, leakedSecrets)) {
                structuralThreatDetected = true;
            }
        }

        if (structuralThreatDetected) {
            cerr << "\n[SECURITY RISK] Threat block triggered! Exposed keys found in deployment payload:\n";
            for (const auto& leak : leakedSecrets) {
                cerr << "  -> " << leak << "\n";
            }
            cerr << "[SYSTEM] Terminating execution loop immediately to protect assets.\n" << endl;
            security->readEncryptLog("engine_runtime.log", "[CRITICAL] Aborted execution due to exposed tokens in sequence.");
            return 1; 
        }

        // 5. Initialize the Worker passing all three core required architecture components
        cout << "[SYSTEM] Security audit passed cleanly. Initializing Worker..." << endl;
        Core::Worker worker(sequence, varManager, security);

        // 6. Trigger the Orchestrated Polymorphic Execution Loop
        worker.execute();
        
        security->readEncryptLog("engine_runtime.log", "[SUCCESS] Engine sequence execution loop completed.");
    }

    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: OFFLINE  " << endl;
    cout << "-------------------------------" << endl;

    return 0;
}