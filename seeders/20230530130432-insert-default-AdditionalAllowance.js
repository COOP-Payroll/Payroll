"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "AdditionalAllowanceDefinitions",
      [
        {
          name: "Acting",
          isTaxable: true,
          isExempted: false,
          exemptedAmount: "0",
          startingAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
          name: "Over Time",
          isTaxable: true,
          isExempted: false,
          exemptedAmount: "0",
          startingAmount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("AdditionalAllowanceDefinitions", null, {});
  },
};
