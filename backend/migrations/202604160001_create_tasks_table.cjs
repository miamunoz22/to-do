/**
 * @param {import("knex").Knex} knex
 */
exports.up = async function up(knex) {
  await knex.schema.createTable("tasks", (table) => {
    table.uuid("id").primary();
    table.string("title").notNullable();
    table
      .enu("category", ["professional", "personal", "friends_family", "errands"])
      .notNullable();
    table.enu("priority", ["high", "medium", "low"]).notNullable();
    table.boolean("is_urgent").notNullable().defaultTo(false);
    table.datetime("due_date");
    table.integer("estimate_minutes");
    table.text("notes");
    table.enu("status", ["open", "completed"]).notNullable().defaultTo("open");
    table.datetime("created_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("updated_at").notNullable().defaultTo(knex.fn.now());
    table.datetime("completed_at");
    table.integer("actual_minutes");
    table.integer("open_duration_minutes");
  });
};

/**
 * @param {import("knex").Knex} knex
 */
exports.down = async function down(knex) {
  await knex.schema.dropTableIfExists("tasks");
};
