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

const BODY_WIDTH = 74;
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

const top = palette.border(`╭${"─".repeat(BODY_WIDTH + 2)}╮`);
const bottom = palette.border(`╰${"─".repeat(BODY_WIDTH + 2)}╯`);

const info = (key, value, comma = true) =>
  `      ${palette.key(key.padEnd(8))}${palette.punctuation(": ")}${palette.value(
    `"${value}"`
  )}${comma ? palette.punctuation(",") : ""}`;

const logo = [
  "   ███",
  " ▄███  ███",
  " ███   ▀▀",
  "▄███    █",
  "███    ███",
].map(palette.logo);

const lines = [
  top,
  row(),
  row(`${logo[0]}        ${palette.name("Natsuki Izumi")}`),
  row(`${logo[1]}      ${palette.muted("Software Engineer")}`),
  row(logo[2]),
  row(`${logo[3]}       ${palette.keyword("INFO")} ${palette.punctuation("{")}`),
  row(`${logo[4]}     ${info("Email", "me@natsuki123.com")}`),
  row(`              ${info("Website", "https://natsuki123.com")}`),
  row(`              ${info("GitHub", "https://github.com/neural-int")}`),
  row(`              ${info("Threads", "@natsuki123_meta")}`),
  row(`              ${info("X", "@natsuki123_x", false)}`),
  row(`              ${palette.punctuation("}")}`),
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
