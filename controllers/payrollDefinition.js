const Payroll = require("../models/payrollDefinition");

// Define controller methods for handling User requests for deduction definition
exports.getAllPayroll = async (req, res, next) => {
  try {
    const CompanyId = req.user.id;
    //console.log(CompanyId)
    const criteria = {
      CompanyId,
    };
    const payroll = await Payroll.findAll(criteria);

    return res.status(200).json({
      count: payroll.length,
      payroll,
    });
  } catch (err) {
    return res.status(500).json("Something gonna wrongi");
  }
};
//get by id
exports.getPayrollDefinitionById = async (req, res) => {
  const { id } = req.params;

  try {
    const payroll = await Payroll.findByPk(Number(id));
    if (!payroll) {
      return res.status(404).json({ error: "payroll does not exist" });
    } else {
      return res.json(payroll);
    }
  } catch (error) {
    return res.json(error);
  }
};

exports.createPayroll = async (req, res) => {
  try {
    const startDate = req.body.startDate;
    const endDate = req.body.endDate;
    const CompanyId = req.user.id;
    //console.log("logged in company", req.user.id)
    const criteria1 = {
      CompanyId: CompanyId,
      startDate: req.body.startDate,
    };
    const criteria = {
      CompanyId: CompanyId,
    };
    const ifPayroll = await Payroll.count({
      where: criteria1,
    });
    const newPayroll = await Payroll.count({
      where: criteria,
    });
    console.log(ifPayroll, "exists");

    if (ifPayroll >= 1) {
      return res.json("You have already defined the payroll for this month.");
    } else if (newPayroll === 0) {
      const newPayroll = await Payroll.create({
        payrollName: req.body.payrollName,
        startDate: req.body.startDate,
        endDate: req.body.endDate,
        status: "created",
        isRollBacked: false,
        isPaid: false,
      });
      await newPayroll.setCompany(CompanyId);

      return res.status(201).json("Successfully defined your first payroll.");
    } else {
      const latestPayroll = await Payroll.findOne({
        order: [["createdAt", "DESC"]],
      });

      let latestDate;
      if (!latestPayroll) {
        const newPayroll = await Payroll.create({
          payrollName: req.body.payrollName,
          startDate: req.body.startDate,
          endDate: req.body.endDate,
          status: "created",
          isRollBacked: false,
          isPaid: false,
        });
        await newPayroll.setCompany(CompanyId);

        return res.json(newPayroll);
      } else {
        latestDate = latestPayroll.endDate;
        // const dateTimeString = "2023-05-18T03:14:59.294Z";
        // const datePart = new Date(latestDate).toISOString().split('T')[0];
        // console.log(datePart);
        console.log("latestPayroll", latestDate);

        const interval = Math.round(
          (startDate.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const newInterval = Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (newInterval < 20 || newInterval > 30) {
          return res.json(
            "The payroll duration should be between 20 and 30 days."
          );
        } else {
          if (interval !== 1) {
            return res.json(
              "The payroll should be defined one day after the last month payroll."
            );
          } else {
            const newPayroll = await Payroll.create({
              payrollName: req.body.payrollName,
              startDate: req.body.startDate,
              endDate: req.body.endDate,
              status: "created",
              isRollBacked: false,
              isPaid: false,
            });
            await newPayroll.setCompany(CompanyId);

            return res.status(201).json(newPayroll);
          }
        }
      }
    }
  } catch (err) {
    return res.status(500).json("Something went wrong.");
  }
};

exports.updatePayrollDefinition = async (req, res, next) => {
  const id = req.params.id;
  try {
    const { payrollName, startDate, endDate, status } = req.body;
    const updates = {};
    const { id } = req.params;

    if (payrollName) {
      updates.payrollName = payrollName;
    }
    if (startDate) {
      updates.startDate = startDate;
    }
    if (endDate) {
      updates.endDate = endDate;
    }
    if (status) {
      updates.status = status;
    }
    const result = await Payroll.update(updates, { where: { id: id } });

    res.status(200).json({
      message: "updated successfully",
    });
  } catch (error) {
    return res.status(500).json("Something gonna wrong");
  }
};

exports.deletePayrollDefinition = async (req, res, next) => {
  try {
    const id = req.params.id;
    const payroll = await Payroll.findOne({ where: { id: id } });
    if (payroll) {
      await Payroll.destroy({ where: { id } });
      return res.status(200).json({ message: "Deleted successfully" });
    } else {
      return res
        .status(409)
        .json({ message: "There is no  such payroll with this ID" });
    }
  } catch (err) {
    return res.status(500).json("Something gonna wrong");
  }
};
