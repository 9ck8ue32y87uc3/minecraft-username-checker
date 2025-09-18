import fs from "fs";
import fetch from "node-fetch";
import chalk from "chalk";

const API_URL = "https://api.mojang.com/users/profiles/minecraft/";

/**
 * Check if a Minecraft username is taken
 * @param {string} username
 * @returns {Promise<boolean>} true = taken, false = available
 */

async function checkUsername(username) {
  try {
    const res = await fetch(API_URL + username, { timeout: 5000 });
    return res.status === 200;
  } catch {
    return false; 
  }
}

async function main() {
  const inputFile = "usernames.txt";
  const outputFile = "output.txt";

  if (!fs.existsSync(inputFile)) {
    console.error(chalk.red(`[-] ${inputFile} not found`));
    return;
  }

  const usernames = fs
    .readFileSync(inputFile, "utf-8")
    .split("\n")
    .map(u => u.trim())
    .filter(Boolean);

  if (usernames.length === 0) {
    console.error(chalk.red(`[-] ${inputFile} is empty`));
    return;
  }

  console.log(chalk.blue(`[>] Checking ${usernames.length} usernames...\n`));

  const results = await Promise.all(
    usernames.map(async u => ({ username: u, taken: await checkUsername(u) }))
  );

  const takenList = [];
  const availableList = [];
  let outputText = "";

  results.forEach(r => {
    if (r.taken) {
      console.log(chalk.red(`[+] ${r.username} is already taken`));
      outputText += `[+] ${r.username} is already taken\n`;
      takenList.push(r.username);
    } else {
      console.log(chalk.green(`[+] ${r.username} is available`));
      outputText += `[+] ${r.username} is available\n`;
      availableList.push(r.username);
    }
  });

  outputText += `\n=== SUMMARY ===\n`;
  outputText += `Taken: ${takenList.join(", ") || "None"}\n`;
  outputText += `Available: ${availableList.join(", ") || "None"}\n`;

  fs.writeFileSync(outputFile, outputText, "utf-8");
  console.log(chalk.yellow(`\n[+] Done! Results saved in ${outputFile}`));
}

main();
