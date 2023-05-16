const run = require("./utils/checkSubscriptionPlan");
const express = require("express");
require("dotenv").config();
const app = express();
const sequelize = require("./database/db.js");

const userRouter = require("./routes/user.js");
const companyRouter = require("./routes/company.js");
const packageRouter = require("./routes/package.js");
const taxslabRouter = require("./routes/taxslab.js");
const pensionRouter = require("./routes/pension.js");
const deptRouter = require("./routes/department.js");
const subscriptionRouter = require("./routes/subscription.js");
const allowance = require('./routes/allowance')
const allowanceDefinition = require('./routes/allowanceDefinition')
const deduction = require('./routes/deduction')
const grade = require('./routes/grade')
const deductionDefinition = require('./routes/deductionDefinition')
const approvalMethod = require("./routes/approvalMethod")
const payroll = require("./routes/payrollDefinition")
const cron = require("node-cron");
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

app.use("/allowancedefinition", allowanceDefinition)
app.use("/allowance", allowance)
app.use("/deductiondefinition", deductionDefinition)
app.use("/deduction", deduction)
app.use("/grade", grade)
app.use("/user", userRouter);
app.use("/company", companyRouter);
app.use("/package", packageRouter);
app.use("/taxslab", taxslabRouter);
app.use("/pension", pensionRouter);
app.use("/department", deptRouter);
app.use("/subscription", subscriptionRouter);
app.use("/approvalmethod", approvalMethod);
app.use("/Payroll", payroll);

sequelize.sync().then(() => console.log("db is ready"));

app.listen(process.env.PORT, () => {
  console.log(process.env.PORT)
  // cron.schedule("* * *  * *  * * *", async () => {
  //   run.run();
  // });
  console.log("connected to backend");
});

