namespace Clipper.Api.Services;

public interface ICurrentUserService
{
    int? GetBarberShopId();
}
public class CurrentUserService(IHttpContextAccessor httpContextAccessor) : ICurrentUserService
{
    public int? GetBarberShopId()
    {
        var userClaims = httpContextAccessor.HttpContext?.User.FindFirst("BarberShopId");
        if (userClaims != null && int.TryParse(userClaims.Value, out var barberShopId))
            return barberShopId;

        return null;
    }
}