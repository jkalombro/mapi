using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class ActionsStepDefinitions
{
    private readonly TestContext _ctx;

    public ActionsStepDefinitions(TestContext ctx)
    {
        _ctx = ctx;
    }

    [Then(@"the actions list should contain exactly (\d+) actions")]
    public async Task ThenTheActionsListShouldContainExactly(int expectedCount)
    {
        var json = await _ctx.GetResponseJson();
        var count = json.EnumerateArray().Count();
        Assert.Equal(expectedCount, count);
    }

    [Then(@"the actions list should contain action type ""(.*)""")]
    public async Task ThenTheActionsListShouldContainActionType(string expectedType)
    {
        var json = await _ctx.GetResponseJson();
        Assert.Contains(json.EnumerateArray(), a =>
            a.GetProperty("actionType").GetString() == expectedType);
    }
}
