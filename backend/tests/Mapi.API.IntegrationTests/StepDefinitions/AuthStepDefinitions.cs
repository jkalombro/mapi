using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class AuthStepDefinitions
{
    private readonly TestContext _ctx;
    private readonly ScenarioContext _scenarioContext;

    public AuthStepDefinitions(TestContext ctx, ScenarioContext scenarioContext)
    {
        _ctx = ctx;
        _scenarioContext = scenarioContext;
    }

    [BeforeScenario]
    public async Task ResetDatabase()
    {
        await _ctx.ResetAsync();
    }

    [Given(@"I have valid registration details with email ""(.*)"" and password ""(.*)"" and store name ""(.*)""")]
    public void GivenIHaveValidRegistrationDetails(string email, string password, string storeName)
    {
        _scenarioContext["email"] = email;
        _scenarioContext["password"] = password;
        _scenarioContext["storeName"] = storeName;
    }

    [When(@"I send a POST request to ""(.*)""")]
    public async Task WhenISendAPostRequestTo(string path)
    {
        var email = _scenarioContext["email"].ToString()!;
        var password = _scenarioContext["password"].ToString()!;
        var storeName = _scenarioContext["storeName"].ToString()!;

        _ctx.LastResponse = await _ctx.Client.PostAsync(
            path,
            TestContext.JsonContent(new { email, password, storeName }));
    }

    [Given(@"a user already exists with email ""(.*)""")]
    public async Task GivenAUserAlreadyExistsWith(string email)
    {
        var body = TestContext.JsonContent(new { email, password = "Existing123!", storeName = "Existing Store" });
        await _ctx.Client.PostAsync("/api/v1/auth/register", body);
    }

    [When(@"I register with email ""(.*)"" and password ""(.*)"" and store name ""(.*)""")]
    public async Task WhenIRegisterWith(string email, string password, string storeName)
    {
        _ctx.LastResponse = await _ctx.Client.PostAsync(
            "/api/v1/auth/register",
            TestContext.JsonContent(new { email, password, storeName }));
    }

    [Given(@"a registered user with email ""(.*)"" and password ""(.*)"" and store name ""(.*)""")]
    public async Task GivenARegisteredUser(string email, string password, string storeName)
    {
        await _ctx.Client.PostAsync(
            "/api/v1/auth/register",
            TestContext.JsonContent(new { email, password, storeName }));
    }

    [When(@"I login with email ""(.*)"" and password ""(.*)""")]
    public async Task WhenILoginWith(string email, string password)
    {
        _ctx.LastResponse = await _ctx.Client.PostAsync(
            "/api/v1/auth/login",
            TestContext.JsonContent(new { email, password }));
    }

    [Then(@"the response should contain an access token")]
    public async Task ThenTheResponseShouldContainAnAccessToken()
    {
        var json = await _ctx.GetResponseJson();
        Assert.True(json.TryGetProperty("accessToken", out var token));
        Assert.False(string.IsNullOrEmpty(token.GetString()));
    }
}
