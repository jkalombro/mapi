using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class CommonStepDefinitions
{
    private readonly TestContext _ctx;

    public CommonStepDefinitions(TestContext ctx)
    {
        _ctx = ctx;
    }

    [Given(@"I am authenticated as ""(.*)"" with password ""(.*)"" and store name ""(.*)""")]
    [When(@"I am authenticated as ""(.*)"" with password ""(.*)"" and store name ""(.*)""")]
    public async Task GivenIAmAuthenticated(string email, string password, string storeName)
    {
        await _ctx.AuthenticateAsync(email, password, storeName);
    }

    [Then(@"the response status should be (\d+)")]
    public void ThenResponseStatusShouldBe(int expectedStatus)
    {
        Assert.Equal(expectedStatus, (int)_ctx.LastResponse!.StatusCode);
    }

    [When(@"I request GET ""(.*)""")]
    public async Task WhenIRequestGet(string path)
    {
        _ctx.LastResponse = await _ctx.Client.GetAsync(path);
    }
}
