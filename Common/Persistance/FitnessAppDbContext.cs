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
        public DbSet<Studio> Studios { get; set; }
        public DbSet<Membership> Memberships { get; set; }
        public DbSet<Equipment> Equipments { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Subscription> Subscriptions { get; set; } 
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
                entity.HasKey(s => s.Id);

                entity.Property(s => s.InstructorId).IsRequired();
                entity.Property(s => s.StudioId).IsRequired();
                entity.Property(s => s.ActivityId).IsRequired();

                entity.Property(s => s.Name).IsRequired();
                entity.Property(s => s.StartTime).IsRequired();
                entity.Property(s => s.Duration).IsRequired();
                entity.Property(s => s.Date).IsRequired();        
                entity.Property(s => s.MinParticipants).IsRequired();
                entity.Property(s => s.Difficulty).IsRequired();

                entity.HasOne(s => s.Instructor)
                       .WithMany()
                       .HasForeignKey(s => s.InstructorId)
                       .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Studio)
                      .WithMany()
                      .HasForeignKey(s => s.StudioId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Activity)
                      .WithMany()
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

                entity.HasIndex(i => i.UserId).IsUnique();

                entity.HasOne(i => i.User)
                      .WithOne()
                      .HasForeignKey<Instructor>(i => i.UserId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion

            #region Studio

            modelBuilder.Entity<Studio>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.Name).IsRequired();
                entity.Property(s => s.Location).IsRequired();
                entity.Property(s => s.Capacity).IsRequired();
            });

            #endregion

            #region Membership

            modelBuilder.Entity<Membership>(entity =>
            {
                entity.HasKey(m => m.Id);

                entity.Property(m => m.Name).IsRequired();
                entity.Property(m => m.Price).IsRequired();
                entity.Property(m => m.Duration).IsRequired();
                entity.Property(m => m.Description).IsRequired();

                entity.Property(m => m.DurationType)
                      .HasConversion<string>()
                      .IsRequired();
            });

            #endregion

            #region Equipment

            modelBuilder.Entity<Equipment>(entity =>
            {
                entity.HasKey(e => e.Id);

                entity.Property(e => e.StudioId).IsRequired();
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Quantity).IsRequired();

                entity.Property(e => e.Condition)
                      .HasConversion<string>()
                      .IsRequired();

                entity.HasOne(e => e.Studio)
                       .WithMany()
                       .HasForeignKey(e => e.StudioId)
                       .OnDelete(DeleteBehavior.Restrict);                     
            });

            #endregion

            #region Booking 

            modelBuilder.Entity<Booking>(entity =>
            {
                entity.HasKey(b => b.Id);

                entity.Property(b => b.UserId).IsRequired();
                entity.Property(b => b.SessionId).IsRequired();

                entity.Property(b => b.Status)
                      .HasConversion<string>()
                      .IsRequired();

                entity.Property(b => b.BookedAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(b => b.User)
                      .WithMany(u => u.Bookings)
                      .HasForeignKey(b => b.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(b => b.Session)
                      .WithMany(s => s.Bookings)
                      .HasForeignKey(b => b.SessionId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasIndex(b => new { b.UserId, b.SessionId })
                      .IsUnique();
            });

            #endregion

            #region Subscription

            modelBuilder.Entity<Subscription>(entity =>
            {
                entity.HasKey(s => s.Id);

                entity.Property(s => s.UserId).IsRequired();
                entity.Property(s => s.MembershipId).IsRequired();

                entity.Property(s => s.StartDate).IsRequired();
                entity.Property(s => s.EndDate).IsRequired();

                entity.Property(s => s.Status)
                      .HasConversion<string>()
                      .IsRequired();

                entity.Property(s => s.PurchasedAt)
                      .HasDefaultValueSql("GETUTCDATE()");

                entity.HasOne(s => s.User)
                      .WithMany()
                      .HasForeignKey(s => s.UserId)
                      .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(s => s.Membership)
                      .WithMany()
                      .HasForeignKey(s => s.MembershipId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            #endregion
        }
    }
}
