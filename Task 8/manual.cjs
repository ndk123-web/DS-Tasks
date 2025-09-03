const ManualController = async (
  signal,
  STATUS,
  sleep,
  PedestrianController
) => {
  if (signal < 1 || signal > 4) {
    console.log("Invalid road number. Please choose between 1 to 4");
    return;
  }

  // Detect which group: 1&2 or 3&4
  let group = signal === 1 || signal === 2 ? "group12" : "group34";

  if (group === "group12") {
    if (STATUS[0]["s12"] === "GREEN") {
      console.log("No changes required, signals 1 and 2 are already GREEN");
      updateAllStatus("s34", "RED");
    } else {
      console.log("Changing signals 1 and 2 to GREEN...");
      updateAllStatus("s12", "YELLOW");
      await sleep(2000);
      updateAllStatus("s12", "GREEN");
      updateAllStatus("s34", "RED");
    }
  } else if (group === "group34") {
    if (STATUS[0]["s34"] === "GREEN") {
      console.log("No changes required, signals 3 and 4 are already GREEN");
      updateAllStatus("s12", "RED");
    } else {
      console.log("Changing signals 3 and 4 to GREEN...");
      updateAllStatus("s34", "YELLOW");
      await sleep(2000);
      updateAllStatus("s34", "GREEN");
      updateAllStatus("s12", "RED");
    }
  }

  // Pedestrian logic
  PedestrianController(signal);
  console.log("Current Status:", STATUS);
  console.log();
  // Add this so function can access updateAllStatus
  function updateAllStatus(key, value) {
    for (let i = 0; i < STATUS.length; i++) {
      STATUS[i][key] = value;
    }
  }
};

module.exports = ManualController;
