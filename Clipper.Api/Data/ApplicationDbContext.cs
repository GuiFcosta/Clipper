using Clipper.Api.Models.Entities;
using Clipper.Api.Services;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Data;

public class ApplicationDbContext(
    DbContextOptions<ApplicationDbContext> options,
    ICurrentUserService? currentUserService = null
)
    : IdentityDbContext<ApplicationUser>(options)
{
    public int? CurrentBarberShopId => currentUserService?.GetBarberShopId();

    public DbSet<BarberShop> BarberShops { get; set; }
    public DbSet<Barber> Barbers { get; set; }
    public DbSet<Customer> Clients { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<BarberSchedule> BarberSchedules { get; set; }
    public DbSet<TimeBlock> TimeBlocks { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<Review> Reviews { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        // Multi-tenant global query filters for BarberShop-scoped users (BarberShopOwner / Barber).
        // Customers, Admins, and anonymous visitors have CurrentBarberShopId == null, allowing catalog discovery.
        builder.Entity<Barber>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.BarberShopId == CurrentBarberShopId.Value);

        builder.Entity<BarberSchedule>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.Barber.BarberShopId == CurrentBarberShopId.Value);

        builder.Entity<TimeBlock>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.Barber.BarberShopId == CurrentBarberShopId.Value);

        builder.Entity<Service>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.BarberShopId == CurrentBarberShopId.Value);

        builder.Entity<Appointment>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.BarberShopId == CurrentBarberShopId.Value);

        builder.Entity<Review>()
            .HasQueryFilter(x => !CurrentBarberShopId.HasValue || x.BarberShopId == CurrentBarberShopId.Value);

        // Configuration for BarberShop entity
        builder.Entity<BarberShop>(entity =>
        {
            entity.HasMany(bs => bs.Barbers)
                .WithOne(b => b.BarberShop)
                .HasForeignKey(b => b.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber shop if it has barbers

            entity.HasMany(bs => bs.Services)
                .WithOne(s => s.BarberShop)
                .HasForeignKey(s => s.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber shop if it has services
        });

        // Configuration for Barber entity
        builder.Entity<Barber>(entity =>
        {
            // Relation with BarberShop
            entity.HasOne(b => b.BarberShop)
                .WithMany(a => a.Barbers)
                .HasForeignKey(a => a.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber if they have appointments

            // Relation with Appointments
            entity.HasMany(b => b.Appointments)
                .WithOne(b => b.Barber)
                .HasForeignKey(a => a.BarberId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber if they have appointments

            // Relation with TimeBlocks
            entity.HasMany(b => b.TimeBlocks)
                .WithOne(tb => tb.Barber)
                .HasForeignKey(tb => tb.BarberId)
                .OnDelete(DeleteBehavior.Cascade); // Delete time blocks if barber is deleted

            // Relation with BarberSchedule
            entity.HasMany(b => b.BarberSchedule)
                .WithOne(bs => bs.Barber)
                .HasForeignKey(bs => bs.BarberId);
        });

        // Configuration for BarberSchedule entity
        builder.Entity<BarberSchedule>(entity =>
        {
            entity.HasOne(bs => bs.Barber)
                .WithMany(b => b.BarberSchedule)
                .HasForeignKey(bs => bs.BarberId)
                .OnDelete(DeleteBehavior.Cascade); // Delete schedule if barber is deleted
        });

        // Configuration for Appointment entity
        builder.Entity<Appointment>(entity =>
        {
            // Relation with Barber
            entity.HasOne(b => b.Barber)
                .WithMany(a => a.Appointments)
                .HasForeignKey(a => a.BarberId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber if they have appointments

            // Relation with Customer
            entity.HasOne(a => a.Customer)
                .WithMany(c => c.Appointments)
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a customer if they have appointments

            // Relation with BarberShop
            entity.HasOne(a => a.BarberShop)
                .WithMany()
                .HasForeignKey(a => a.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber shop if it has appointments

            // Relation with Service
            entity.HasOne(a => a.Service)
                .WithMany()
                .HasForeignKey(a => a.ServiceId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a service if it is linked to appointments
        });

        // Configuration for Customer entity
        builder.Entity<Customer>(entity =>
        {
            entity.HasMany(c => c.Appointments)
                .WithOne(a => a.Customer)
                .HasForeignKey(a => a.CustomerId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a customer if they have appointments
        });

        // Configuration for RefreshToken entity
        builder.Entity<RefreshToken>(entity =>
        {
            entity.HasIndex(rt => rt.Token).IsUnique();
            entity.HasOne(rt => rt.ApplicationUser)
                .WithMany()
                .HasForeignKey(rt => rt.ApplicationUserId)
                .OnDelete(DeleteBehavior.Cascade);
        });

        // Configuration for Review entity
        builder.Entity<Review>(entity =>
        {
            entity.HasIndex(r => r.AppointmentId).IsUnique();

            entity.HasOne(r => r.Appointment)
                .WithMany()
                .HasForeignKey(r => r.AppointmentId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Customer)
                .WithMany()
                .HasForeignKey(r => r.CustomerId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.Barber)
                .WithMany(b => b.Reviews)
                .HasForeignKey(r => r.BarberId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(r => r.BarberShop)
                .WithMany(bs => bs.Reviews)
                .HasForeignKey(r => r.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}