using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GameCenterApi.Migrations
{
    /// <inheritdoc />
    public partial class FinalScoreUpdate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DateReached",
                table: "HighScores",
                newName: "DateSubmitted");

            migrationBuilder.AddColumn<int>(
                name: "PlayerId",
                table: "HighScores",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "PlayerId",
                table: "HighScores");

            migrationBuilder.RenameColumn(
                name: "DateSubmitted",
                table: "HighScores",
                newName: "DateReached");
        }
    }
}
