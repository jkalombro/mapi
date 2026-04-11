using Mapi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mapi.Infrastructure.Persistence.Configurations;

public class TriggerActionMapConfiguration : IEntityTypeConfiguration<TriggerActionMap>
{
    public void Configure(EntityTypeBuilder<TriggerActionMap> builder)
    {
        builder.HasKey(tam => tam.Id);

        builder.HasIndex(tam => new { tam.TriggerId, tam.ActionId })
            .IsUnique();

        builder.Property(tam => tam.SortOrder)
            .IsRequired();
    }
}
