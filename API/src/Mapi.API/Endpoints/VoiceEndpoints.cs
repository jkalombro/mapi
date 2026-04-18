using Mapi.Application.Voice.Commands;
using Mapi.Application.Voice.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Endpoints;

public static class VoiceEndpoints
{
    public static IEndpointRouteBuilder MapVoiceEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/voice").WithTags("Voice").RequireAuthorization();

        group.MapPost("/command", ProcessCommandAsync)
            .WithName("ProcessVoiceCommand")
            .WithSummary("Process a voice transcript")
            .WithDescription("Dispatches a spoken transcript through the command engine and returns a spoken response. Include pendingIntent and pendingItemName from a prior response to continue a multi-turn flow.")
            .Produces<VoiceCommandResult>()
            .ProducesProblem(StatusCodes.Status400BadRequest);

        return app;
    }

    private static async Task<IResult> ProcessCommandAsync(
        [FromBody] VoiceCommandRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(
            new ProcessVoiceCommand(request.Transcript, request.PendingIntent, request.PendingItemName),
            cancellationToken);
        return TypedResults.Ok(result);
    }
}
