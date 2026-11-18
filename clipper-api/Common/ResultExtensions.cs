using Microsoft.AspNetCore.Mvc;

namespace Clipper.Api.Common;

public static class ResultExtensions
{
    public static ActionResult ToProblemDetails(this Result result, ControllerBase controller)
    {
        if (result.IsSuccess)
            throw new InvalidOperationException("Cannot convert a successful result to ProblemDetails.");

        var (statusCode, title) = result.Error.Type switch
        {
            ErrorType.Validation => (StatusCodes.Status400BadRequest, "Validation Error"),
            ErrorType.Unauthorized => (StatusCodes.Status401Unauthorized, "Unauthorized"),
            ErrorType.Forbidden => (StatusCodes.Status403Forbidden, "Forbidden"),
            ErrorType.NotFound => (StatusCodes.Status404NotFound, "Resource Not Found"),
            ErrorType.Conflict => (StatusCodes.Status409Conflict, "Conflict"),
            _ => (StatusCodes.Status500InternalServerError, "Server Error")
        };

        var problemDetails = new ProblemDetails
        {
            Status = statusCode,
            Title = title,
            Detail = result.Error.Description,
            Instance = controller.HttpContext?.Request.Path
        };
        problemDetails.Extensions["errorCode"] = result.Error.Code;

        return new ObjectResult(problemDetails)
        {
            StatusCode = statusCode
        };
    }
}
