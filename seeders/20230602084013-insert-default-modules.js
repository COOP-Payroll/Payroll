'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Permissions', [
      {
        module: "generalsetup",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "payrollsetup",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "payrollpublish",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "payrollpublishedreport",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "employeeinfo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "employeelist",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        module: "reports",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Permissions', null, {});
  }
};
