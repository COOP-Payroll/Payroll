'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    
    await queryInterface.bulkInsert('AdditionalAllowanceDefinitions', [
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
    ], {});
  },
   async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('AdditionalAllowanceDefinitions', null, {});
  }
};
