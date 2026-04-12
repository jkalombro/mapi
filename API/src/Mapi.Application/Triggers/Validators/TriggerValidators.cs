using FluentValidation;
using Mapi.Application.Triggers.Commands;

namespace Mapi.Application.Triggers.Validators;

public class CreateTriggerCommandValidator : AbstractValidator<CreateTriggerCommand>
{
    private const int MAX_PHRASE_LENGTH = 200;

    public CreateTriggerCommandValidator()
    {
        RuleFor(x => x.Phrase)
            .NotEmpty().WithMessage("Trigger phrase is required.")
            .MaximumLength(MAX_PHRASE_LENGTH).WithMessage($"Trigger phrase must not exceed {MAX_PHRASE_LENGTH} characters.");

        RuleFor(x => x.ActionId)
            .NotEmpty().WithMessage("Action is required.");
    }
}

public class UpdateTriggerCommandValidator : AbstractValidator<UpdateTriggerCommand>
{
    private const int MAX_PHRASE_LENGTH = 200;

    public UpdateTriggerCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Trigger ID is required.");

        RuleFor(x => x.Phrase)
            .NotEmpty().WithMessage("Trigger phrase is required.")
            .MaximumLength(MAX_PHRASE_LENGTH).WithMessage($"Trigger phrase must not exceed {MAX_PHRASE_LENGTH} characters.");

        RuleFor(x => x.ActionId)
            .NotEmpty().WithMessage("Action is required.");
    }
}

public class DeleteTriggerCommandValidator : AbstractValidator<DeleteTriggerCommand>
{
    public DeleteTriggerCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Trigger ID is required.");
    }
}
