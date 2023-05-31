"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Disable foreign key checks
    await queryInterface.sequelize.query("PRAGMA foreign_keys = OFF");

    // Insert seeders into SequelizeMeta table
    await queryInterface.bulkInsert("SequelizeMeta", [
      { name: "20230530130432-insert-default-AdditionalAllowance.js" },
      { name: "20230530130452-insert-default-AdditionalDeduction.js" },
    ]);

    // Re-enable foreign key checks
    await queryInterface.sequelize.query("PRAGMA foreign_keys = ON");
  },

  down: async (queryInterface, Sequelize) => {
    // Disable foreign key checks
    await queryInterface.sequelize.query("PRAGMA foreign_keys = OFF");

    // Delete seeders from SequelizeMeta table
    await queryInterface.bulkDelete("SequelizeMeta", null);

    // Re-enable foreign key checks
    await queryInterface.sequelize.query("PRAGMA foreign_keys = ON");
  },
};
