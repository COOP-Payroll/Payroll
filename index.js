const express = require("express");
const cors = require("cors");
const run = require("./utils/checkSubscriptionPlan");
require("dotenv").config();
const sequelize = require("./database/db.js");
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
const deduction = require("./routes/deduction");
const grade = require("./routes/grade");
const deductionDefinition = require("./routes/deductionDefinition");
const payrollRouter = require("./routes/payroll");
const employeeRouter = require("./routes/employee.js");

const payrollDefinition = require("./routes/payrollDefinition");
const approvalMethod = require("./routes/approvalMethod");

const app = express();

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://localhost:3002",
      "http://localhost:*",
      "http://10.2.125.124:4000",
      "*",
    ],
    credentials: true,
  })
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

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
app.use("/deduction", deduction);
app.use("/grade", grade);

app.use("/payroll", payrollRouter);
app.use("/approvalmethod", approvalMethod);
app.use("/payrollDefinition", payrollDefinition);

sequelize.sync().then(() => console.log("db is ready"));
// sequelize.sync({alter:true}).then(() => console.log("updated"));

app.listen(process.env.PORT, () => {
  // cron.schedule("* * *  * *  * * *", async () => {
  //   run.run();
  // });
  console.log(`connected to backend`);
});
