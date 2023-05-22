const { parentPort, workerData } = require("worker_threads");

const newWorker = async () => {
  try {
    console.log("first", workerData);
    // let progress = 0;
    // const payroll = await fetchData(workerData);
    // send progress to main thread
    // parentPort.postMessage({ progress: 1 });

    // parentPort.postMessage({ employeeId, payroll });
  } catch (error) {
    console.log("error", error);
  }
};

if (workerData) newWorker();
