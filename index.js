const express = require("express");
const { Worker } = require("worker_threads");
const cors = require("cors");
const run = require("./utils/checkSubscriptionPlan");


const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swagger'); // Path to your Swagger configuration file



require("dotenv").config();
const sequelize = require("./database/db");
const cron = require("node-cron");
const bodyParser = require("body-parser");
const userRouter = require("./routes/user.js");
const companyRouter = require("./routes/company.js");
const packageRouter = require("./routes/package.js");
const taxslabRouter = require("./routes/taxslab.js");
const pensionRouter = require("./routes/pension.js");
const deptRouter = require("./routes/department.js");
const subscriptionRouter = require("./routes/subscription.js");
const authRouter = require("./routes/auth.js");
const companyIdRouter = require("./routes/companyId");
const allowance = require("./routes/allowance");
const allowanceDefinition = require("./routes/allowanceDefinition");
const loanDefinition = require("./routes/loanDefinition");
const deduction = require("./routes/deduction");
const grade = require("./routes/grade");
const deductionDefinition = require("./routes/deductionDefinition");
const payrollRouter = require("./routes/payroll");
const employeeRouter = require("./routes/employee.js");
const approver = require("./routes/approver");
const payrollDefinition = require("./routes/payrollDefinition");
const approvalMethod = require("./routes/approvalMethod");
const payrollApprovement = require("./routes/payrollApprovement");
const customRoleRouter = require("./routes/customRole.js");
const loanRoute = require("./routes/loan.js");
const companyAccountInfoRouter = require("./routes/companyAccountInfo");
const employeeAccountInfoRouter = require("./routes/employeeAccountInfo");
const additionalDeductionDefinition = require("./routes/AdditionalDeductionDefinition.js");
const additionalDeduction = require("./routes/additionalDeduction.js");
const additionalAllowanceDefinition = require("./routes/additionalAllowanceDefinition.js");
const additionalAllowance = require("./routes/additionalAllowance.js");
const providentFund = require("./routes/providentFund.js");
const newPayroll = require("./routes/newPayroll.js");
const Payroll = require("./models/Payroll");
const PayrollDefinition = require("./models/payrollDefinition");
const moduleRoute = require("./routes/moduleRoutes.js");
const addressRoute = require("./routes/address");
const employeePayrollApprovement = require("./routes/employeePayrollApprovement");
const ebirrPayment = require("./routes/eBirrPayment.js");

// const stripePayment = require("./routes/stripePayment.js");

const additionalPayDefinition = require("./routes/AdditionalPayDefinition.js");
const additionalPay = require("./routes/AdditionalPay");
// const employeePromotion = require("./routes/employeePromotion");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
const cookieParser = require("cookie-parser");
app.use(bodyParser.json());
app.use("/uploads", express.static("./uploads/"));
app.use(
  cors({
    origin: [
      "*",
      "http://localhost:3000",
      "http://localhost:5173",
      "http://localhost:5172",
      "http://localhost:5171",
      "http://localhost:5170",
      "http://localhost:****",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:****",
      "http://10.2.125.124:4000",
      "http://10.2.125.127:80",
      "http://10.2.125.127",
      "http://10.2.125.127:*",
      "http://10.2.125.124:80",
      "http://10.2.125.124",
      "https://payroll-ms.onrender.com",
      
      "https://payroll-ms.onrender.com:6000",
    ],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/package", packageRouter);
app.use("/taxslab", taxslabRouter);
app.use("/pension", pensionRouter);
app.use("/department", deptRouter);
app.use("/subscription", subscriptionRouter);
app.use("/login", authRouter);
app.use("/employee", employeeRouter);
app.use("/companyIdFormat", companyIdRouter);
app.use("/allowancedefinition", allowanceDefinition);
app.use("/allowance", allowance);
app.use("/deductiondefinition", deductionDefinition);
app.use("/loanDefinition", loanDefinition);
app.use("/loan", loanRoute);
app.use("/deduction", deduction);
app.use("/grade", grade);
app.use("/approver", approver);
app.use("/payroll", payrollRouter);
app.use("/approvalmethod", approvalMethod);
app.use("/payrollDefinition", payrollDefinition);
app.use("/PayrollApprovement", payrollApprovement);
app.use("/customRole", customRoleRouter);
app.use("/companyAccInfo", companyAccountInfoRouter);
app.use("/employeeAccInfo", employeeAccountInfoRouter);
app.use("/additionalDeductionDefinition", additionalDeductionDefinition);
app.use("/additionalDeduction", additionalDeduction);
app.use("/additionalAllowanceDefinition", additionalAllowanceDefinition);
app.use("/additionalAllowance", additionalAllowance);
app.use("/providentFund", providentFund);
app.use("/newPayroll", newPayroll);
app.use("/module", moduleRoute);
app.use("/address", addressRoute);

app.use("/employeePayrollApprovement", employeePayrollApprovement);
app.use("/payment", ebirrPayment);
// app.use("/s1", stripePayment);
app.use("/employeePayrollApprovement", employeePayrollApprovement);
app.use("/additionalPay", additionalPayDefinition);
app.use("/additionalpayment", additionalPay);
app.use("/payment", ebirrPayment);
// app.use("/employeePromotion", employeePromotion);

const swaggerOptions = {
  swaggerOptions: {
    url: 'http://localhost:6000/api-docs/swagger.json', // Update the URL to match your setup
  },
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec,swaggerOptions));


app.use((req, res, next) => {
  const error = new Error("There is no such URL");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  res.removeHeader("Cross-Origin-Embedder-Policy");
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went Wrong";
console.log()
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: err.message || "Something went",
    timestamp: new Date().toISOString(),
    // stack: err.stack,
  });
});

sequelize.sync({ force: false }).then(() => console.log("db is ready"));

const runWorker = (employeeId, payrollDefinitionId, user) => {
  const worker = new Worker("./controllers/newWorker.js", {
    workerData: { employeeId, user, payrollDefinitionId },
  });
};

const runComputation = async (payrolls) => {
  payrolls.forEach((payroll) => {
    const { EmployeeId, PayrollDefinitionId, PayrollDefinition } = payroll;
    runWorker(EmployeeId, PayrollDefinitionId, PayrollDefinition.CompanyId);
  
  });
};

let isRunning = false;

app.listen(process.env.PORT ||6000, () => {
 
  cron.schedule("*/5 * * * * * * *", async () => {
    if (!isRunning) {
      isRunning = true;
      const payrolls = await Payroll.findAll({
        where: { status: "ordered" },
        include: [PayrollDefinition],
      });
      // console.log("first", JSON.stringify(payrolls))
      if (payrolls.length > 0) {
        await runComputation(payrolls);
      }
      isRunning = true;
    }
  });
  console.log(`Server is running on port: ${process.env.PORT}`);
});
