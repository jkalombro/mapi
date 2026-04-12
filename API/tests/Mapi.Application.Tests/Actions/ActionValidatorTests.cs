using FluentValidation.TestHelper;
using Mapi.Application.Actions.Commands;
using Mapi.Application.Actions.Validators;
using Mapi.Domain.Enums;

namespace Mapi.Application.Tests.Actions;

public class ActionValidatorTests
{
    private readonly CreateActionCommandValidator _createValidator = new();
    private readonly UpdateActionCommandValidator _updateValidator = new();
    private readonly DeleteActionCommandValidator _deleteValidator = new();

    // =========================================================
    // CreateActionCommandValidator
    // =========================================================

    [Fact]
    public void CreateAction_WhenValid_PassesValidation()
    {
        var command = new CreateActionCommand(ActionType.Query, "Valid response template.");
        var result = _createValidator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateAction_WhenResponseTemplateEmpty_FailsValidation()
    {
        var command = new CreateActionCommand(ActionType.Query, "");
        var result = _createValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ResponseTemplate);
    }

    [Fact]
    public void CreateAction_WhenResponseTemplateExceeds500Chars_FailsValidation()
    {
        var longTemplate = new string('a', 501);
        var command = new CreateActionCommand(ActionType.Query, longTemplate);
        var result = _createValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ResponseTemplate);
    }

    [Fact]
    public void CreateAction_WhenResponseTemplateExactly500Chars_PassesValidation()
    {
        var maxTemplate = new string('a', 500);
        var command = new CreateActionCommand(ActionType.Query, maxTemplate);
        var result = _createValidator.TestValidate(command);
        result.ShouldNotHaveValidationErrorFor(x => x.ResponseTemplate);
    }

    // =========================================================
    // UpdateActionCommandValidator
    // =========================================================

    [Fact]
    public void UpdateAction_WhenValid_PassesValidation()
    {
        var command = new UpdateActionCommand(Guid.NewGuid(), "Updated response template.");
        var result = _updateValidator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void UpdateAction_WhenIdEmpty_FailsValidation()
    {
        var command = new UpdateActionCommand(Guid.Empty, "Valid template.");
        var result = _updateValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Id);
    }

    [Fact]
    public void UpdateAction_WhenResponseTemplateEmpty_FailsValidation()
    {
        var command = new UpdateActionCommand(Guid.NewGuid(), "");
        var result = _updateValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ResponseTemplate);
    }

    [Fact]
    public void UpdateAction_WhenResponseTemplateExceeds500Chars_FailsValidation()
    {
        var longTemplate = new string('a', 501);
        var command = new UpdateActionCommand(Guid.NewGuid(), longTemplate);
        var result = _updateValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.ResponseTemplate);
    }

    // =========================================================
    // DeleteActionCommandValidator
    // =========================================================

    [Fact]
    public void DeleteAction_WhenValid_PassesValidation()
    {
        var command = new DeleteActionCommand(Guid.NewGuid());
        var result = _deleteValidator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void DeleteAction_WhenIdEmpty_FailsValidation()
    {
        var command = new DeleteActionCommand(Guid.Empty);
        var result = _deleteValidator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Id);
    }
}
