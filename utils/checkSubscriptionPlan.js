const Subscription = require("../models/subscription");

const run = async () => {

  try {
    const find_subscription = await Subscription.findAll();
    if (find_subscription) {
      for (let i = 0; i < find_subscription.length; i++) {
        let subscription = find_subscription[i];

        let currentDate = moment(Date.now()).format("YYYY-MM-DD hh:mm");
        let userDueDate = moment(subscription.nextPaymentDate).format(
          "YYYY-MM-DD hh:mm"
        );

        if (currentDate != userDueDate || currentDate > userDueDate) {
          subscription.update({ leftPaymentDate: leftPaymentDate - 1 });
        } else {
          subscription.update({ leftPaymentDate: 0, isActive: false });
        }
      }
    }
  } catch (err) {}
};

module.exports.run = run;
