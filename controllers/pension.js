const Pension = require("../models/pension.js");

// Define controller methods for handling User requests
exports.getAllPension = async (req, res) => {
  try {
    const pensions = await Pension.findAll();
    res.status(200).json({
      count: pensions.length,
      pensions,
    });
  } catch (err) {
    console.log("first", err);
    res.status(500).json("Something gonna wrong");
  }
};

exports.getpensionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pension = await Pension.findByPk(id);
    res.json(pension);
  } catch (er) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.createPension = async (req, res, next) => {
  try {
    const { employerContribution, employeeContribution } = req.body;

    const pensions = await Pension.create({
      employerContribution,
      employeeContribution,
    });
    await pensions.setUser(Number(req.user.id));
    res.status(200).json({
      message: "Successfully Registered",
      pensions,
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.updatePension = async (req, res, next) => {
  try {
    const { employeeContribution, employerContribution } = req.body;
    const updates = {};
    const { id } = req.params;

    if (employerContribution) {
      updates.employerContribution = employerContribution;
    }
    if (employeeContribution) {
      updates.employeeContribution = employeeContribution;
    }

    const result = await Pension.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};

exports.deletePension = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pension = await Pension.findOne({ where: { id: id } });
    if (pension) {
      await Pension.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      res.status(409).json({ message: "There is no pension with this ID" });
    }
  } catch (err) {
    res.status(500).json("Something gonna wrong");
  }
};
