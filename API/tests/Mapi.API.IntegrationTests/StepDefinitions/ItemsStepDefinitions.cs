using System.Text.Json;
using Mapi.API.IntegrationTests.Infrastructure;
using Reqnroll;

namespace Mapi.API.IntegrationTests.StepDefinitions;

[Binding]
public class ItemsStepDefinitions
{
    private readonly TestContext _ctx;
    private readonly ScenarioContext _scenarioContext;

    public ItemsStepDefinitions(TestContext ctx, ScenarioContext scenarioContext)
    {
        _ctx = ctx;
        _scenarioContext = scenarioContext;
    }

    [Given(@"I have created an item with name ""(.*)"" and bisaya name ""(.*)"" and price (.*)")]
    public async Task GivenIHaveCreatedAnItem(string name, string bisayaName, decimal price)
    {
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        var response = await _ctx.Client.PostAsync("/api/v1/items", body);
        var json = JsonSerializer.Deserialize<JsonElement>(
            await response.Content.ReadAsStringAsync(),
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
        _scenarioContext["lastItemId"] = json.GetProperty("id").GetGuid();
    }

    [Given(@"user2 has created an item with name ""(.*)"" and bisaya name ""(.*)"" and price (.*)")]
    public async Task GivenUser2HasCreatedAnItem(string name, string bisayaName, decimal price)
    {
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        await _ctx.Client.PostAsync("/api/v1/items", body);
    }

    [When(@"I create an item with name ""(.*)"", bisaya name ""(.*)"", and price (.*)")]
    public async Task WhenICreateAnItem(string name, string bisayaName, decimal price)
    {
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        _ctx.LastResponse = await _ctx.Client.PostAsync("/api/v1/items", body);
        if (_ctx.LastResponse.IsSuccessStatusCode)
        {
            var json = JsonSerializer.Deserialize<JsonElement>(
                await _ctx.LastResponse.Content.ReadAsStringAsync(),
                new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            _scenarioContext["lastItemId"] = json.GetProperty("id").GetGuid();
        }
    }

    [When(@"I update the item name to ""(.*)"" with bisaya name ""(.*)"" and price (.*)")]
    public async Task WhenIUpdateTheItem(string name, string bisayaName, decimal price)
    {
        var itemId = (Guid)_scenarioContext["lastItemId"];
        var body = TestContext.JsonContent(new { itemName = name, bisayaName, price });
        _ctx.LastResponse = await _ctx.Client.PutAsync($"/api/v1/items/{itemId}", body);
    }

    [When(@"I delete the item")]
    public async Task WhenIDeleteTheItem()
    {
        var itemId = (Guid)_scenarioContext["lastItemId"];
        _ctx.LastResponse = await _ctx.Client.DeleteAsync($"/api/v1/items/{itemId}");
    }

    [Then(@"the item response should contain name ""(.*)""")]
    public async Task ThenTheItemResponseShouldContainName(string expectedName)
    {
        var json = await _ctx.GetResponseJson();
        var itemName = json.GetProperty("itemName").GetString();
        Assert.Equal(expectedName, itemName);
    }

    [Then(@"the items list should contain ""(.*)""")]
    public async Task ThenTheItemsListShouldContain(string expectedName)
    {
        var json = await _ctx.GetResponseJson();
        var items = json.EnumerateArray();
        Assert.Contains(items, item =>
            item.GetProperty("itemName").GetString() == expectedName);
    }

    [Then(@"the items list should not contain ""(.*)""")]
    public async Task ThenTheItemsListShouldNotContain(string unexpectedName)
    {
        var json = await _ctx.GetResponseJson();
        var items = json.EnumerateArray().ToList();
        Assert.DoesNotContain(items, item =>
            item.GetProperty("itemName").GetString() == unexpectedName);
    }
}
