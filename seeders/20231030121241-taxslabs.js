"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "Taxslabs",
      [
        {
          from_Salary: 0,
          to_Salary: 600,
          income_tax_payable: 0,
          deductible_Fee: 0,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 601,
          to_Salary: 1650,
          income_tax_payable: 10,
          deductible_Fee: 50,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 1651,
          to_Salary: 3200,
          income_tax_payable: 15,
          deductible_Fee: 142.5,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 3201,
          to_Salary: 5250,
          income_tax_payable: 20,
          deductible_Fee: 302.5,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 5251,
          to_Salary: 7800,
          income_tax_payable: 25,
          deductible_Fee: 565,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 7801,
          to_Salary: 10900,
          income_tax_payable: 30,
          deductible_Fee: 955,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          from_Salary: 10901,
          to_Salary: "Infinity",
          income_tax_payable: 35,
          deductible_Fee: 1500,
          companyId: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Taxslabs", null, {});
  },
};
