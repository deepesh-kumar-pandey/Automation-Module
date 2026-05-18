#ifndef SECURITY_UTILS_HPP
#define SECURITY_UTILS_HPP

#include <string>
#include <vector>

namespace Security {

    class SecurityUtils {
    public:
        // Initialize with a secure cryptographic mask key
        SecurityUtils(std::string key = "default_secure_fallback_key");
        ~SecurityUtils();

        // High-performance scanner engine to find leaked credentials
        bool containsSecrets(const std::string& content, std::vector<std::string>& foundSecrets) const;

        // Public File-I/O endpoints for managing obfuscated logs
        bool readEncryptLog(const std::string& filePath, const std::string& plainTextLogData) const;
        std::string readDecryptLog(const std::string& filePath) const;

    private:
        // Encapsulated internal cryptographic workers
        std::string encryptLog(const std::string& data) const;
        std::string decryptLog(const std::string& data) const;

        struct Impl;
        Impl* pImpl;           // Pimpl wrapper isolating heavy <regex> compilation overhead
        std::string secretKey; // Encapsulated instance token key
    };

} // namespace Security

#endif // SECURITY_UTILS_HPP
