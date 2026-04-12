using Mapi.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mapi.Infrastructure.Persistence.Configurations;

public class ActionConfiguration : IEntityTypeConfiguration<Domain.Entities.Action>
{
    private const int RESPONSE_TEMPLATE_MAX_LENGTH = 500;

    private static readonly DateTime SEED_DATE = new(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

    private static readonly Guid QUERY_ACTION_ID = new("00000000-0000-0000-0000-000000000001");
    private static readonly Guid ADD_ACTION_ID = new("00000000-0000-0000-0000-000000000002");
    private static readonly Guid UPDATE_ACTION_ID = new("00000000-0000-0000-0000-000000000003");
    private static readonly Guid REMOVE_ACTION_ID = new("00000000-0000-0000-0000-000000000004");

    public void Configure(EntityTypeBuilder<Domain.Entities.Action> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ResponseTemplate)
            .IsRequired()
            .HasMaxLength(RESPONSE_TEMPLATE_MAX_LENGTH);

        builder.Property(a => a.ActionType)
            .IsRequired();

        builder.HasData(
            new Domain.Entities.Action
            {
                Id = QUERY_ACTION_ID,
                ActionType = ActionType.Query,
                ResponseTemplate = "The {item} is {value}.",
                CreatedAt = SEED_DATE,
                UpdatedAt = SEED_DATE
            },
            new Domain.Entities.Action
            {
                Id = ADD_ACTION_ID,
                ActionType = ActionType.Add,
                ResponseTemplate = "I've added {item}.",
                CreatedAt = SEED_DATE,
                UpdatedAt = SEED_DATE
            },
            new Domain.Entities.Action
            {
                Id = UPDATE_ACTION_ID,
                ActionType = ActionType.Update,
                ResponseTemplate = "I've updated {item} to {value}.",
                CreatedAt = SEED_DATE,
                UpdatedAt = SEED_DATE
            },
            new Domain.Entities.Action
            {
                Id = REMOVE_ACTION_ID,
                ActionType = ActionType.Remove,
                ResponseTemplate = "I've removed {item}.",
                CreatedAt = SEED_DATE,
                UpdatedAt = SEED_DATE
            }
        );
    }
}
