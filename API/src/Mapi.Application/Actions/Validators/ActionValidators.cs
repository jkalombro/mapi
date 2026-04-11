using FluentValidation;
using Mapi.Application.Actions.Commands;

namespace Mapi.Application.Actions.Validators;

public class CreateActionCommandValidator : AbstractValidator<CreateActionCommand>
{
    private const int MAX_TEMPLATE_LENGTH = 500;

    public CreateActionCommandValidator()
    {
        RuleFor(x => x.ResponseTemplate)
            .NotEmpty().WithMessage("Response template is required.")
            .MaximumLength(MAX_TEMPLATE_LENGTH).WithMessage($"Response template must not exceed {MAX_TEMPLATE_LENGTH} characters.");
    }
}

public class UpdateActionCommandValidator : AbstractValidator<UpdateActionCommand>
{
    private const int MAX_TEMPLATE_LENGTH = 500;

    public UpdateActionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Action ID is required.");

        RuleFor(x => x.ResponseTemplate)
            .NotEmpty().WithMessage("Response template is required.")
            .MaximumLength(MAX_TEMPLATE_LENGTH).WithMessage($"Response template must not exceed {MAX_TEMPLATE_LENGTH} characters.");
    }
}

public class DeleteActionCommandValidator : AbstractValidator<DeleteActionCommand>
{
    public DeleteActionCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Action ID is required.");
    }
}
