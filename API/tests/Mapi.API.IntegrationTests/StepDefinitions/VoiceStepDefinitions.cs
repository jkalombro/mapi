using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class VoiceStepDefinitions
{
    private readonly TestContext _ctx;

    public VoiceStepDefinitions(TestContext ctx)
    {
        _ctx = ctx;
    }

    [Given(@"I have an item with name ""(.*)"" and bisaya name ""(.*)"" and price (.*)")]
    public async Task GivenIHaveAnItem(string name, string bisayaName, decimal price)
    {
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        await _ctx.Client.PostAsync("/api/v1/items", body);
    }

    [Given(@"I also have an item with name ""(.*)"" and bisaya name ""(.*)"" and price (.*)")]
    public async Task GivenIAlsoHaveAnItem(string name, string bisayaName, decimal price)
    {
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        await _ctx.Client.PostAsync("/api/v1/items", body);
    }

    [When(@"I send a voice command ""(.*)""")]
    public async Task WhenISendAVoiceCommand(string transcript)
    {
        var body = TestContext.JsonContent(new { transcript });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/voice/command", body);
    }

    [Given(@"I send a voice command ""(.*)"" to start a pending flow")]
    public async Task GivenISendAVoiceCommandToStartPendingFlow(string transcript)
    {
        var body = TestContext.JsonContent(new { transcript });
        await _ctx.Client.PostAsync("/api/v1/voice/command", body);
    }

    [When(@"I send a voice command with pending intent ""(.*)"" and pending item ""(.*)"" and transcript ""(.*)""")]
    public async Task WhenISendAVoiceCommandWithPendingContext(string pendingIntent, string pendingItemName, string transcript)
    {
        var body = TestContext.JsonContent(new { transcript, pendingIntent, pendingItemName });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/voice/command", body);
    }

    [Then(@"the voice response should contain ""(.*)""")]
    public async Task ThenTheVoiceResponseShouldContain(string expected)
    {
        var json = await _ctx.GetResponseJson();
        var responseText = json.GetProperty("responseText").GetString();
        Assert.Contains(expected, responseText, StringComparison.OrdinalIgnoreCase);
    }

    [Then(@"the voice result should be ambiguous")]
    public async Task ThenTheVoiceResultShouldBeAmbiguous()
    {
        var json = await _ctx.GetResponseJson();
        Assert.True(json.GetProperty("isAmbiguous").GetBoolean());
    }

    [Then(@"the voice result should require confirmation")]
    public async Task ThenTheVoiceResultShouldRequireConfirmation()
    {
        var json = await _ctx.GetResponseJson();
        Assert.True(json.GetProperty("isConfirmationRequired").GetBoolean());
    }

    [Then(@"the voice result should have pending intent ""(.*)""")]
    public async Task ThenTheVoiceResultShouldHavePendingIntent(string expectedIntent)
    {
        var json = await _ctx.GetResponseJson();
        var pendingIntent = json.GetProperty("pendingIntent").GetString();
        Assert.Equal(expectedIntent, pendingIntent, StringComparer.OrdinalIgnoreCase);
    }

    [Then(@"the voice result should have items modified")]
    public async Task ThenTheVoiceResultShouldHaveItemsModified()
    {
        var json = await _ctx.GetResponseJson();
        Assert.True(json.GetProperty("itemsModified").GetBoolean());
    }
}
