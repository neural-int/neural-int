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
      " ".repeat(INFO_INDENT) +
      icon +
      `\u001b[${KEY_COLUMN}G` +
      keyText
    );
  }

  return (
    " ".repeat(INFO_INDENT) +
    padVisible(icon, ICON_WIDTH) +
    " " +
    keyText
  );
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
  row(info("", "Threads", "@natsuki123_engineer")),
  row(info("", "X", "@natsuki123_x")),
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
