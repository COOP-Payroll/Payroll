const AdditionalPayDefinition = require("../models/additionalPayDefinition");
const Company = require("../models/company");
const createError = require("../utils/error");

//GET ALL ADDITIONAL PAY DEFINITION
exports.getAllAdditionalPayDefinition = async (req, res, next) => {
  const Company = req.user.id;
  try {
    const criteria = {
      CompanyId: req.user.id,
    };
    const AdditionalPayDefinitions = await AdditionalPayDefinition.findAll({
      where: criteria,
    });
    res.status(200).json({
      count: AdditionalPayDefinitions.length,
      AdditionalPayDefinitions,
    });
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//GET BY ID
exports.getAdditionalPayDefinitionById = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    const { id } = req.params;
    const additionalPayDefinitions = await AdditionalPayDefinition.findOne({
      where: { id, CompanyId },
    });

    if (!additionalPayDefinitions) {
      return next(
        createError.createError(404, "Additional pay definition is not defined")
      );
    }
    res.status(200).json(additionalPayDefinitions);
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
//CREATE
exports.createAdditionalPayDefinition = async (req, res, next) => {
  try {
    const Company = req.user.id;
    const { name, type } = req.body;
    const criteria = {
      name: name,
    };
    const checkAdditionalPay = await AdditionalPayDefinition.findOne({
      where: criteria,
    });

    if (checkAdditionalPay) {
      return next(
        createError.createError(
          400,
          "Additional pay Definition is already exists"
        )
      );
    } else {
      const AdditionalPayDefinitions = await AdditionalPayDefinition.create({
        name,
        type,
      });
      await AdditionalPayDefinitions.setCompany(Company);
      res.status(200).json({
        message: "Successfully Registered",
        AdditionalPayDefinitions,
      });
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//UPDATE ADDITIONAL PAY DEFINITION
exports.updateAdditionalPayDefinition = async (req, res, next) => {
  try {
    const { name, type } = req.body;
    const updates = {};
    const { id } = req.params;

    const additionalPayDefinition = await AdditionalPayDefinition.findOne({
      where: { id },
    });

    if (!additionalPayDefinition) {
      return next(createError.createError(404, "Resource not found"));
    } else {
      const criteria = {
        name: name,
      };
      const checkAdditionalPay = await AdditionalPayDefinition.findOne({
        where: criteria,
      });

      if (checkAdditionalPay) {
        return next(createError.createError(400, "Duplicate resource"));
      } else {
        const updatedInfo = await additionalPayDefinition.update(req.body, {
          returning: true,
        });
        res.status(200).json({
          msg: "updated successfully",
          updatedInfo,
        });
      }
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};

//DELETE ADDITIONAL PAY DEFINITION
exports.deleteAdditionalPayDefinition = async (req, res, next) => {
  try {
    const { id } = req.params;
    const additionalPayDefinition = await AdditionalPayDefinition.findOne({
      where: { id: id },
    });
    if (additionalPayDefinition) {
      await AdditionalPayDefinition.destroy({ where: { id } });
      res.status(200).json({ message: "Deleted successfully" });
    } else {
      return next(createError.createError(404, "Resource not found"));
    }
  } catch (error) {
    return next(
      createError.createError(503, "An error occurred, please try again later")
    );
  }
};
