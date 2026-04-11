using Mapi.Application.Items.Commands;
using Mapi.Application.Items.DTOs;
using Mapi.Application.Items.Queries;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Endpoints;

public static class ItemsEndpoints
{
    public static IEndpointRouteBuilder MapItemsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/items").WithTags("Items").RequireAuthorization();

        group.MapGet("/", GetAllItemsAsync)
            .WithName("GetItems")
            .WithSummary("Get all items for the authenticated user")
            .Produces<IReadOnlyList<ItemResponse>>();

        group.MapGet("/{id:guid}", GetItemByIdAsync)
            .WithName("GetItemById")
            .WithSummary("Get a single item by ID")
            .Produces<ItemResponse>()
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapPost("/", CreateItemAsync)
            .WithName("CreateItem")
            .WithSummary("Create a new item")
            .Produces<ItemResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest);

        group.MapPut("/{id:guid}", UpdateItemAsync)
            .WithName("UpdateItem")
            .WithSummary("Update an existing item")
            .Produces<ItemResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound);

        group.MapDelete("/{id:guid}", DeleteItemAsync)
            .WithName("DeleteItem")
            .WithSummary("Delete an item")
            .Produces(StatusCodes.Status204NoContent)
            .ProducesProblem(StatusCodes.Status404NotFound);

        return app;
    }

    private static async Task<IResult> GetAllItemsAsync(
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetItemsQuery(), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> GetItemByIdAsync(
        Guid id,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetItemByIdQuery(id), cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> CreateItemAsync(
        [FromBody] ItemRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new CreateItemCommand(request.ItemName, request.BisayaName, request.Price);
        var result = await mediator.Send(command, cancellationToken);
        return TypedResults.Created($"/api/v1/items/{result.Id}", result);
    }

    private static async Task<IResult> UpdateItemAsync(
        Guid id,
        [FromBody] ItemRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new UpdateItemCommand(id, request.ItemName, request.BisayaName, request.Price);
        var result = await mediator.Send(command, cancellationToken);
        return TypedResults.Ok(result);
    }

    private static async Task<IResult> DeleteItemAsync(
        Guid id,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        await mediator.Send(new DeleteItemCommand(id), cancellationToken);
        return TypedResults.NoContent();
    }
}
