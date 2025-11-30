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
        public DbSet<Activity> Activities { get; set; }
        public DbSet<Session> Sessions { get; set; }
        public DbSet<Instructor> Instructors { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            #region User

            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);

                entity.Property(u => u.Username).IsRequired();
                entity.Property(u => u.PasswordHash).IsRequired();
                entity.Property(u => u.PasswordSalt).IsRequired();
                entity.Property(u => u.FirstName).IsRequired();
                entity.Property(u => u.LastName).IsRequired();
                entity.Property(u => u.PhoneNumber).IsRequired();

                entity.Property(u => u.Gender)
                      .HasConversion<string>()
                      .IsRequired(false);
               
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

            #region Activity

            modelBuilder.Entity<Activity>(entity =>
            {
                entity.HasKey(a => a.Id);

                entity.Property(a => a.Name).IsRequired();
                entity.Property(a => a.Description).IsRequired();
            });

            #endregion

            #region Session

            modelBuilder.Entity<Session>(entity =>
            {
                entity.HasKey(i => i.Id);

                entity.Property(s => s.ActivityId).IsRequired();

                entity.HasOne(s => s.Activity)
                      .WithMany(s => s.Sessions)
                      .HasForeignKey(s => s.ActivityId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion

            #region Instructor

            modelBuilder.Entity<Instructor>(entity =>
            {
                entity.HasKey(i => i.Id);

                entity.Property(i => i.UserId).IsRequired();
                entity.Property(i => i.Bio).IsRequired();
                entity.Property(i => i.ExperienceYears).IsRequired();

                entity.HasOne(i => i.User)
                      .WithOne()
                      .HasForeignKey<Instructor>(i => i.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion
        }
    }
}
