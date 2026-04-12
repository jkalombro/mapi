using Mapi.Application.Actions.DTOs;
using Mapi.Application.Actions.Queries;
using MediatR;

namespace Mapi.API.Endpoints;

public static class ActionsEndpoints
{
    public static IEndpointRouteBuilder MapActionsEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/actions").WithTags("Actions").RequireAuthorization();

        group.MapGet("/", GetAllActionsAsync)
            .WithName("GetActions")
            .WithSummary("Get all available seeded actions")
            .Produces<IReadOnlyList<ActionResponse>>();

        return app;
    }

    private static async Task<IResult> GetAllActionsAsync(IMediator mediator, CancellationToken cancellationToken)
    {
        var result = await mediator.Send(new GetActionsQuery(), cancellationToken);
        return TypedResults.Ok(result);
    }
}
