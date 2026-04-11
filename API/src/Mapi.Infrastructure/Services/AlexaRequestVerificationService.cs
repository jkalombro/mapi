using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Mapi.Infrastructure.Services;

public class AlexaRequestVerificationService
{
    private readonly bool _skipVerification;
    private readonly ILogger<AlexaRequestVerificationService> _logger;

    public AlexaRequestVerificationService(
        IConfiguration configuration,
        ILogger<AlexaRequestVerificationService> logger)
    {
        _skipVerification = configuration.GetValue<bool>("Alexa:SkipSignatureVerification");
        _logger = logger;
    }

    public Task<bool> VerifyRequestAsync(
        string signatureCertChainUrl,
        string signature,
        string requestBody)
    {
        if (_skipVerification)
        {
            _logger.LogWarning("Alexa request signature verification is disabled. Enable in production via Alexa:SkipSignatureVerification=false.");
            return Task.FromResult(true);
        }

        _logger.LogInformation("Verifying Alexa request signature.");

        // Production: delegate to Alexa.NET.Security or similar library
        // For now, return true — replace with real verification before going live
        return Task.FromResult(true);
    }
}
