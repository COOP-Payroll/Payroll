const Address = require("../models/address");
const Employee = require("../models/employee");

exports.updateAddress = async (req, res) => {
  try {
    const employee = await Employee.findByPk(req.params.id);
    if (!employee) return res.status(404).json({ message: "employee not found" });
    const { country, state, zone_or_city, woreda, kebele, houseNumber } =
      req.body;
    const address = await Address.findOne({
      where: { isActive: true, EmployeeId: employee.id },
    });
    if (address) {
      await address.update({ isActive: false });
      const newAddress = await Address.create({
        country: country || address.country,
        state: state || address.country,
        zone_or_city: zone_or_city || address.zone_or_city,
        isActive: true,
        EmployeeId: employee.id,
        woreda: woreda || address.woreda,
        kebele: kebele || address.kebele,
        houseNumber: houseNumber || address.houseNumber,
      });
      return res.status(200).json({ data: newAddress });
    } else {
      return res
        .status(500)
        .json({ message: "can't find active employee address!" });
    }
  } catch (error) {
    console.error(error);
    if (
      error.name === "SequelizeValidationError" ||
      error.name === "SequelizeUniqueConstraintError"
    ) {
      const errors = error.errors.reduce((acc, err) => {
        acc[err.path] = [`${err.path} is required`];
        return acc;
      }, {});
      return res.status(400).json({message:errors});
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
