using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Mapi.Infrastructure.Persistence;
using Microsoft.Extensions.DependencyInjection;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class AlexaStepDefinitions
{
    private readonly TestContext _ctx;

    public AlexaStepDefinitions(TestContext ctx)
    {
        _ctx = ctx;
    }

    [Given(@"a Mapi user linked to Alexa userId ""(.*)""")]
    public async Task GivenAMapiUserLinkedToAlexaUserId(string alexaUserId)
    {
        var email = $"alexa_{Guid.NewGuid():N}@example.com";
        var password = "Password123!";
        await _ctx.Client.PostAsync(
            "/api/v1/auth/register",
            TestContext.JsonContent(new { email, password, storeName = "Alexa Store" }));

        // Update the user with the Alexa user ID directly via DbContext
        using var factory = new MapiWebApplicationFactory();
        using var scope = factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        var user = db.Users.First(u => u.Email == email.ToLowerInvariant());
        user.AlexaUserId = alexaUserId;
        await db.SaveChangesAsync();
    }

    [When(@"I send an Alexa skill request with userId ""(.*)"" and intent ""(.*)"" and slot ""(.*)""")]
    public async Task WhenISendAnAlexaSkillRequest(string alexaUserId, string intentName, string slotValue)
    {
        var skillRequest = new
        {
            version = "1.0",
            session = new
            {
                user = new { userId = alexaUserId }
            },
            request = new
            {
                type = "IntentRequest",
                intent = new
                {
                    name = intentName,
                    slots = new Dictionary<string, object>
                    {
                        { "ItemName", new { name = "ItemName", value = slotValue } }
                    }
                }
            }
        };

        _ctx.LastResponse = await _ctx.Client.PostAsync(
            "/alexa/skill",
            TestContext.JsonContent(skillRequest));
    }

    [Then(@"the Alexa response should contain ""(.*)""")]
    public async Task ThenTheAlexaResponseShouldContain(string expectedText)
    {
        var content = await _ctx.LastResponse!.Content.ReadAsStringAsync();
        Assert.Contains(expectedText, content, StringComparison.OrdinalIgnoreCase);
    }
}
