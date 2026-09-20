#!/usr/bin/env node

const { version } = require("../package.json");

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: neural-int [options]

Natsuki Izumi's terminal profile card.

Options:
  --plain, --no-color  Disable ANSI colors
  -v, --version        Print the package version
  -h, --help           Show this help
`);
  process.exit(0);
}

if (args.has("--version") || args.has("-v")) {
  console.log(version);
  process.exit(0);
}

const forcePlain = args.has("--plain") || args.has("--no-color");
const useColor =
  !forcePlain &&
  Boolean(process.stdout.isTTY) &&
  process.env.TERM !== "dumb" &&
  !("NO_COLOR" in process.env);

const paint = (code, text) =>
  useColor ? `\u001b[${code}m${text}\u001b[0m` : text;

const palette = {
  border: (text) => paint("38;5;240", text),
  logo: (text) => paint("38;5;250", text),
  name: (text) => paint("1;38;5;255", text),
  muted: (text) => paint("38;5;246", text),
  keyword: (text) => paint("1;38;5;114", text),
  key: (text) => paint("38;5;75", text),
  value: (text) => paint("38;5;215", text),
  punctuation: (text) => paint("38;5;250", text),
};

const BODY_WIDTH = 84;
const LOGO_COLUMN = 31;
const ansiPattern = /\u001b\[[0-9;]*m/g;

const visibleLength = (text) => {
  const chars = Array.from(text.replace(ansiPattern, ""));
  let width = 0;

  for (const char of chars) {
    if (/\p{Mark}|\uFE0F|\u200D/u.test(char)) continue;
    width += /\p{Extended_Pictographic}/u.test(char) ? 2 : 1;
  }

  return width;
};

const row = (content = "") => {
  const padding = Math.max(0, BODY_WIDTH - visibleLength(content));
  return (
    palette.border("│") +
    " " +
    content +
    " ".repeat(padding) +
    " " +
    palette.border("│")
  );
};

const headerRow = (left = "", logoLine = "") => {
  const padding = Math.max(3, LOGO_COLUMN - visibleLength(left));
  return left + " ".repeat(padding) + logoLine;
};

const top = palette.border(`╭${"─".repeat(BODY_WIDTH + 2)}╮`);
const bottom = palette.border(`╰${"─".repeat(BODY_WIDTH + 2)}╯`);

const info = (icon, key, value) =>
  `  ${icon} ${palette.key(key.padEnd(8))}${palette.punctuation(": ")}${palette.value(
    `"${value}"`
  )}`;

// Generated from the Illustrator business-card logo at a 40×40-dot source grid.
// Each Braille cell encodes a 2×4 dot matrix for higher terminal resolution.
const logo = [
  "   ⢀⣾⣿⣿⣿⣿⣿",
  "   ⢸⣿⣿⣿⣿⣿⡟⢀⣀⣀⣀⣀⣀",
  "   ⢸⣿⣿⣿⣿⣿⠁⠸⣿⣿⣿⣿⣿⠃",
  "   ⢸⣿⣿⣿⣿⡏  ⠘⣿⣿⡿⠁",
  "   ⢸⣿⣿⣿⣿⠁   ⠘⠟⠁",
  "   ⢸⣿⣿⣿⡏    ⢠⣿⡀",
  "   ⢸⣿⣿⣿⠁    ⣾⣿⣧",
  "   ⢸⣿⣿⡇    ⢰⣿⣿⣿⡄",
  "   ⢸⣿⣿     ⣿⣿⣿⣿⣧",
  "   ⢸⣿⠇    ⢸⣿⣿⣿⣿⣿⡆",
].map(palette.logo);

const lines = [
  top,
  row(),
  row(headerRow(palette.name("Natsuki Izumi"), logo[0])),
  row(headerRow("", logo[1])),
  row(headerRow("", logo[2])),
  row(headerRow("", logo[3])),
  row(headerRow("", logo[4])),
  row(headerRow("", logo[5])),
  row(headerRow("", logo[6])),
  row(headerRow("", logo[7])),
  row(headerRow("", logo[8])),
  row(headerRow("", logo[9])),
  row(),
  row(`${palette.keyword("INFO")}${palette.punctuation(":")}`),
  row(info("💼", "Role", "Software Engineer")),
  row(info("✉️", "Email", "me@natsuki123.com")),
  row(info("🌐", "Website", "https://natsuki123.com")),
  row(info("🐙", "GitHub", "https://github.com/neural-int")),
  row(info("🧵", "Threads", "https://www.threads.com/@natsuki123_engineer")),
  row(info("𝕏", "X", "@natsuki123_x")),
  row(),
  row(
    palette.muted(
      `© ${new Date().getFullYear()} Natsuki Izumi / %`
    )
  ),
  row(),
  bottom,
];

console.log(lines.join("\n"));
