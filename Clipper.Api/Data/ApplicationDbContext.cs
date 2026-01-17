using Clipper.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Clipper.Api.Data;

public class ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
    : DbContext(options)
{
    public DbSet<BarberShop> BarberShops { get; set; }
    public DbSet<Barber> Barbers { get; set; }
    public DbSet<Customer> Clients { get; set; }
    public DbSet<Appointment> Appointments { get; set; }
    public DbSet<Service> Services { get; set; }
    public DbSet<BarberSchedule> BarberSchedules { get; set; }
    public DbSet<TimeBlock> TimeBlocks { get; set; }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        
        // Example of a global query filter (uncomment and implement _currentBarberShopId as needed)
        // builder.Entity<BarberShop>().HasQueryFilter(b => b.Id == _currentBarberShopId);

        // Configuration for BarberShop entity
        builder.Entity<BarberShop>(entity =>
        {
            entity.HasMany(bs => bs.Barbers)
                .WithOne(b => b.BarberShop)
                .HasForeignKey(b => b.BarberShopId)
                .OnDelete(DeleteBehavior.Restrict); // Prevent deleting a barber shop if it has barbers
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
    }
}