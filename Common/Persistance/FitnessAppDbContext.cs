using Common.Entities;
using Common.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Client;

namespace Common.Persistance
{
    public class FitnessAppDbContext : DbContext
    {
        public FitnessAppDbContext(DbContextOptions<FitnessAppDbContext> options)
            : base(options) { }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region User

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.PasswordSalt).IsRequired();
                entity.Property(u => u.FirstName).IsRequired();
                entity.Property(u => u.LastName).IsRequired();
                entity.Property(u => u.PhoneNumber).IsRequired();
               
                entity.Property(u => u.Role)
                      .HasConversion<string>()                  
                      .IsRequired();
               
                entity.Property(u => u.CreatedAt)
                      .HasDefaultValueSql("GETUTCDATE()");
            });
            
            modelBuilder.Entity<User>().HasData(new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = "kT+sqQwXM1NrXexPcT3dIrtKlGhsixrUS3QEWMihPe8=",
                PasswordSalt = "AJN//OPj7+3RWyh601otNA==",
                FirstName = "System",
                LastName = "Administrator",
                PhoneNumber = "0876609216",
                Role = UserRole.Admin,                
                CreatedAt = new DateTime(2025, 11, 27, 0, 38, 0, DateTimeKind.Utc)
            });

            #endregion
        }
    }
}
