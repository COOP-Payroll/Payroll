const User = require("../models/user.js");
const Company = require("../models/company.js");

// create User
exports.createUser = async (req, res) => {
  const body = req.body;

  try {
    const user = await User.create({ ...body });
    res.json(user);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const errors = {};
      error.errors.forEach((err) => {
        errors[err.path] = [`${err.path} is required`];
      });
      res.status(400).json(errors);
    }
    console.log("error", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get AllUser
exports.getAllUser = async (req, res) => {
  const users = await User.findAll({
    attributes: { exclude: ["password"] },
  });
  res.json(users);
};

// get only one user
exports.getUserById = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!user) res.status(404).json({ error: "User does not exist" });
    res.json(user);
  } catch (error) {
    res.json(error);
  }
};

// update User
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const body = req.body;

  try {
    const user = await User.findByPk(Number(id));
    if (!user) res.status(404).json({ error: "user does not exist" });

    if (body.password) {
      delete body.password;
    }

    await user.validate();
    await user.update({ ...body });
    res.json(user);
  } catch (error) {
    if (error.name === "SequelizeValidationError") {
      const validationErrors = error.errors.map((error) => ({
        field: error.path,
        message: error.message,
      }));
      return res.status(400).json(validationErrors);
    }

    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete User
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(Number(id));
    if (!user) res.status(404).json({ error: "user does not exist" });
    await user.destroy();
    res.json("user deleted successfully");
  } catch (error) {
    res.status(400).json(error.errors);
  }
};

exports.updateCompanyStatus = async (req, res) => {
  const { id, status } = req.body;
  try {
    const company = await Company.findByPk(Number(id), {
      attributes: { exclude: ["password"] },
    });
    if (!company) res.status(404).json({ error: "company does not exist" });
    await company.update({ status });
    res.json(company);
  } catch (error) {
    console.log("err", error);
    res.status(400).json(error.errors);
  }
};
