using System.Text.RegularExpressions;
using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.DTOs;
using Mapi.Domain.Interfaces;

namespace Mapi.Infrastructure.Services;

public partial class CommandService : ICommandService
{
    private const string PRICE_QUERY_PATTERN = @"^how much is (?<name>.+?)\??$";
    private const string ADD_ITEM_PATTERN = @"^add (?<name>.+) price (?<price>\d+(\.\d+)?)$";
    private const string RESPONSE_ITEM_NOT_FOUND = "I couldn't find that item.";
    private const string RESPONSE_DIDNT_CATCH = "Didn't catch that. Please try again.";
    private const string RESPONSE_MALFORMED_COMMAND = "I didn't understand that command. Please try again.";
    private const string RESPONSE_ITEM_ADDED = "Got it. {name} has been added at {price} pesos.";
    private const string RESPONSE_AMBIGUOUS = "I found multiple matches: {names}. Which one did you mean?";
    private const string RESPONSE_CONFIRM_ADD = "An item called {name} already exists. Do you want to update it?";
    private const string PRICE_FORMAT = "{0} pesos";
    private const int DECIMAL_PLACES = 2;

    private readonly IItemRepository _itemRepository;
    private readonly ITriggerRepository _triggerRepository;

    public CommandService(IItemRepository itemRepository, ITriggerRepository triggerRepository)
    {
        _itemRepository = itemRepository;
        _triggerRepository = triggerRepository;
    }

    public async Task<VoiceCommandResult> ExecuteAsync(
        string transcript,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(transcript))
        {
            return new VoiceCommandResult(RESPONSE_DIDNT_CATCH);
        }

        var normalizedTranscript = transcript.Trim().ToLowerInvariant();

        var triggerResult = await TryMatchTriggerAsync(normalizedTranscript, userId, cancellationToken);
        if (triggerResult is not null)
        {
            return triggerResult;
        }

        var priceQueryMatch = PriceQueryRegex().Match(normalizedTranscript);
        if (priceQueryMatch.Success)
        {
            return await HandlePriceQueryAsync(priceQueryMatch.Groups["name"].Value, userId, cancellationToken);
        }

        var addMatch = AddItemRegex().Match(normalizedTranscript);
        if (addMatch.Success)
        {
            var name = addMatch.Groups["name"].Value.Trim();
            var price = decimal.Parse(addMatch.Groups["price"].Value);
            return await HandleAddItemAsync(name, price, userId, cancellationToken);
        }

        return new VoiceCommandResult(RESPONSE_MALFORMED_COMMAND);
    }

    public async Task<VoiceCommandResult> ConfirmAddAsync(
        string itemName,
        decimal price,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        var matches = await _itemRepository.FindByNameAsync(itemName, userId, cancellationToken);
        var existing = matches.FirstOrDefault();

        if (existing is null)
        {
            return new VoiceCommandResult(RESPONSE_ITEM_NOT_FOUND);
        }

        existing.Price = price;
        await _itemRepository.UpdateAsync(existing, cancellationToken);

        var priceFormatted = FormatPrice(price);
        return new VoiceCommandResult($"Done. {existing.ItemName} is now {priceFormatted}.");
    }

    private async Task<VoiceCommandResult?> TryMatchTriggerAsync(
        string transcript,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var triggers = await _triggerRepository.GetAllWithActionsAsync(userId, cancellationToken);

        var matchedTrigger = triggers
            .Where(t => transcript.StartsWith(t.Phrase.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Phrase.Length)
            .FirstOrDefault();

        if (matchedTrigger is null)
        {
            return null;
        }

        var suffix = transcript[matchedTrigger.Phrase.Length..].Trim();
        var responseText = string.Empty;

        foreach (var action in matchedTrigger.TriggerActionMaps
            .OrderBy(m => m.SortOrder)
            .ThenBy(m => m.CreatedAt)
            .Select(m => m.Action))
        {
            responseText = await ExecuteActionAsync(action, suffix, userId, cancellationToken);
        }

        return new VoiceCommandResult(responseText);
    }

    private async Task<string> ExecuteActionAsync(
        Domain.Entities.Action action,
        string suffix,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var items = await _itemRepository.FindByNameAsync(suffix, userId, cancellationToken);
        if (items.Count == 0)
        {
            return RESPONSE_ITEM_NOT_FOUND;
        }

        var item = items[0];
        return action.ResponseTemplate
            .Replace("{name}", item.ItemName)
            .Replace("{price}", FormatPrice(item.Price));
    }

    private async Task<VoiceCommandResult> HandlePriceQueryAsync(
        string name,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var matches = await _itemRepository.FindByNameAsync(name, userId, cancellationToken);

        if (matches.Count == 0)
        {
            return new VoiceCommandResult(RESPONSE_ITEM_NOT_FOUND);
        }

        if (matches.Count > 1)
        {
            var names = matches.Select(i => i.ItemName).ToList();
            var responseText = RESPONSE_AMBIGUOUS.Replace("{names}", string.Join(", ", names));
            return new VoiceCommandResult(responseText, IsAmbiguous: true, MatchedNames: names);
        }

        var item = matches[0];
        var price = FormatPrice(item.Price);
        return new VoiceCommandResult($"{item.ItemName} costs {price}.");
    }

    private async Task<VoiceCommandResult> HandleAddItemAsync(
        string name,
        decimal price,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var existing = await _itemRepository.FindByNameAsync(name, userId, cancellationToken);
        if (existing.Count > 0)
        {
            var responseText = RESPONSE_CONFIRM_ADD.Replace("{name}", existing[0].ItemName);
            return new VoiceCommandResult(responseText, IsConfirmationRequired: true);
        }

        var newItem = new Domain.Entities.Item
        {
            UserId = userId,
            ItemName = name,
            BisayaName = name,
            Price = price
        };

        await _itemRepository.AddAsync(newItem, cancellationToken);
        var priceFormatted = FormatPrice(price);
        var added = RESPONSE_ITEM_ADDED
            .Replace("{name}", name)
            .Replace("{price}", priceFormatted);
        return new VoiceCommandResult(added);
    }

    private static string FormatPrice(decimal price)
    {
        var formatted = price == Math.Floor(price)
            ? ((int)price).ToString()
            : price.ToString($"F{DECIMAL_PLACES}");
        return string.Format(PRICE_FORMAT, formatted);
    }

    [GeneratedRegex(PRICE_QUERY_PATTERN, RegexOptions.IgnoreCase)]
    private static partial Regex PriceQueryRegex();

    [GeneratedRegex(ADD_ITEM_PATTERN, RegexOptions.IgnoreCase)]
    private static partial Regex AddItemRegex();
}
