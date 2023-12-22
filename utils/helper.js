const moment = require("moment");
const Subscription = require("../models/subscription");

const calculateNextPayment = async ({ chargeType, normalDate, duration }) => {
  let currentDate;
  if (!chargeType) {
    return null;
  }
  if (chargeType === "Trial") {
    let date = Date.now();
    currentDate = moment(normalDate);
    currentDate.add(30, "days").format("YYYY-MM-DD hh:mm");
    return currentDate;
  }
  if (chargeType === "Monthly") {
    currentDate = moment(normalDate);
    currentDate.add(30 * duration, "days").format("YYYY-MM-DD hh:mm");
    return currentDate;
  } else if (chargeType === "Yearly") {
    currentDate = moment(normalDate);
    currentDate.add(365 * duration, "days").format("YYYY-MM-DD hh:mm");
    return currentDate;
  } else if (chargeType === "Unlimited") {
    currentDate = moment(normalDate);           
    currentDate.add(1000000, "days").format("YYYY-MM-DD hh:mm");
    return currentDate;
  }
};

//module.exports.verifyPayment = verifyPayment;
module.exports.calculateNextPayment = calculateNextPayment;
