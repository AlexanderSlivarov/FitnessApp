using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Common.Migrations
{
    /// <inheritdoc />
    public partial class ReseedAdminManual : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
               table: "Users",
               columns: new[] { "Id", "CreatedAt", "FirstName", "LastName", "PasswordHash", "PasswordSalt", "PhoneNumber", "Role", "Username" },
               values: new object[] { 1, new DateTime(2025, 11, 27, 0, 38, 0, 0, DateTimeKind.Utc), "System", "Administrator", "kT+sqQwXM1NrXexPcT3dIrtKlGhsixrUS3QEWMihPe8=", "AJN//OPj7+3RWyh601otNA==", "0876609216", "Admin", "admin" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
