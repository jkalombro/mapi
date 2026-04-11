using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mapi.Infrastructure.Persistence.Configurations;

public class ActionConfiguration : IEntityTypeConfiguration<Domain.Entities.Action>
{
    private const int RESPONSE_TEMPLATE_MAX_LENGTH = 500;

    public void Configure(EntityTypeBuilder<Domain.Entities.Action> builder)
    {
        builder.HasKey(a => a.Id);

        builder.Property(a => a.ResponseTemplate)
            .IsRequired()
            .HasMaxLength(RESPONSE_TEMPLATE_MAX_LENGTH);

        builder.Property(a => a.ActionType)
            .IsRequired();

        builder.HasMany(a => a.TriggerActionMaps)
            .WithOne(tam => tam.Action)
            .HasForeignKey(tam => tam.ActionId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
