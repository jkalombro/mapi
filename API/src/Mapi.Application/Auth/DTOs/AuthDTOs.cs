namespace Mapi.Application.Auth.DTOs;

public record RegisterRequest(string Email, string Password, string StoreName);
public record LoginRequest(string Email, string Password);
public record AuthResponse(string AccessToken, string TokenType = "Bearer");
