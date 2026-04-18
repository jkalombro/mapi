using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Mapi.Infrastructure.Persistence.Migrations
{
    /// <inheritdoc />
    public partial class RedesignActionsAsSeededAndSingleTriggerAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Actions_Users_UserId",
                table: "Actions");

            migrationBuilder.DropTable(
                name: "TriggerActionMaps");

            migrationBuilder.DropIndex(
                name: "IX_Actions_UserId",
                table: "Actions");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Actions");

            migrationBuilder.AddColumn<Guid>(
                name: "ActionId",
                table: "Triggers",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.InsertData(
                table: "Actions",
                columns: new[] { "Id", "ActionType", "CreatedAt", "ResponseTemplate", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("00000000-0000-0000-0000-000000000001"), 0, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "The {item} is {value}.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000002"), 1, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "I've added {item}.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000003"), 2, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "I've updated {item} to {value}.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) },
                    { new Guid("00000000-0000-0000-0000-000000000004"), 3, new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "I've removed {item}.", new DateTime(2026, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc) }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Triggers_ActionId",
                table: "Triggers",
                column: "ActionId");

            migrationBuilder.AddForeignKey(
                name: "FK_Triggers_Actions_ActionId",
                table: "Triggers",
                column: "ActionId",
                principalTable: "Actions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Triggers_Actions_ActionId",
                table: "Triggers");

            migrationBuilder.DropIndex(
                name: "IX_Triggers_ActionId",
                table: "Triggers");

            migrationBuilder.DeleteData(
                table: "Actions",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000001"));

            migrationBuilder.DeleteData(
                table: "Actions",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000002"));

            migrationBuilder.DeleteData(
                table: "Actions",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000003"));

            migrationBuilder.DeleteData(
                table: "Actions",
                keyColumn: "Id",
                keyValue: new Guid("00000000-0000-0000-0000-000000000004"));

            migrationBuilder.DropColumn(
                name: "ActionId",
                table: "Triggers");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Actions",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: Guid.Empty);

            migrationBuilder.CreateTable(
                name: "TriggerActionMaps",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    ActionId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    TriggerId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SortOrder = table.Column<int>(type: "int", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TriggerActionMaps", x => x.Id);
                    table.ForeignKey(
                        name: "FK_TriggerActionMaps_Actions_ActionId",
                        column: x => x.ActionId,
                        principalTable: "Actions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TriggerActionMaps_Triggers_TriggerId",
                        column: x => x.TriggerId,
                        principalTable: "Triggers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Actions_UserId",
                table: "Actions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggerActionMaps_ActionId",
                table: "TriggerActionMaps",
                column: "ActionId");

            migrationBuilder.CreateIndex(
                name: "IX_TriggerActionMaps_TriggerId_ActionId",
                table: "TriggerActionMaps",
                columns: new[] { "TriggerId", "ActionId" },
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Actions_Users_UserId",
                table: "Actions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
