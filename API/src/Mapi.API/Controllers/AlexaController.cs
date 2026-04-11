using Alexa.NET;
using Alexa.NET.Request;
using Alexa.NET.Request.Type;
using Alexa.NET.Response;
using Mapi.Application.Voice.Commands;
using Mapi.Domain.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Controllers;

[ApiController]
[Route("alexa")]
public class AlexaController : ControllerBase
{
    private const string SLOT_NAME = "ItemName";
    private const string PRICE_QUERY_INTENT = "PriceQueryIntent";
    private const string ADD_ITEM_INTENT = "AddItemIntent";
    private const string RESPONSE_UNLINKED_USER = "Your Alexa account is not linked to Mapi. Please link it in the Mapi web app settings.";
    private const string RESPONSE_UNRECOGNIZED_INTENT = "I didn't understand that request.";

    private readonly IMediator _mediator;
    private readonly IUserRepository _userRepository;
    private readonly ILogger<AlexaController> _logger;

    public AlexaController(IMediator mediator, IUserRepository userRepository, ILogger<AlexaController> logger)
    {
        _mediator = mediator;
        _userRepository = userRepository;
        _logger = logger;
    }

    [HttpPost("skill")]
    public async Task<IActionResult> HandleSkillRequest(
        [FromBody] SkillRequest skillRequest,
        CancellationToken cancellationToken)
    {
        var alexaUserId = skillRequest.Session?.User?.UserId;
        if (string.IsNullOrEmpty(alexaUserId))
        {
            return Ok(BuildSpeechResponse(RESPONSE_UNLINKED_USER));
        }

        var user = await _userRepository.FindByAlexaUserIdAsync(alexaUserId, cancellationToken);
        if (user is null)
        {
            return Ok(BuildSpeechResponse(RESPONSE_UNLINKED_USER));
        }

        var requestType = skillRequest.Request;

        if (requestType is IntentRequest intentRequest)
        {
            return await HandleIntentAsync(intentRequest, cancellationToken);
        }

        return Ok(BuildSpeechResponse(RESPONSE_UNRECOGNIZED_INTENT));
    }

    private async Task<IActionResult> HandleIntentAsync(IntentRequest intentRequest, CancellationToken cancellationToken)
    {
        var intentName = intentRequest.Intent.Name;
        var slotValue = intentRequest.Intent.Slots?.TryGetValue(SLOT_NAME, out var slot) == true
            ? slot.Value
            : string.Empty;

        string transcript;

        switch (intentName)
        {
            case PRICE_QUERY_INTENT:
                transcript = $"how much is {slotValue}";
                break;
            case ADD_ITEM_INTENT:
                var priceSlot = intentRequest.Intent.Slots?.TryGetValue("Price", out var ps) == true ? ps.Value : "0";
                transcript = $"add {slotValue} price {priceSlot}";
                break;
            default:
                return Ok(BuildSpeechResponse(RESPONSE_UNRECOGNIZED_INTENT));
        }

        try
        {
            var result = await _mediator.Send(new ProcessVoiceCommand(transcript), cancellationToken);
            return Ok(BuildSpeechResponse(result.ResponseText));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing Alexa intent {IntentName}", intentName);
            return Ok(BuildSpeechResponse("Mapi is currently unavailable. Please try again later."));
        }
    }

    private static SkillResponse BuildSpeechResponse(string text)
    {
        return ResponseBuilder.Tell(new PlainTextOutputSpeech { Text = text });
    }
}
