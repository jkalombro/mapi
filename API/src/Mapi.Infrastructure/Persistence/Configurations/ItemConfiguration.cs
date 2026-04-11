using Mapi.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Mapi.Infrastructure.Persistence.Configurations;

public class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.HasKey(i => i.Id);

        builder.Property(i => i.ItemName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.BisayaName)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(i => i.Price)
            .IsRequired()
            .HasPrecision(18, 2);

        builder.HasIndex(i => new { i.UserId, i.ItemName });
        builder.HasIndex(i => new { i.UserId, i.BisayaName });
    }
}
