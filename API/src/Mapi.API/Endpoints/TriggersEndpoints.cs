using Mapi.Application.Triggers.Commands;
using Mapi.Application.Triggers.DTOs;
using Mapi.Application.Triggers.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Endpoints;

public static class TriggersEndpoints
{
    public static IEndpointRouteBuilder MapTriggersEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/triggers").WithTags("Triggers").RequireAuthorization();

        group.MapGet("/", GetAllTriggersAsync)
            .WithName("GetTriggers")
            .WithSummary("Get all triggers for the authenticated user")
            .Produces<IReadOnlyList<TriggerResponse>>();

        group.MapGet("/{id:guid}", GetTriggerByIdAsync)
            .WithName("GetTriggerById")
            .WithSummary("Get a single trigger by ID")
            .Produces<TriggerResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateTriggerAsync)
            .WithName("CreateTrigger")
            .WithSummary("Create a new trigger phrase")
            .Produces<TriggerResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateTriggerAsync)
            .WithName("UpdateTrigger")
            .WithSummary("Update a trigger phrase")
            .Produces<TriggerResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteTriggerAsync)
            .WithName("DeleteTrigger")
            .WithSummary("Delete a trigger")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/{triggerId:guid}/actions", LinkActionAsync)
            .WithName("LinkActionToTrigger")
            .WithSummary("Link an action to a trigger")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{triggerId:guid}/actions/{actionId:guid}", UnlinkActionAsync)
            .WithName("UnlinkActionFromTrigger")
            .WithSummary("Unlink an action from a trigger")
            .Produces(StatusCodes.Status204NoContent);

        return app;
    }

    private static async Task<IResult> GetAllTriggersAsync(IMediator mediator, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTriggersQuery(), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetTriggerByIdAsync(Guid id, IMediator mediator, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetTriggerByIdQuery(id), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CreateTriggerAsync(
        [FromBody] TriggerRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateTriggerCommand(request.Phrase), cancellationToken);
        return TypedResults.Created($"/api/v1/triggers/{result.Id}", result);
    }

    private static async Task<IResult> UpdateTriggerAsync(
        Guid id,
        [FromBody] TriggerRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateTriggerCommand(id, request.Phrase), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> DeleteTriggerAsync(Guid id, IMediator mediator, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteTriggerCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }

    private static async Task<IResult> LinkActionAsync(
        Guid triggerId,
        [FromBody] TriggerActionLinkRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new LinkActionCommand(triggerId, request.ActionId, request.SortOrder), cancellationToken);
        return TypedResults.NoContent();
    }

    private static async Task<IResult> UnlinkActionAsync(
        Guid triggerId,
        Guid actionId,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new UnlinkActionCommand(triggerId, actionId), cancellationToken);
        return TypedResults.NoContent();
    }
}
