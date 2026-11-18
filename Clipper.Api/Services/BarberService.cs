using Clipper.Api.Common;
using Clipper.Api.Constants;
using Clipper.Api.Interfaces;
using Clipper.Api.Models.Dto.Barber;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace Clipper.Api.Services;

public interface IBarberService
{
    Task<Result<IEnumerable<BarberDto>>> GetAllAsync();
    Task<Result<IEnumerable<BarberDto>>> GetByBarberShopAsync(int barberShopId);
    Task<Result<BarberDto>> GetByIdAsync(int id);
    Task<Result<BarberDto>> CreateAsync(BarberCreateDto dto);
    Task<Result> UpdateAsync(int id, BarberDto dto);
    Task<Result> DeleteAsync(int id);
}

public class BarberService(
    IBarberRepository repository,
    IBarberShopRepository barberShopRepository,
    UserManager<ApplicationUser> userManager,
    RoleManager<IdentityRole> roleManager,
    ICurrentUserService currentUserService) : IBarberService
{
    public async Task<Result<IEnumerable<BarberDto>>> GetAllAsync()
    {
        var barbers = await repository.GetAllBarbers();
        return Result.Success(barbers.Select(ToDto));
    }

    public async Task<Result<IEnumerable<BarberDto>>> GetByBarberShopAsync(int barberShopId)
    {
        var barbers = await repository.GetAllBarbersFromBarberShop(barberShopId);
        return Result.Success(barbers.Select(ToDto));
    }

    public async Task<Result<BarberDto>> GetByIdAsync(int id)
    {
        var barber = await repository.GetBarberById(id);
        if (barber == null)
            return Result.Failure<BarberDto>(Error.NotFound("Barber.NotFound", $"Barber with ID {id} was not found."));

        return Result.Success(ToDto(barber));
    }

    public async Task<Result<BarberDto>> CreateAsync(BarberCreateDto dto)
    {
        var targetShopId = currentUserService.IsAdmin()
            ? dto.BarberShopId
            : currentUserService.GetBarberShopId();

        if (!targetShopId.HasValue)
            return Result.Failure<BarberDto>(Error.Validation("Barber.BarberShopRequired", "A valid BarberShopId is required to register a barber."));

        if (!currentUserService.IsAdmin() &&
            (!currentUserService.IsInRole(UserRoles.BarberShopOwner) || currentUserService.GetBarberShopId() != targetShopId.Value))
        {
            return Result.Failure<BarberDto>(Error.Forbidden("Barber.Forbidden", "Only the BarberShopOwner or Admin can register barbers for this shop."));
        }

        if (!await barberShopRepository.ExistsAsync(targetShopId.Value))
            return Result.Failure<BarberDto>(Error.NotFound("BarberShop.NotFound", $"BarberShop with ID {targetShopId.Value} does not exist."));

        var user = new ApplicationUser
        {
            FullName = dto.Name,
            UserName = dto.Email,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            BarberShopId = targetShopId.Value,
            StateAccount = StateAccount.Active
        };

        var identityResult = await userManager.CreateAsync(user, dto.Password);
        if (!identityResult.Succeeded)
        {
            var message = string.Join("; ", identityResult.Errors.Select(e => e.Description));
            return Result.Failure<BarberDto>(Error.Validation("Barber.IdentityCreationFailed", message));
        }

        if (!await roleManager.RoleExistsAsync(UserRoles.Barber))
            await roleManager.CreateAsync(new IdentityRole(UserRoles.Barber));

        await userManager.AddToRoleAsync(user, UserRoles.Barber);

        var newBarber = new Barber
        {
            ApplicationUserId = user.Id,
            Name = dto.Name,
            Email = dto.Email,
            PhoneNumber = dto.PhoneNumber,
            Nif = dto.Nif,
            Address = dto.Address,
            BarberShopId = targetShopId.Value
        };

        try
        {
            await repository.CreateBarber(newBarber);
            return Result.Success(ToDto(newBarber));
        }
        catch (Exception)
        {
            await userManager.DeleteAsync(user);
            throw;
        }
    }

    public async Task<Result> UpdateAsync(int id, BarberDto dto)
    {
        if (id != dto.Id)
            return Result.Failure(Error.Validation("Barber.IdMismatch", "Route ID does not match payload ID."));

        var barberToUpdate = await repository.GetBarberById(id);
        if (barberToUpdate == null)
            return Result.Failure(Error.NotFound("Barber.NotFound", $"Barber with ID {id} was not found."));

        var canEdit = currentUserService.IsAdmin() ||
                      (currentUserService.IsInRole(UserRoles.BarberShopOwner) && currentUserService.GetBarberShopId() == barberToUpdate.BarberShopId) ||
                      (currentUserService.IsInRole(UserRoles.Barber) && currentUserService.GetBarberId() == barberToUpdate.Id);

        if (!canEdit)
            return Result.Failure(Error.Forbidden("Barber.Forbidden", "You are not authorized to update this barber."));

        barberToUpdate.Name = dto.Name;
        barberToUpdate.Email = dto.Email;
        barberToUpdate.PhoneNumber = dto.PhoneNumber;
        barberToUpdate.Nif = dto.Nif;
        barberToUpdate.Address = dto.Address;

        if (currentUserService.IsAdmin() && dto.BarberShopId.HasValue)
            barberToUpdate.BarberShopId = dto.BarberShopId;

        await repository.UpdateBarber(barberToUpdate);
        return Result.Success();
    }

    public async Task<Result> DeleteAsync(int id)
    {
        var barber = await repository.GetBarberById(id);
        if (barber == null)
            return Result.Failure(Error.NotFound("Barber.NotFound", $"Barber with ID {id} was not found."));

        var canDelete = currentUserService.IsAdmin() ||
                        (currentUserService.IsInRole(UserRoles.BarberShopOwner) && currentUserService.GetBarberShopId() == barber.BarberShopId);

        if (!canDelete)
            return Result.Failure(Error.Forbidden("Barber.Forbidden", "Only the BarberShopOwner or Admin can delete a barber."));

        await repository.DeleteBarber(id);
        return Result.Success();
    }

    private static BarberDto ToDto(Barber barber)
    {
        var reviews = barber.Reviews;
        var count = reviews?.Count ?? 0;
        var avg = count > 0 ? Math.Round(reviews!.Average(r => (double)r.Rating), 2) : 0;

        return new BarberDto
        {
            Id = barber.Id,
            Name = barber.Name,
            Email = barber.Email,
            PhoneNumber = barber.PhoneNumber,
            Nif = barber.Nif,
            Address = barber.Address,
            BarberShopId = barber.BarberShopId,
            AverageRating = avg,
            TotalReviews = count
        };
    }
}
