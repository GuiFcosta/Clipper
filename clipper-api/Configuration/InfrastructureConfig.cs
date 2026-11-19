using Clipper.Api.Interfaces;
using Clipper.Api.Repositories;
using Clipper.Api.Services;

namespace Clipper.Api.Configuration
{
    public static class InfrastructureConfig
    {
        public static IServiceCollection AddInfrastructureServices(this IServiceCollection services)
        {
            services.AddHttpContextAccessor();

            // Dependency Injection for Services
            services.AddScoped<ICurrentUserService, CurrentUserService>();
            services.AddScoped<IAuthService, AuthService>();
            services.AddScoped<IBarberShopService, BarberShopService>();
            services.AddScoped<IBarberService, BarberService>();
            services.AddScoped<IServiceCatalogService, ServiceCatalogService>();
            services.AddScoped<ICustomerService, CustomerService>();
            services.AddScoped<IScheduleService, ScheduleService>();
            services.AddScoped<ITimeBlockService, TimeBlockService>();
            services.AddScoped<IAvailabilityService, AvailabilityService>();
            services.AddScoped<AvailabilityService>();
            services.AddScoped<IAppointmentService, AppointmentService>();
            services.AddScoped<IReviewService, ReviewService>();

            // Dependency Injection for Repositories
            services.AddScoped<IBarberShopRepository, BarberShopRepository>();
            services.AddScoped<IBarberRepository, BarberRepository>();
            services.AddScoped<IAvailabilityServiceRepository, AvailabilityServiceRepository>();
            services.AddScoped<IAuthRepository, AuthRepository>();
            services.AddScoped<IServiceRepository, ServiceRepository>();
            services.AddScoped<ICustomerRepository, CustomerRepository>();
            services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            services.AddScoped<IScheduleRepository, ScheduleRepository>();
            services.AddScoped<ITimeBlockRepository, TimeBlockRepository>();
            services.AddScoped<IReviewRepository, ReviewRepository>();

            return services;
        }
    }
}