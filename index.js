const express = require("express");
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

const app = express();

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
// app.use("/companyIdFormat", companyIdRouter);
app.use("/allowancedefinition", allowanceDefinition);
app.use("/allowance", allowance);
app.use("/deductiondefinition", deductionDefinition);
app.use("/deduction", deduction);
app.use("/grade", grade);

sequelize.sync({ alter: true }).then(() => console.log("db is ready"));

app.listen(process.env.PORT, () => {
  // cron.schedule("* * *  * *  * * *", async () => {
  //   run.run();
  // });
  console.log("connected to backend");
});
