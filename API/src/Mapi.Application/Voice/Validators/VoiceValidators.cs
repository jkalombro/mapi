using FluentValidation;
using Mapi.Application.Voice.Commands;

namespace Mapi.Application.Voice.Validators;

public class ProcessVoiceCommandValidator : AbstractValidator<ProcessVoiceCommand>
{
    public ProcessVoiceCommandValidator()
    {
        RuleFor(x => x.Transcript)
            .NotEmpty().WithMessage("Transcript is required.");
    }
}

public class ConfirmVoiceAddCommandValidator : AbstractValidator<ConfirmVoiceAddCommand>
{
    private const int MAX_ITEM_NAME_LENGTH = 200;
    private const decimal MIN_PRICE = 0;

    public ConfirmVoiceAddCommandValidator()
    {
        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(MAX_ITEM_NAME_LENGTH).WithMessage($"Item name must not exceed {MAX_ITEM_NAME_LENGTH} characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(MIN_PRICE).WithMessage("Price must be zero or greater.");
    }
}
