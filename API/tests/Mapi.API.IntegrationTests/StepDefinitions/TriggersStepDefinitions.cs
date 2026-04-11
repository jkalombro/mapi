using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class TriggersStepDefinitions
{
    private readonly TestContext _ctx;
    private readonly ScenarioContext _scenarioContext;

    public TriggersStepDefinitions(TestContext ctx, ScenarioContext scenarioContext)
    {
        _ctx = ctx;
        _scenarioContext = scenarioContext;
    }

    [When(@"I create a trigger with phrase ""(.*)""")]
    public async Task WhenICreateATrigger(string phrase)
    {
        var body = TestContext.JsonContent(new { phrase });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/triggers", body);
        if (_ctx.LastResponse.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(
                await _ctx.LastResponse.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            _scenarioContext["lastTriggerId"] = json.GetProperty("id").GetGuid();
        }
    }

    [Given(@"I have a trigger with phrase ""(.*)""")]
    public async Task GivenIHaveATrigger(string phrase)
    {
        var body = TestContext.JsonContent(new { phrase });
        var response = await _ctx.Client.PostAsync("/api/v1/triggers", body);
        var json = JsonSerializer.Deserialize<JsonElement>(
            await response.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        _scenarioContext["lastTriggerId"] = json.GetProperty("id").GetGuid();
    }

    [When(@"I create an action with type ""(.*)"" and template ""(.*)""")]
    public async Task WhenICreateAnAction(string actionType, string template)
    {
        var body = TestContext.JsonContent(new { actionType, responseTemplate = template });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/actions", body);
        if (_ctx.LastResponse.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(
                await _ctx.LastResponse.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            _scenarioContext["lastActionId"] = json.GetProperty("id").GetGuid();
        }
    }

    [Given(@"I have an action with type ""(.*)"" and template ""(.*)""")]
    public async Task GivenIHaveAnAction(string actionType, string template)
    {
        var body = TestContext.JsonContent(new { actionType, responseTemplate = template });
        var response = await _ctx.Client.PostAsync("/api/v1/actions", body);
        var json = JsonSerializer.Deserialize<JsonElement>(
            await response.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        _scenarioContext["lastActionId"] = json.GetProperty("id").GetGuid();
    }

    [When(@"I link the action to the trigger with sort order (\d+)")]
    public async Task WhenILinkTheActionToTrigger(int sortOrder)
    {
        var triggerId = (Guid)_scenarioContext["lastTriggerId"];
        var actionId = (Guid)_scenarioContext["lastActionId"];
        var body = TestContext.JsonContent(new { actionId, sortOrder });
        _ctx.LastResponse = await _ctx.Client.PostAsync($"/api/v1/triggers/{triggerId}/actions", body);
    }

    [Given(@"the action is linked to the trigger")]
    public async Task GivenTheActionIsLinkedToTheTrigger()
    {
        var triggerId = (Guid)_scenarioContext["lastTriggerId"];
        var actionId = (Guid)_scenarioContext["lastActionId"];
        var body = TestContext.JsonContent(new { actionId, sortOrder = 1 });
        await _ctx.Client.PostAsync($"/api/v1/triggers/{triggerId}/actions", body);
    }

    [Given(@"the action is linked to the trigger with sort order (\d+)")]
    public async Task GivenTheActionIsLinkedToTriggerWithSortOrder(int sortOrder)
    {
        var triggerId = (Guid)_scenarioContext["lastTriggerId"];
        var actionId = (Guid)_scenarioContext["lastActionId"];
        var body = TestContext.JsonContent(new { actionId, sortOrder });
        await _ctx.Client.PostAsync($"/api/v1/triggers/{triggerId}/actions", body);
    }

    [When(@"I try to delete the action")]
    public async Task WhenITryToDeleteTheAction()
    {
        var actionId = (Guid)_scenarioContext["lastActionId"];
        _ctx.LastResponse = await _ctx.Client.DeleteAsync($"/api/v1/actions/{actionId}");
    }

    [Then(@"the trigger response should contain phrase ""(.*)""")]
    public async Task ThenTheTriggerResponseShouldContainPhrase(string expectedPhrase)
    {
        var json = await _ctx.GetResponseJson();
        var phrase = json.GetProperty("phrase").GetString();
        Assert.Equal(expectedPhrase, phrase);
    }

    [Then(@"the action response should contain template ""(.*)""")]
    public async Task ThenTheActionResponseShouldContainTemplate(string expectedTemplate)
    {
        var json = await _ctx.GetResponseJson();
        var template = json.GetProperty("responseTemplate").GetString();
        Assert.Equal(expectedTemplate, template);
    }
}
