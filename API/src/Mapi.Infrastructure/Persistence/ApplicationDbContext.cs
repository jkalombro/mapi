using Mapi.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace Mapi.Infrastructure.Persistence;

public class ApplicationDbContext : DbContext
{
    private Guid _currentUserId;

    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Item> Items => Set<Item>();
    public DbSet<Trigger> Triggers => Set<Trigger>();
    public DbSet<Domain.Entities.Action> Actions => Set<Domain.Entities.Action>();

    public void SetCurrentUserId(Guid userId)
    {
        _currentUserId = userId;
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(ApplicationDbContext).Assembly);

        modelBuilder.Entity<Item>()
            .HasQueryFilter(i => i.UserId == _currentUserId);

        modelBuilder.Entity<Trigger>()
            .HasQueryFilter(t => t.UserId == _currentUserId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var now = DateTime.UtcNow;

        foreach (var entry in ChangeTracker.Entries<BaseEntity>())
        {
            switch (entry.State)
            {
                case EntityState.Added:
                    entry.Entity.CreatedAt = now;
                    entry.Entity.UpdatedAt = now;
                    break;
                case EntityState.Modified:
                    entry.Entity.UpdatedAt = now;
                    break;
            }
        }

        return base.SaveChangesAsync(cancellationToken);
    }
}
