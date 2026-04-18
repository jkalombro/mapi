using System.Text.RegularExpressions;
using Mapi.Application.Common.Interfaces;
using Mapi.Application.Voice.DTOs;
using Mapi.Domain.Enums;
using Mapi.Domain.Interfaces;

namespace Mapi.Infrastructure.Services;

public partial class CommandService : ICommandService
{
    private const string PRICE_QUERY_PATTERN = @"^how much is (?<name>.+?)\??$";
    private const string PENDING_INTENT_ADD = "Add";
    private const string PENDING_INTENT_UPDATE = "Update";
    private const string PENDING_INTENT_CONFIRM_UPDATE = "ConfirmUpdate";
    private const string RESPONSE_ITEM_NOT_FOUND = "I couldn't find that item.";
    private const string RESPONSE_DIDNT_CATCH = "Didn't catch that. Please try again.";
    private const string RESPONSE_MALFORMED_COMMAND = "I didn't understand that command. Please try again.";
    private const string RESPONSE_INVALID_PRICE = "That doesn't look like a valid price. Please say a number.";
    private const string RESPONSE_AMBIGUOUS = "I found multiple matches: {names}. Which one did you mean?";
    private const string RESPONSE_UPDATE_CANCELLED = "Okay, update cancelled.";
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
        string? pendingIntent = null,
        string? pendingItemName = null,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(transcript))
        {
            return new VoiceCommandResult(RESPONSE_DIDNT_CATCH);
        }

        var normalizedTranscript = transcript.Trim().ToLowerInvariant();

        if (pendingIntent == PENDING_INTENT_ADD && pendingItemName is not null)
        {
            return await HandlePendingAddAsync(normalizedTranscript, pendingItemName, userId, cancellationToken);
        }

        if (pendingIntent == PENDING_INTENT_UPDATE && pendingItemName is not null)
        {
            return await HandlePendingUpdateAsync(normalizedTranscript, pendingItemName, userId, cancellationToken);
        }

        if (pendingIntent == PENDING_INTENT_CONFIRM_UPDATE && pendingItemName is not null)
        {
            return HandleConfirmUpdate(normalizedTranscript, pendingItemName);
        }

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

        return new VoiceCommandResult(RESPONSE_MALFORMED_COMMAND);
    }

    private async Task<VoiceCommandResult> HandlePendingAddAsync(
        string transcript,
        string itemName,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!TryParsePrice(transcript, out var price))
        {
            return new VoiceCommandResult(
                RESPONSE_INVALID_PRICE,
                PendingIntent: PENDING_INTENT_ADD,
                PendingItemName: itemName);
        }

        var newItem = new Domain.Entities.Item
        {
            UserId = userId,
            ItemName = itemName,
            BisayaName = itemName,
            Price = price,
        };

        await _itemRepository.AddAsync(newItem, cancellationToken);
        var priceFormatted = FormatPrice(price);
        return new VoiceCommandResult(
            $"Got it. {itemName} has been added at {priceFormatted}.",
            ItemsModified: true);
    }

    private async Task<VoiceCommandResult> HandlePendingUpdateAsync(
        string transcript,
        string itemName,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (!TryParsePrice(transcript, out var price))
        {
            return new VoiceCommandResult(
                RESPONSE_INVALID_PRICE,
                PendingIntent: PENDING_INTENT_UPDATE,
                PendingItemName: itemName);
        }

        var matches = await _itemRepository.FindByNameAsync(itemName, userId, cancellationToken);
        var existing = matches.FirstOrDefault();

        if (existing is null)
        {
            return new VoiceCommandResult(RESPONSE_ITEM_NOT_FOUND);
        }

        existing.Price = price;
        await _itemRepository.UpdateAsync(existing, cancellationToken);
        var priceFormatted = FormatPrice(price);
        return new VoiceCommandResult(
            $"Done. {existing.ItemName} is now {priceFormatted}.",
            ItemsModified: true);
    }

    private static VoiceCommandResult HandleConfirmUpdate(string transcript, string itemName)
    {
        if (transcript is "yes" or "y")
        {
            return new VoiceCommandResult(
                $"What is the new price of {itemName}?",
                PendingIntent: PENDING_INTENT_UPDATE,
                PendingItemName: itemName);
        }

        return new VoiceCommandResult(RESPONSE_UPDATE_CANCELLED);
    }

    private async Task<VoiceCommandResult?> TryMatchTriggerAsync(
        string transcript,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var triggers = await _triggerRepository.GetAllByUserAsync(userId, cancellationToken);

        var matchedTrigger = triggers
            .Where(t => transcript.StartsWith(t.Phrase.ToLowerInvariant(), StringComparison.OrdinalIgnoreCase))
            .OrderByDescending(t => t.Phrase.Length)
            .FirstOrDefault();

        if (matchedTrigger is null)
        {
            return null;
        }

        var suffix = transcript[matchedTrigger.Phrase.Length..].Trim();
        return await ExecuteActionAsync(matchedTrigger.Action, suffix, userId, cancellationToken);
    }

    private async Task<VoiceCommandResult> ExecuteActionAsync(
        Domain.Entities.Action action,
        string suffix,
        Guid userId,
        CancellationToken cancellationToken)
    {
        if (action.ActionType == ActionType.Add)
        {
            return await HandleAddTriggerAsync(suffix, userId, cancellationToken);
        }

        if (action.ActionType == ActionType.Update)
        {
            return await HandleUpdateTriggerAsync(suffix, userId, cancellationToken);
        }

        var items = await _itemRepository.FindByNameAsync(suffix, userId, cancellationToken);
        if (items.Count == 0)
        {
            return new VoiceCommandResult(RESPONSE_ITEM_NOT_FOUND);
        }

        var item = items[0];
        var responseText = action.ResponseTemplate
            .Replace("{item}", item.ItemName)
            .Replace("{value}", FormatPrice(item.Price));

        if (action.ActionType == ActionType.Remove)
        {
            await _itemRepository.DeleteAsync(item, cancellationToken);
            return new VoiceCommandResult(responseText, ItemsModified: true);
        }

        return new VoiceCommandResult(responseText);
    }

    private async Task<VoiceCommandResult> HandleAddTriggerAsync(
        string itemName,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var existing = await _itemRepository.FindByNameAsync(itemName, userId, cancellationToken);

        if (existing.Count > 0)
        {
            return new VoiceCommandResult(
                $"{existing[0].ItemName} already exists. Do you want to update it?",
                IsConfirmationRequired: true,
                PendingIntent: PENDING_INTENT_CONFIRM_UPDATE,
                PendingItemName: existing[0].ItemName);
        }

        return new VoiceCommandResult(
            $"What is the price of {itemName}?",
            PendingIntent: PENDING_INTENT_ADD,
            PendingItemName: itemName);
    }

    private async Task<VoiceCommandResult> HandleUpdateTriggerAsync(
        string itemName,
        Guid userId,
        CancellationToken cancellationToken)
    {
        var existing = await _itemRepository.FindByNameAsync(itemName, userId, cancellationToken);

        if (existing.Count == 0)
        {
            return new VoiceCommandResult(RESPONSE_ITEM_NOT_FOUND);
        }

        return new VoiceCommandResult(
            $"What is the new price of {existing[0].ItemName}?",
            PendingIntent: PENDING_INTENT_UPDATE,
            PendingItemName: existing[0].ItemName);
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

    private static bool TryParsePrice(string transcript, out decimal price)
    {
        return decimal.TryParse(transcript, out price) && price >= 0;
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
}
