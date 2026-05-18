#include <iostream>
#include <vector>
#include <memory>
#include "core/Parser.hpp"
#include "core/VariableManager.hpp"
#include "core/Worker.hpp"
#include "core/SecurityUtils.hpp" // Integrated Security Module

using namespace std;

int main(int argc, char* argv[]) {
    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: ONLINE   " << endl;
    cout << "-------------------------------" << endl;

    // 1. Initialize Security Module with an Engine Key
    // In a real system, you'd pull this from a protected environment variable
    string engineSecretKey = "automation_engine_secure_key_2026";
    Security::SecurityUtils security(engineSecretKey);
    
    // Write an encrypted startup footprint to disk
    security.readEncryptLog("engine_runtime.log", "[SYSTEM] Automation Engine initialized successfully.");

    // 2. Initialize the Shared State (VariableManager)
    auto varManager = make_shared<VariableManager>();

    // Pre-load environment context variables
    varManager->set("user", "Deepesh");
    varManager->set("engine_mode", "High-Performance");

    // 3. Parse the JSON workflow sequence
    string sequencePath = (argc > 1 ? argv[1] : "sequences/test.json");
    Parser engineParser(sequencePath);
    auto sequence = engineParser.parse();

    if (sequence.empty()) {
        cout << "[SYSTEM] No valid steps found. Check '" << sequencePath << "'." << endl;
        security.readEncryptLog("engine_runtime.log", "[WARN] Engine started with an empty execution sequence.");
    } else {
        cout << "[SYSTEM] Found " << sequence.size() << " steps. Running Security Audit..." << endl;

        // 4. Security Guard Stage
        // Scan the incoming sequence payloads for accidentally committed hardcoded secrets
        vector<string> leakedSecrets;
        bool structuralThreatDetected = false;
        
        // Simulating scanning the raw content of your sequence steps
        // (Assuming sequence steps contain text strings, scripts, or commands)
        for (const auto& step : sequence) {
            // Adjust step.toString() or step.getCommand() based on your actual Step structure
            if (security.containsSecrets(step.toString(), leakedSecrets)) {
                structuralThreatDetected = true;
            }
        }

        if (structuralThreatDetected) {
            cerr << "[SECURITY RISK] Threat block triggered! Exposed keys found in payload:\n";
            for (const auto& leak : leakedSecrets) {
                cerr << "  -> " << leak << "\n";
            }
            cerr << "[SYSTEM] Terminating execution execution loop immediately to protect assets.\n";
            security.readEncryptLog("engine_runtime.log", "[CRITICAL] Aborted execution due to exposed tokens in sequence.");
            return 1; // Terminate with security error code
        }

        // 5. Initialize the Worker with the shared VariableManager
        cout << "[SYSTEM] Security audit passed cleanly. Initializing Worker..." << endl;
        Worker worker(sequence, varManager);

        // 6. Trigger the Execution Loop
        worker.execute();
        
        security.readEncryptLog("engine_runtime.log", "[SUCCESS] Engine sequence execution loop completed.");
    }

    cout << "-------------------------------" << endl;
    cout << "   Automation Engine: OFFLINE  " << endl;
    cout << "-------------------------------" << endl;

    return 0;
}