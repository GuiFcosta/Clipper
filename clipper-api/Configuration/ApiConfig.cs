using Clipper.Api.Common;

namespace Clipper.Api.Configuration
{
    public static class ApiConfig
    {
        public static IServiceCollection AddApiServices(this IServiceCollection services)
        {
            services.AddControllers();
            services.AddProblemDetails();
            services.AddExceptionHandler<GlobalExceptionHandler>();

            return services;
        }

        public static WebApplication UseApiPipeline(this WebApplication app)
        {
            app.UseDocumentation();

            app.UseExceptionHandler();
            app.UseCors("AllowReactApp");

            app.UseHttpsRedirection();

            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();

            return app;
        }
    }
}
