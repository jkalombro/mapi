using Mapi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mapi.Infrastructure.Persistence.Configurations;

public class TriggerConfiguration : IEntityTypeConfiguration<Trigger>
{
    private const int PHRASE_MAX_LENGTH = 200;

    public void Configure(EntityTypeBuilder<Trigger> builder)
    {
        builder.HasKey(t => t.Id);

        builder.Property(t => t.Phrase)
            .IsRequired()
            .HasMaxLength(PHRASE_MAX_LENGTH);

        builder.HasMany(t => t.TriggerActionMaps)
            .WithOne(tam => tam.Trigger)
            .HasForeignKey(tam => tam.TriggerId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
