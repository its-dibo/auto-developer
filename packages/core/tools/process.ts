const { execSync } = require("child_process");

export function exec(cmd, std, async = false) {
  console.log(">> " + cmd + "\n");

  if (std === true) std = [0, 1, 2];
  if (std) std = { stdio: std }; //https://stackoverflow.com/a/43962747

  try {
    //todo: if(!async)return execSync(..)
    return execSync(cmd, std);
  } catch (err) {
    if (!std) console.error(err); //err.stdout.toString()
  }
}

export function npm(cmd, noSilent, std) {
  return exec(
    "npm " +
      cmd +
      (!noSilent ? " --silent" : "") +
      " --no-audit --global-style", //todo: if(cmd about install or i)--global-style
    std
  );
}
