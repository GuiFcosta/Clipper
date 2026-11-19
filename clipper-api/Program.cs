using Clipper.Api.Configuration;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiServices()
    .AddDocumentation()
    .AddCustomCors()
    .AddDatabase(builder.Configuration)
    .AddInfrastructureServices()
    .AddCustomAuthentication(builder.Configuration);

var app = builder.Build();

app.UseApiPipeline();

app.Run();
