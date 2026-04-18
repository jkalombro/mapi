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
