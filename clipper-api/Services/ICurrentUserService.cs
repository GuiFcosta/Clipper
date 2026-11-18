using System.Security.Claims;
using Clipper.Api.Constants;

namespace Clipper.Api.Services;

public interface ICurrentUserService
{
    string? GetUserId();
    string? GetRole();
    int? GetBarberShopId();
    int? GetBarberId();
    int? GetCustomerId();
    bool IsAdmin();
    bool IsInRole(string role);
}

public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    private ClaimsPrincipal? User => httpContextAccessor.HttpContext?.User;

    public string? GetUserId() =>
        User?.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? GetRole() =>
        User?.FindFirstValue(ClaimTypes.Role);

    public int? GetBarberShopId() =>
        TryGetIntClaim("BarberShopId");

    public int? GetBarberId() =>
        TryGetIntClaim("BarberId");

    public int? GetCustomerId() =>
        TryGetIntClaim("CustomerId");

    public bool IsAdmin() =>
        User?.IsInRole(UserRoles.Admin) == true;

    public bool IsInRole(string role) =>
        User?.IsInRole(role) == true;

    private int? TryGetIntClaim(string claimType)
    {
        var claim = User?.FindFirst(claimType);
        return claim != null && int.TryParse(claim.Value, out var id) ? id : null;
    }
}
