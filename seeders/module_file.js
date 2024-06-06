"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Modules", null, { truncate: true });
    await queryInterface.bulkInsert(
      "Modules",
      [
        {
            name: "Admin",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "generalsetup",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "payrollsetup",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "payrollpublish",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "payrollpublishreport",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "emplooyeinfo",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            name: "emplooyelist",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
          name: "reports",
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        {
            name: "payrollDraft",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        
        {
            name: "unprocessedSalary",
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
          name: "payrollApproval",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    // await queryInterface.bulkDelete("Modules", null, { truncate: true });
  },
};
