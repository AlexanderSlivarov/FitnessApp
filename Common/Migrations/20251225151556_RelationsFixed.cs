using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Common.Migrations
{
    /// <inheritdoc />
    public partial class RelationsFixed : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SessionId",
                table: "Subscriptions",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_SessionId",
                table: "Subscriptions",
                column: "SessionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Sessions_SessionId",
                table: "Subscriptions",
                column: "SessionId",
                principalTable: "Sessions",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Sessions_SessionId",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_SessionId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "SessionId",
                table: "Subscriptions");
        }
    }
}
