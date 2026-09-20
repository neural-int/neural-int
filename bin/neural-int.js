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
  logo: (text) => paint("38;5;255", text),
  name: (text) => paint("1;38;5;255", text),
  muted: (text) => paint("38;5;246", text),
  keyword: (text) => paint("1;38;5;114", text),
  key: (text) => paint("38;5;75", text),
  value: (text) => paint("38;5;215", text),
  punctuation: (text) => paint("38;5;250", text),
};

const BODY_WIDTH = 84;
const LOGO_WIDTH = 16;
const COLUMN_GAP = 3;
const LEFT_WIDTH = BODY_WIDTH - LOGO_WIDTH - COLUMN_GAP;
const ansiPattern = /\u001b\[[0-9;]*m/g;

const visibleLength = (text) =>
  Array.from(text.replace(ansiPattern, "")).length;

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

const columns = (left = "", right = "") => {
  const padding = Math.max(
    COLUMN_GAP,
    LEFT_WIDTH - visibleLength(left) + COLUMN_GAP
  );
  return left + " ".repeat(padding) + right;
};

const top = palette.border(`╭${"─".repeat(BODY_WIDTH + 2)}╮`);
const bottom = palette.border(`╰${"─".repeat(BODY_WIDTH + 2)}╯`);

const info = (key, value, comma = true) =>
  `    ${palette.key(key.padEnd(8))}${palette.punctuation(": ")}${palette.value(
    `"${value}"`
  )}${comma ? palette.punctuation(",") : ""}`;

const logo = [
  "    ██████",
  "   ▄█████",
  "   ██████ ▀████▀",
  "  ▄█████   ▀██▀",
  "  ██████    ▀▀",
  "  █████     ▄█",
  " █████▀     ██",
  " █████     ▄███",
  "██████     ████",
  "█████     ▀█████",
].map(palette.logo);

const lines = [
  top,
  row(),
  row(columns(palette.name("Natsuki Izumi"), logo[0])),
  row(columns(palette.muted("Software Engineer"), logo[1])),
  row(columns("", logo[2])),
  row(columns(`${palette.keyword("INFO")} ${palette.punctuation("{")}`, logo[3])),
  row(columns(info("Email", "me@natsuki123.com"), logo[4])),
  row(columns(info("Website", "https://natsuki123.com"), logo[5])),
  row(columns(info("GitHub", "https://github.com/neural-int"), logo[6])),
  row(columns(info("Threads", "https://www.threads.com/@natsuki123_engineer"), logo[7])),
  row(columns(info("X", "@natsuki123_x", false), logo[8])),
  row(columns(palette.punctuation("}"), logo[9])),
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
