using FluentValidation;
using Mapi.Application.Items.Commands;
using Mapi.Application.Items.Queries;

namespace Mapi.Application.Items.Validators;

public class CreateItemCommandValidator : AbstractValidator<CreateItemCommand>
{
    private const int MAX_NAME_LENGTH = 200;
    private const decimal MIN_PRICE = 0;

    public CreateItemCommandValidator()
    {
        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(MAX_NAME_LENGTH).WithMessage($"Item name must not exceed {MAX_NAME_LENGTH} characters.");

        RuleFor(x => x.BisayaName)
            .NotEmpty().WithMessage("Bisaya name is required.")
            .MaximumLength(MAX_NAME_LENGTH).WithMessage($"Bisaya name must not exceed {MAX_NAME_LENGTH} characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(MIN_PRICE).WithMessage("Price must be zero or greater.");
    }
}

public class UpdateItemCommandValidator : AbstractValidator<UpdateItemCommand>
{
    private const int MAX_NAME_LENGTH = 200;
    private const decimal MIN_PRICE = 0;

    public UpdateItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item ID is required.");

        RuleFor(x => x.ItemName)
            .NotEmpty().WithMessage("Item name is required.")
            .MaximumLength(MAX_NAME_LENGTH).WithMessage($"Item name must not exceed {MAX_NAME_LENGTH} characters.");

        RuleFor(x => x.BisayaName)
            .NotEmpty().WithMessage("Bisaya name is required.")
            .MaximumLength(MAX_NAME_LENGTH).WithMessage($"Bisaya name must not exceed {MAX_NAME_LENGTH} characters.");

        RuleFor(x => x.Price)
            .GreaterThanOrEqualTo(MIN_PRICE).WithMessage("Price must be zero or greater.");
    }
}

public class DeleteItemCommandValidator : AbstractValidator<DeleteItemCommand>
{
    public DeleteItemCommandValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item ID is required.");
    }
}

public class GetItemByIdQueryValidator : AbstractValidator<GetItemByIdQuery>
{
    public GetItemByIdQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEmpty().WithMessage("Item ID is required.");
    }
}
