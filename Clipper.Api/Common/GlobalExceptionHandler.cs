using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Common;

public sealed class GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext httpContext,
        Exception exception,
        CancellationToken cancellationToken)
    {
        logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);

        var (statusCode, title) = exception switch
        {
            ArgumentException or FormatException => (StatusCodes.Status400BadRequest, "Invalid Request Argument"),
            UnauthorizedAccessException => (StatusCodes.Status403Forbidden, "Forbidden"),
            KeyNotFoundException => (StatusCodes.Status404NotFound, "Resource Not Found"),
            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = statusCode == StatusCodes.Status500InternalServerError
                ? "An internal server error occurred. Please try again later."
                : exception.Message,
            Instance = httpContext.Request.Path
        };

        httpContext.Response.StatusCode = statusCode;
        await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);
        return true;
    }
}
