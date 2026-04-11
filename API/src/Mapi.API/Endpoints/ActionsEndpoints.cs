using Mapi.Application.Actions.Commands;
using Mapi.Application.Actions.DTOs;
using Mapi.Application.Actions.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Endpoints;

public static class ActionsEndpoints
{
    public static IEndpointRouteBuilder MapActionsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/actions").WithTags("Actions").RequireAuthorization();

        group.MapGet("/", GetAllActionsAsync)
            .WithName("GetActions")
            .WithSummary("Get all actions for the authenticated user")
            .Produces<IReadOnlyList<ActionResponse>>();

        group.MapGet("/{id:guid}", GetActionByIdAsync)
            .WithName("GetActionById")
            .WithSummary("Get a single action by ID")
            .Produces<ActionResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateActionAsync)
            .WithName("CreateAction")
            .WithSummary("Create a new action")
            .Produces<ActionResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateActionAsync)
            .WithName("UpdateAction")
            .WithSummary("Update an existing action")
            .Produces<ActionResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteActionAsync)
            .WithName("DeleteAction")
            .WithSummary("Delete an action (fails if linked to a trigger)")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status409Conflict);

        return app;
    }

    private static async Task<IResult> GetAllActionsAsync(IMediator mediator, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetActionsQuery(), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetActionByIdAsync(Guid id, IMediator mediator, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetActionByIdQuery(id), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CreateActionAsync(
        [FromBody] ActionRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new CreateActionCommand(request.ActionType, request.ResponseTemplate), cancellationToken);
        return TypedResults.Created($"/api/v1/actions/{result.Id}", result);
    }

    private static async Task<IResult> UpdateActionAsync(
        Guid id,
        [FromBody] ActionRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new UpdateActionCommand(id, request.ActionType, request.ResponseTemplate), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> DeleteActionAsync(Guid id, IMediator mediator, CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteActionCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }
}
