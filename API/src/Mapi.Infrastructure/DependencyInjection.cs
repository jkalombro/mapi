using Mapi.Application.Common.Interfaces;
using Mapi.Domain.Interfaces;
using Mapi.Infrastructure.Auth;
using Mapi.Infrastructure.Persistence;
using Mapi.Infrastructure.Persistence.Repositories;
using Mapi.Infrastructure.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Mapi.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration)
    {
        services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IItemRepository, ItemRepository>();
        services.AddScoped<ITriggerRepository, TriggerRepository>();
        services.AddScoped<IActionRepository, ActionRepository>();
        services.AddScoped<ITriggerActionMapRepository, TriggerActionMapRepository>();

        services.AddScoped<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<ITokenService, JwtTokenService>();
        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<ICommandService, CommandService>();

        services.AddHttpContextAccessor();

        return services;
    }
}
