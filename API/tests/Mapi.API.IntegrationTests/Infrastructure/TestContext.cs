using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;

namespace Mapi.API.IntegrationTests.Infrastructure;

public class TestContext
{
    private static readonly MapiWebApplicationFactory Factory = new();
    private string? _authToken;
    private Guid _lastCreatedId;

    public HttpClient Client { get; } = Factory.CreateClient();
    public HttpResponseMessage? LastResponse { get; set; }
    public Guid LastCreatedId => _lastCreatedId;

    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public void SetAuthToken(string token)
    {
        _authToken = token;
        Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
    }

    public void ClearAuthToken()
    {
        _authToken = null;
        Client.DefaultRequestHeaders.Authorization = null;
    }

    public async Task AuthenticateAsync(string email, string password, string storeName)
    {
        var registerBody = JsonContent(new { email, password, storeName });
        await Client.PostAsync("/api/v1/auth/register", registerBody);

        var loginBody = JsonContent(new { email, password });
        var loginResponse = await Client.PostAsync("/api/v1/auth/login", loginBody);
        var loginContent = await loginResponse.Content.ReadAsStringAsync();
        var tokenData = JsonSerializer.Deserialize<JsonElement>(loginContent);
        var token = tokenData.GetProperty("accessToken").GetString()!;
        SetAuthToken(token);
    }

    public static StringContent JsonContent(object obj)
    {
        return new StringContent(
            JsonSerializer.Serialize(obj),
            Encoding.UTF8,
            "application/json");
    }

    public async Task<T?> DeserializeResponse<T>()
    {
        if (LastResponse is null) return default;
        var content = await LastResponse.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<T>(content, JsonOptions);
    }

    public async Task<JsonElement> GetResponseJson()
    {
        var content = await LastResponse!.Content.ReadAsStringAsync();
        return JsonSerializer.Deserialize<JsonElement>(content, JsonOptions);
    }

    public void SetLastCreatedId(Guid id) => _lastCreatedId = id;

    public async Task ResetAsync() => await Factory.ResetDatabaseAsync();
}
