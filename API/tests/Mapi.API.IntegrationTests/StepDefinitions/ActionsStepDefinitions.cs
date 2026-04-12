using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class ActionsStepDefinitions
{
    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly TestContext _ctx;
    private readonly ScenarioContext _scenarioContext;

    public ActionsStepDefinitions(TestContext ctx, ScenarioContext scenarioContext)
    {
        _ctx = ctx;
        _scenarioContext = scenarioContext;
    }

    // =========================================================
    // When steps (distinct from TriggersStepDefinitions)
    // =========================================================

    [When(@"I am authenticated as ""(.*)"" with password ""(.*)"" and store name ""(.*)""")]
    public async Task WhenIAmAuthenticated(string email, string password, string storeName)
    {
        await _ctx.AuthenticateAsync(email, password, storeName);
    }

    [When(@"I update the action response template to ""(.*)""")]
    public async Task WhenIUpdateTheActionTemplate(string template)
    {
        var actionId = (Guid)_scenarioContext["lastActionId"];
        var body = TestContext.JsonContent(new { responseTemplate = template });
        _ctx.LastResponse = await _ctx.Client.PutAsync($"/api/v1/actions/{actionId}", body);
    }

    [When(@"I delete the action")]
    public async Task WhenIDeleteTheAction()
    {
        var actionId = (Guid)_scenarioContext["lastActionId"];
        _ctx.LastResponse = await _ctx.Client.DeleteAsync($"/api/v1/actions/{actionId}");
    }

    [When(@"I try to create an action with type ""(.*)"" and empty template")]
    public async Task WhenITryToCreateActionWithEmptyTemplate(string actionType)
    {
        var body = TestContext.JsonContent(new { actionType, responseTemplate = "" });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/actions", body);
    }

    [When(@"I try to create an action with type ""(.*)"" and template over 500 chars")]
    public async Task WhenITryToCreateActionWithLongTemplate(string actionType)
    {
        var longTemplate = new string('a', 501);
        var body = TestContext.JsonContent(new { actionType, responseTemplate = longTemplate });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/actions", body);
    }

    [When(@"I try to update the action with empty response template")]
    public async Task WhenITryToUpdateActionWithEmptyTemplate()
    {
        var actionId = (Guid)_scenarioContext["lastActionId"];
        var body = TestContext.JsonContent(new { responseTemplate = "" });
        _ctx.LastResponse = await _ctx.Client.PutAsync($"/api/v1/actions/{actionId}", body);
    }

    [When(@"I try to update a non-existent action with template ""(.*)""")]
    public async Task WhenITryToUpdateNonExistentAction(string template)
    {
        var nonExistentId = Guid.NewGuid();
        var body = TestContext.JsonContent(new { responseTemplate = template });
        _ctx.LastResponse = await _ctx.Client.PutAsync($"/api/v1/actions/{nonExistentId}", body);
    }

    [When(@"I try to delete a non-existent action")]
    public async Task WhenITryToDeleteNonExistentAction()
    {
        var nonExistentId = Guid.NewGuid();
        _ctx.LastResponse = await _ctx.Client.DeleteAsync($"/api/v1/actions/{nonExistentId}");
    }

    // =========================================================
    // Then steps
    // =========================================================

    [Then(@"the actions list should contain template ""(.*)""")]
    public async Task ThenTheActionsListShouldContainTemplate(string expectedTemplate)
    {
        var json = await _ctx.GetResponseJson();
        var actions = json.EnumerateArray();
        Assert.Contains(actions, a =>
            a.GetProperty("responseTemplate").GetString() == expectedTemplate);
    }

    [Then(@"the actions list should be empty")]
    public async Task ThenTheActionsListShouldBeEmpty()
    {
        var json = await _ctx.GetResponseJson();
        Assert.Empty(json.EnumerateArray());
    }

    [Then(@"the actions list should not contain template ""(.*)""")]
    public async Task ThenTheActionsListShouldNotContainTemplate(string unexpectedTemplate)
    {
        var json = await _ctx.GetResponseJson();
        var actions = json.EnumerateArray().ToList();
        Assert.DoesNotContain(actions, a =>
            a.GetProperty("responseTemplate").GetString() == unexpectedTemplate);
    }

    [Then(@"the response should have a Location header")]
    public void ThenTheResponseShouldHaveLocationHeader()
    {
        Assert.NotNull(_ctx.LastResponse!.Headers.Location);
    }

    [Then(@"the action response should have action type ""(.*)""")]
    public async Task ThenTheActionResponseShouldHaveActionType(string expectedType)
    {
        var json = await _ctx.GetResponseJson();
        var actionType = json.GetProperty("actionType").GetString();
        Assert.Equal(expectedType, actionType);
    }
}
