"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "AdditionalDeductionDefinitions",
      [
        {
          name: "Arrears",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Day Deduction",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AdditionalDeductionDefinitions", null, {});
  },
};
