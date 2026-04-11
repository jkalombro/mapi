using Mapi.Application.Auth.Commands;
using Mapi.Application.Auth.DTOs;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace Mapi.API.Endpoints;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/v1/auth").WithTags("Auth");

        group.MapPost("/register", RegisterAsync)
            .WithName("RegisterUser")
            .WithSummary("Register a new user account")
            .WithDescription("Creates a new Mapi account with email, password, and store name.")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .AllowAnonymous();

        group.MapPost("/login", LoginAsync)
            .WithName("LoginUser")
            .WithSummary("Authenticate and receive a JWT")
            .WithDescription("Returns a JWT access token for valid credentials.")
            .Produces<AuthResponse>()
            .ProducesProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .AllowAnonymous();

        return app;
    }

    private static async Task<IResult> RegisterAsync(
        [FromBody] RegisterRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new RegisterCommand(request.Email, request.Password, request.StoreName);
        var response = await mediator.Send(command, cancellationToken);
        return TypedResults.Created("/api/v1/auth/register", response);
    }

    private static async Task<IResult> LoginAsync(
        [FromBody] LoginRequest request,
        IMediator mediator,
        CancellationToken cancellationToken)
    {
        var command = new LoginCommand(request.Email, request.Password);
        var response = await mediator.Send(command, cancellationToken);
        return TypedResults.Ok(response);
    }
}
