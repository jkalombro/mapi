using FluentValidation;
using Mapi.Application.Auth.Commands;

namespace Mapi.Application.Auth.Validators;

public class RegisterCommandValidator : AbstractValidator<RegisterCommand>
{
    private const int MIN_PASSWORD_LENGTH = 8;
    private const int MAX_EMAIL_LENGTH = 320;
    private const int MAX_STORE_NAME_LENGTH = 200;

    public RegisterCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .MaximumLength(MAX_EMAIL_LENGTH).WithMessage($"Email must not exceed {MAX_EMAIL_LENGTH} characters.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(MIN_PASSWORD_LENGTH).WithMessage($"Password must be at least {MIN_PASSWORD_LENGTH} characters.")
            .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
            .Matches(@"\d").WithMessage("Password must contain at least one number.");

        RuleFor(x => x.StoreName)
            .NotEmpty().WithMessage("Store name is required.")
            .MaximumLength(MAX_STORE_NAME_LENGTH).WithMessage($"Store name must not exceed {MAX_STORE_NAME_LENGTH} characters.");
    }
}

public class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Email must be a valid email address.");

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.");
    }
}
