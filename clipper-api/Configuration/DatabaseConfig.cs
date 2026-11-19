using Clipper.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Configuration
{
    public static class DatabaseConfig
    {
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString, b => b.MigrationsAssembly("Clipper.Api")));

            return services;
        }
    }
}
