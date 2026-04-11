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
            .WithDescription("Dispatches a spoken transcript through the command engine and returns a spoken response.")
            .Produces<VoiceCommandResult>()
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapPost("/confirm-add", ConfirmAddAsync)
            .WithName("ConfirmVoiceAdd")
            .WithSummary("Confirm voice item addition / price update")
            .Produces<VoiceCommandResult>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }

    private static async Task<IResult> ProcessCommandAsync(
        [FromBody] VoiceCommandRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ProcessVoiceCommand(request.Transcript), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> ConfirmAddAsync(
        [FromBody] ConfirmVoiceAddRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new ConfirmVoiceAddCommand(request.ItemName, request.Price), cancellationToken);
        return TypedResults.Ok(result);
    }
}

public record ConfirmVoiceAddRequest(string ItemName, decimal Price);
