namespace Clipper.Api.Configuration
{
    public static class CorsConfig
    {
        public static IServiceCollection AddCustomCors(this IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowAll",
                    policy =>
                    {
                        policy.AllowAnyOrigin()
                            .AllowAnyMethod()
                            .AllowAnyHeader();
                    });
                options.AddPolicy("DevCors",
                    corsBuilder =>
                    {
                        corsBuilder.WithOrigins("http://localhost:5000", "https://localhost:7220") // <- Clipper.Web
                            .AllowAnyMethod()
                            .AllowAnyHeader()
                            .AllowCredentials();
                    });
                options.AddPolicy("AllowReactApp",
                    policy =>
                    {
                        policy.WithOrigins("http://localhost:5173") // <- React app
                            .AllowAnyHeader()
                            .AllowAnyMethod();
                    });
            });            

            return services;
        }
    }
}