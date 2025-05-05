const express = require("express");
const { Worker } = require("worker_threads");
const cors = require("cors");
const run = require("./utils/checkSubscriptionPlan");
const app = express();
const middleware = require("./middleware/auth.js");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./swagger"); // Path to your Swagger configuration file
const session = require("express-session");
// const csrf = require("csrf");
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

const PayrollDefinition = require("./models/payrollDefinition");
const moduleRoute = require("./routes/moduleRoutes.js");
const addressRoute = require("./routes/address");
const employeePayrollApprovement = require("./routes/employeePayrollApprovement");
const ebirrPayment = require("./routes/eBirrPayment.js");
const position = require("./routes/postionRoutes.js");
const Sponsors = require("./routes/sponsors.js");
const Projects = require("./routes/projectRoutes.js");
const packageRoutes = require("./routes/packageRoutes.js");
const ReportRoutes = require("./routes/reportingRoutes.js");
// const stripePayment = require("./routes/stripePayment.js");

const additionalPayDefinition = require("./routes/AdditionalPayDefinition.js");
const additionalPay = require("./routes/AdditionalPay");
const checkAccountNumber = require("./routes/accountChecker.js");
const serviceRoutes = require("./routes/serviceRoutes.js");
const per = require("./models/companyPermission.js");

const contactusRoutes = require("./routes/contactusRoutes.js");

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
      "http://10.101.200.91",
      "http://10.12.53.67:3002",
      "http://localhost:3000",
      "http://10.12.51.85",
      // "http://localhost:5173",
      // "http://localhost:5172",
    ],
    credentials: true,
  })
);

app.use((req, res, next) => {
  if (["POST", "PUT", "PATCH"].includes(req.method)) {
    return middleware.sanitizeInput(req, res, next);
  }
  next();
});

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://trusted-cdn.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "https://trusted-images.com"],
      // Add other directives as needed
    },
  })
);

app.use(helmet.frameguard({ action: "deny" }));
app.use(helmet.noSniff());
app.use(helmet.xssFilter());
app.use(
  helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  })
);
app.use(helmet.referrerPolicy({ policy: "strict-origin" }));

app.use((req, res, next) => {
  const allowedMethods = ["GET", "POST", "PUT", "DELETE"];
  if (!allowedMethods.includes(req.method)) {
    return res.status(405).json({ error: "Method Not Allowed" });
  }
  next();
});

// app.use(csrf({ cookie: true }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());
app.use("/api/user", userRouter);
app.use("/api/company", companyRouter);
app.use("/api/reports", ReportRoutes);
app.use("/api/package", packageRouter);
app.use("/api/packages", packageRoutes);
app.use("/api/taxslab", taxslabRouter);
app.use("/api/pension", pensionRouter);
app.use("/api/department", deptRouter);
app.use("/api/subscription", subscriptionRouter);
app.use("/api", authRouter);
app.use("/api/employee", employeeRouter);
app.use("/api/companyIdFormat", companyIdRouter);
app.use("/api/allowancedefinition", allowanceDefinition);
app.use("/api/allowance", allowance);
app.use("/api/deductiondefinition", deductionDefinition);
app.use("/api/loanDefinition", loanDefinition);
app.use("/api/loan", loanRoute);
app.use("/api/deduction", deduction);
app.use("/api/grade", grade);
app.use("/api/approver", approver);
app.use("/api/payroll", payrollRouter);
app.use("/api/positions", position);
app.use("/api/approvalmethod", approvalMethod);
app.use("/api/payrollDefinition", payrollDefinition);
app.use("/api/PayrollApprovement", payrollApprovement);
app.use("/api/customRole", customRoleRouter);
app.use("/api/companyAccInfo", companyAccountInfoRouter);
app.use("/api/employeeAccInfo", employeeAccountInfoRouter);
app.use("/api/additionalDeductionDefinition", additionalDeductionDefinition);
app.use("/api/additionalDeduction", additionalDeduction);
app.use("/api/additionalAllowanceDefinition", additionalAllowanceDefinition);
app.use("/api/additionalAllowance", additionalAllowance);
app.use("/api/providentFund", providentFund);
app.use("/api/newPayroll", newPayroll);
app.use("/api/module", moduleRoute);
app.use("/api/address", addressRoute);
app.use("/api/sponsors", Sponsors);
app.use("/api/projects", Projects);
app.use("/api/employeePayrollApprovement", employeePayrollApprovement);
app.use("/api/payment", ebirrPayment);
app.use("/api/employeePayrollApprovement", employeePayrollApprovement);
app.use("/api/additionalPay", additionalPayDefinition);
app.use("/api/additionalpayment", additionalPay);
app.use("/api/payment", ebirrPayment);
app.use("/api/accountNumber/verify", checkAccountNumber);
app.use("/api/services", serviceRoutes);
app.use("/api/contactus", contactusRoutes);

const swaggerOptions = {
  swaggerOptions: {
    url: "http://localhost:6000/api-docs/swagger.json", // Update the URL to match your setup
  },
};

app.use(
  "/api/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, swaggerOptions)
);

app.use((req, res, next) => {
  const error = new Error("There is no such URL");
  error.status = 404;
  next(error);
});

app.use(
  session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: 0,
    },
  })
);

app.use((err, req, res, next) => {
  res.removeHeader("Cross-Origin-Embedder-Policy");
  const errorStatus = err.status || 500;
  const errorMessage = err.message || "Something went Wrong";
  // console.log()
  return res.status(errorStatus).json({
    success: false,
    status: errorStatus,
    message: err.message || "Something went",
    timestamp: new Date().toISOString(),
    // stack: err.stack,
  });
});

let isRunning = false;
console.log(process.env.PORT);
app.listen(process.env.PORT || 4400, () => {
  console.log(`Server is running on port: ${process.env.PORT}`);
});
