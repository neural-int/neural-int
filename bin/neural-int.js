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
const isInteractiveTerminal =
  Boolean(process.stdout.isTTY) && process.env.TERM !== "dumb";
const useTerminalLayout = !forcePlain && isInteractiveTerminal;
const useColor =
  useTerminalLayout && !("NO_COLOR" in process.env);

const paint = (code, text) =>
  useColor ? `\u001b[${code}m${text}\u001b[0m` : text;

const palette = {
  borderCyan: (text) => paint("38;2;0;151;178", text),
  borderCoral: (text) => paint("38;2;204;78;0", text),
  divider: (text) => paint("38;5;240", text),
  logo: (text) => paint("38;5;250", text),
  name: (text) => paint("1;38;5;255", text),
  muted: (text) => paint("38;5;246", text),
  keyword: (text) => paint("1;38;5;255", text),
  key: (text) => paint("1;38;5;255", text),
  value: (text) => paint("38;5;215", text),
  punctuation: (text) => paint("38;5;250", text),
};

const BODY_WIDTH = 84;
const RIGHT_BORDER_COLUMN = BODY_WIDTH + 4;
const KEY_COLUMN = 10;
const SOCIAL_RIGHT_COLUMN = 50;
const INFO_BLOCK_WIDTH = 44;
const INFO_ICON_COLUMN = 3 + Math.floor((BODY_WIDTH - INFO_BLOCK_WIDTH) / 2);
const INFO_KEY_COLUMN = INFO_ICON_COLUMN + 4;
const ansiPattern = /\u001b\[[0-?]*[ -/]*[@-~]/g;

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
  if (useTerminalLayout) {
    return (
      palette.borderCyan("║") +
      " " +
      content +
      `\u001b[${RIGHT_BORDER_COLUMN}G` +
      palette.borderCoral("║")
    );
  }

  const padding = Math.max(0, BODY_WIDTH - visibleLength(content));
  return (
    palette.borderCyan("║") +
    " " +
    content +
    " ".repeat(padding) +
    " " +
    palette.borderCoral("║")
  );
};

const centerBlockLine = (line, blockWidth) => {
  const leftPadding = Math.max(0, Math.floor((BODY_WIDTH - blockWidth) / 2));
  return " ".repeat(leftPadding) + line;
};

const centerLine = (line) =>
  centerBlockLine(line, visibleLength(line));

const top = palette.borderCyan(`╔${"═".repeat(BODY_WIDTH + 2)}╗`);
const bottom = palette.borderCoral(`╚${"═".repeat(BODY_WIDTH + 2)}╝`);

const INFO_INDENT = 4;
const ICON_WIDTH = 2;
const KEY_WIDTH = 8;

const padVisible = (text, width) =>
  text + " ".repeat(Math.max(0, width - visibleLength(text)));

const info = (icon, key, value) => {
  const keyText = `${palette.key(key.padEnd(KEY_WIDTH))}${palette.punctuation(
    ": "
  )}${palette.value(value)}`;

  if (useTerminalLayout) {
    return (
      `\u001b[${INFO_ICON_COLUMN}G` +
      icon +
      `\u001b[${INFO_KEY_COLUMN}G` +
      keyText
    );
  }

  const line =
    padVisible(icon, ICON_WIDTH) +
    " " +
    keyText;

  return centerBlockLine(line, INFO_BLOCK_WIDTH);
};

const socialInfo = (leftKey, leftValue, rightKey, rightValue) => {
  const left = `${palette.key(leftKey.padEnd(KEY_WIDTH))}${palette.punctuation(
    ": "
  )}${palette.value(leftValue)}`;
  const right = `${palette.key(rightKey.padEnd(KEY_WIDTH))}${palette.punctuation(
    ": "
  )}${palette.value(rightValue)}`;

  if (useTerminalLayout) {
    return (
      " ".repeat(INFO_INDENT) +
      `\u001b[${KEY_COLUMN}G` +
      left +
      `\u001b[${SOCIAL_RIGHT_COLUMN}G` +
      right
    );
  }

  const gap = Math.max(4, SOCIAL_RIGHT_COLUMN - KEY_COLUMN - visibleLength(left));
  return " ".repeat(INFO_INDENT) + left + " ".repeat(gap) + right;
};

const logo = [
  "  ⢰⣿⣿⣿⡟",
  "  ⣾⣿⣿⣿⠃⢶⣶⣶⡶",
  " ⢰⣿⣿⣿⡟ ⠈⢿⡿⠁",
  " ⣸⣿⣿⣿⠇  ⢨⡅",
  "⢀⣿⣿⣿⡏   ⣾⣷",
  "⣼⣿⣿⣿⠃  ⢰⣿⣿⡄",
  "⣿⣿⣿⡟   ⣿⣿⣿⣿",
].map(palette.logo);

const logoWidth = Math.max(...logo.map(visibleLength));
const nameLine = palette.name("Natsuki Izumi");
const dividerLine = palette.divider("─".repeat(32));
const socialDividerLine = palette.divider("─".repeat(Math.floor(BODY_WIDTH * 0.8)));

const lines = [
  top,
  row(),
  ...logo.map((line) => row(centerBlockLine(line, logoWidth))),
  row(),
  row(centerLine(nameLine)),
  row(centerLine(dividerLine)),
  row(centerLine(palette.keyword("INFO:"))),
  row(info("💼", "Role", "Software Engineer")),
  row(info("✉️", "Email", "me@natsuki123.com")),
  row(info("🌐", "Website", "https://natsuki123.com")),
  row(info("🐙", "GitHub", "https://github.com/neural-int")),
  row(centerLine(socialDividerLine)),
  row(socialInfo("Threads", "@natsuki123_engineer", "X", "@natsuki123_x")),
  row(),
  bottom,
];

console.log(lines.join("\n"));
