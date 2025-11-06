const fs = require("fs");
const path = require("path");

// pomoćna funkcija za dodavanje vodećih nula
const pad = n => n.toString().padStart(2, "0");

const now = new Date();

// oblik datuma bez razmaka iza točaka, ali s jednim razmakom prije vremena
const buildDate = `${pad(now.getDate())}.${pad(now.getMonth() + 1)}.${now.getFullYear()}. ${pad(now.getHours())}:${pad(now.getMinutes())}`;

const buildInfo = {
  buildDate,
  version: require("../package.json").version,
};

fs.writeFileSync(
  path.join(__dirname, "../src/build-info.json"),
  JSON.stringify(buildInfo, null, 2)
);

console.log("✅ Build info generated:", buildInfo);