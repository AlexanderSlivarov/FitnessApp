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
            modelBuilder.Entity<User>()
                .HasKey(u => u.Id); 
            modelBuilder.Entity<User>()
                .Property(u => u.PasswordHash)
                .IsRequired(); 
            modelBuilder.Entity<User>()
                .Property(u => u.FirstName)
                .IsRequired();
            modelBuilder.Entity<User>()
                .Property(u => u.LastName)
                .IsRequired(); 
            modelBuilder.Entity<User>()
                .Property(u => u.PhoneNumber)
                .IsRequired();
            modelBuilder.Entity<User>()
                .Property(u => u.Role)
                .HasConversion<string>()
                .HasDefaultValue(UserRole.Member)
                .IsRequired();
            modelBuilder.Entity<User>()
                .Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETUTCDATE()");    
        }
    }
}
