#include "SecurityUtils.hpp"
#include <string>
#include <vector>
#include <regex>
#include <fstream>
#include <sstream>
#include <utility>

namespace Security {

    // Private worker implementation: XOR masking using encapsulated key
    std::string SecurityUtils::encryptLog(const std::string& data) const {
        if (secretKey.empty()) return data;
        
        std::string result = data;
        const size_t keyLength = secretKey.length();
        
        for (size_t i = 0; i < data.length(); ++i) {
            result[i] ^= secretKey[i % keyLength];
        }
        
        return result;
    }

    // Since XOR is symmetric, decrypting is just running the cipher again
    std::string SecurityUtils::decryptLog(const std::string& data) const {
        return encryptLog(data); 
    }

    // Pimpl wrapper hiding heavy standard regex parsing overhead from compilation
    struct SecurityUtils::Impl {
        std::vector<std::pair<std::string, std::regex>> secretPatterns;

        Impl() {
            secretPatterns = {
                {"Generic API Key / Token", std::regex(R"((?:key|token|secret|password|passwd)(?:.*?)[:=]['\"][A-Za-z0-9\-_\+]{16,64}['\"])", std::regex_constants::icase)},
                {"Database Connection String", std::regex(R"((postgres|mysql|mongodb):\/\/[a-zA-Z0-9_\-]+:[a-zA-Z0-9_\-]+@[a-zA-Z0-9\.\-]+:\d+\/[a-zA-Z0-9_\-]+)", std::regex_constants::icase)},
                {"Private Key Block", std::regex(R"(-----BEGIN[A-Z ]+PRIVATE KEY-----)")}
            };
        }
    };

    // Constructor ties the structural pImpl state and sets up instance tokens
    SecurityUtils::SecurityUtils(std::string key) 
        : pImpl(new Impl()), secretKey(std::move(key)) {}

    // Destructor explicitly purges the allocated pImpl block safely
    SecurityUtils::~SecurityUtils() {
        delete pImpl;
    }

    bool SecurityUtils::containsSecrets(const std::string& content, std::vector<std::string>& foundSecrets) const {
        bool detected = false;
        std::smatch match;

        for (const auto& patternPair : pImpl->secretPatterns) {
            std::string textToScan = content;
            while (std::regex_search(textToScan, match, patternPair.second)) {
                detected = true;
                foundSecrets.push_back(patternPair.first + ": " + match.str());
                textToScan = match.suffix().str(); // One-in, one-out sliding movement
            }
        }

        return detected;
    }

    // Public API: Processes data block through private encrypt worker and pushes binary to disk
    bool SecurityUtils::readEncryptLog(const std::string& filePath, const std::string& plainTextLogData) const {
        std::ofstream outFile(filePath, std::ios::binary);
        if (!outFile.is_open()) {
            return false;
        }

        std::string encryptedData = encryptLog(plainTextLogData);
        outFile.write(encryptedData.data(), encryptedData.size());
        return true;
    }

    // Public API: Reads an obfuscated file off the disk and runs it through the private decrypt worker
    std::string SecurityUtils::readDecryptLog(const std::string& filePath) const {
        std::ifstream inFile(filePath, std::ios::binary);
        if (!inFile.is_open()) {
            return "";
        }

        std::stringstream buffer;
        buffer << inFile.rdbuf();
        
        return decryptLog(buffer.str());
    }

} // namespace Security