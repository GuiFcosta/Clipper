using Clipper.Api.Constants;
using Clipper.Api.Models.Entities;
using Clipper.Api.Models.Enums;
using Microsoft.AspNetCore.Identity;

namespace Clipper.Api.Data;

public class DbSeeder
{
    public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
    {
        var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = serviceProvider.GetRequiredService<UserManager<ApplicationUser>>();

        string[] roleNames = { UserRoles.Admin, UserRoles.BarberShopOwner, UserRoles.Barber, UserRoles.Customer };

        foreach (var roleName in roleNames)
        {
            var roleExist = await roleManager.RoleExistsAsync(roleName);
            if (!roleExist)
            {
                await roleManager.CreateAsync(new IdentityRole(roleName));
            }
        }

        // Create Admin user
        const string adminEmail = "admin@clipper.com";
        var adminUser = await userManager.FindByEmailAsync(adminEmail);

        if (adminUser == null)
        {
            var newAdmin = new ApplicationUser
            {
                UserName = adminEmail,
                Email = adminEmail,
                FullName = "System Administrator",
                StateAccount = StateAccount.Active,
                EmailConfirmed = true,
            };

            // Create the admin user with a default password
            var createAdmin = await userManager.CreateAsync(newAdmin, "Admin@123");

            if (createAdmin.Succeeded)
            {
                // Assign Admin role to the user
                await userManager.AddToRoleAsync(newAdmin, UserRoles.Admin);
            }
        }
    }
}