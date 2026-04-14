using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class TriggersStepDefinitions
{
    private static readonly Guid QUERY_ACTION_ID  = new("00000000-0000-0000-0000-000000000001");
    private static readonly Guid ADD_ACTION_ID    = new("00000000-0000-0000-0000-000000000002");
    private static readonly Guid UPDATE_ACTION_ID = new("00000000-0000-0000-0000-000000000003");
    private static readonly Guid REMOVE_ACTION_ID = new("00000000-0000-0000-0000-000000000004");

    private static readonly JsonSerializerOptions JsonOptions = new() { PropertyNameCaseInsensitive = true };

    private readonly TestContext _ctx;
    private readonly ScenarioContext _scenarioContext;

    public TriggersStepDefinitions(TestContext ctx, ScenarioContext scenarioContext)
    {
        _ctx = ctx;
        _scenarioContext = scenarioContext;
    }

    [When(@"I create a trigger with phrase ""(.*)"" and the Query action")]
    public async Task WhenICreateATriggerWithQueryAction(string phrase)
    {
        await CreateTriggerAsync(phrase, QUERY_ACTION_ID);
    }

    [When(@"I try to create a trigger with phrase ""(.*)"" and no action")]
    public async Task WhenITryToCreateATriggerWithNoAction(string phrase)
    {
        var body = TestContext.JsonContent(new { phrase });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/triggers", body);
    }

    [Given(@"I have a trigger with phrase ""(.*)"" and the Query action")]
    public async Task GivenIHaveATriggerWithQueryAction(string phrase)
    {
        await CreateTriggerAsync(phrase, QUERY_ACTION_ID);
    }

    [Given(@"I have a trigger with phrase ""(.*)"" and the Remove action")]
    public async Task GivenIHaveATriggerWithRemoveAction(string phrase)
    {
        await CreateTriggerAsync(phrase, REMOVE_ACTION_ID);
    }

    [When(@"I update the trigger phrase to ""(.*)"" and assign the Add action")]
    public async Task WhenIUpdateTheTriggerPhraseAndAssignAddAction(string phrase)
    {
        var triggerId = (Guid)_scenarioContext["lastTriggerId"];
        var body = TestContext.JsonContent(new { phrase, actionId = ADD_ACTION_ID });
        _ctx.LastResponse = await _ctx.Client.PutAsync($"/api/v1/triggers/{triggerId}", body);
    }

    [When(@"I delete the trigger")]
    public async Task WhenIDeleteTheTrigger()
    {
        var triggerId = (Guid)_scenarioContext["lastTriggerId"];
        _ctx.LastResponse = await _ctx.Client.DeleteAsync($"/api/v1/triggers/{triggerId}");
    }

    [Then(@"the trigger response should contain phrase ""(.*)""")]
    public async Task ThenTheTriggerResponseShouldContainPhrase(string expectedPhrase)
    {
        var json = await _ctx.GetResponseJson();
        var phrase = json.GetProperty("phrase").GetString();
        Assert.Equal(expectedPhrase, phrase);
    }

    [Then(@"the trigger response should have an action type of ""(.*)""")]
    public async Task ThenTheTriggerResponseShouldHaveActionType(string expectedActionType)
    {
        var json = await _ctx.GetResponseJson();
        var actionType = json.GetProperty("actionType").GetString();
        Assert.Equal(expectedActionType, actionType);
    }

    // =========================================================
    // Shared helper
    // =========================================================

    private async Task CreateTriggerAsync(string phrase, Guid actionId)
    {
        var body = TestContext.JsonContent(new { phrase, actionId });
        var response = await _ctx.Client.PostAsync("/api/v1/triggers", body);
        _ctx.LastResponse = response;
        if (response.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(
                await response.Content.ReadAsStringAsync(),
                JsonOptions);
            _scenarioContext["lastTriggerId"] = json.GetProperty("id").GetGuid();
        }
    }
}
