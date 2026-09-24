#!/usr/bin/env node

const { version } = require("../package.json");

const args = new Set(process.argv.slice(2));

if (args.has("--help") || args.has("-h")) {
  console.log(`Usage: natsuki-izumi [options]

Natsuki Izumi's terminal profile card.

Options:
  --plain, --no-color  Disable ANSI colors
  --no-animation       Disable the intro animation
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
const animationDisabled = args.has("--no-animation");

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
  value: (text) => paint("38;5;255", text),
  punctuation: (text) => paint("38;5;250", text),
};

// 64 columns keeps the 21-row card close to a physical business-card ratio
// on common monospace terminals, while leaving enough room for all content.
const BODY_WIDTH = 64;
const RIGHT_BORDER_COLUMN = BODY_WIDTH + 4;
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
  const left = `${palette.key(leftKey)}${palette.punctuation(": ")}${palette.value(
    leftValue
  )}`;
  const right = `${palette.key(rightKey)}${palette.punctuation(": ")}${palette.value(
    rightValue
  )}`;
  const line = left + "    " + right;

  return centerLine(line);
};

const rawLogo = [
  "  ⢰⣿⣿⣿⡟",
  "  ⣾⣿⣿⣿⠃⢶⣶⣶⡶",
  " ⢰⣿⣿⣿⡟ ⠈⢿⡿⠁",
  " ⣸⣿⣿⣿⠇  ⢨⡅",
  "⢀⣿⣿⣿⡏   ⣾⣷",
  "⣼⣿⣿⣿⠃  ⢰⣿⣿⡄",
  "⣿⣿⣿⡟   ⣿⣿⣿⣿",
];

const logo = rawLogo.map(palette.logo);
const logoWidth = Math.max(...rawLogo.map(visibleLength));
const rawName = "Natsuki Izumi";
const rawNameWidth = visibleLength(rawName);
const nameLine = palette.name(rawName);
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

const CARD_WIDTH = BODY_WIDTH + 4;
const CARD_HEIGHT = lines.length;
const terminalIsLargeEnough =
  (!process.stdout.columns || process.stdout.columns >= CARD_WIDTH) &&
  (!process.stdout.rows || process.stdout.rows >= CARD_HEIGHT + 1);
const shouldAnimate =
  useTerminalLayout && !animationDisabled && terminalIsLargeEnough;

const CSI = "\u001b[";
const HIDE_CURSOR = `${CSI}?25l`;
const SHOW_CURSOR = `${CSI}?25h`;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const moveToFrameTop = () =>
  "\r" + (CARD_HEIGHT > 1 ? `${CSI}${CARD_HEIGHT - 1}A` : "");

const renderFrame = (frame, redraw = false) => {
  const prefix = redraw ? moveToFrameTop() : "";
  const rendered = frame
    .map((line) => `${CSI}2K\r${line}`)
    .join("\r\n");
  process.stdout.write(prefix + rendered);
};

const buildBorderFrame = (progress) => {
  const clamped = Math.max(0, Math.min(1, progress));
  const horizontalLength =
    1 + Math.floor((CARD_WIDTH - 1) * clamped);
  const verticalLength =
    Math.floor((CARD_HEIGHT - 2) * clamped);

  const topLine =
    horizontalLength >= CARD_WIDTH
      ? palette.borderCyan(
          `╔${"═".repeat(CARD_WIDTH - 2)}╗`
        )
      : palette.borderCyan(
          `╔${"═".repeat(Math.max(0, horizontalLength - 1))}`
        ) + " ".repeat(CARD_WIDTH - horizontalLength);

  const bottomLine =
    horizontalLength >= CARD_WIDTH
      ? palette.borderCoral(
          `╚${"═".repeat(CARD_WIDTH - 2)}╝`
        )
      : " ".repeat(CARD_WIDTH - horizontalLength) +
        palette.borderCoral(
          `${"═".repeat(Math.max(0, horizontalLength - 1))}╝`
        );

  const frame = [topLine];

  for (let rowIndex = 1; rowIndex < CARD_HEIGHT - 1; rowIndex += 1) {
    const showLeft = rowIndex <= verticalLength;
    const showRight =
      rowIndex >= CARD_HEIGHT - 1 - verticalLength;
    const middle = " ".repeat(CARD_WIDTH - 2);

    frame.push(
      (showLeft ? palette.borderCyan("║") : " ") +
        middle +
        (showRight ? palette.borderCoral("║") : " ")
    );
  }

  frame.push(bottomLine);
  return frame;
};

const clampByte = (value) =>
  Math.max(0, Math.min(255, Math.round(value)));

const mixRgb = (from, to, amount) => {
  const t = Math.max(0, Math.min(1, amount));
  return from.map((channel, index) =>
    clampByte(channel + (to[index] - channel) * t)
  );
};

const paintRgb = (text, rgb, bold = false) => {
  if (!useColor) return text;
  const safeRgb = rgb.map(clampByte);
  const prefix = bold ? "1;" : "";
  return paint(
    `${prefix}38;2;${safeRgb[0]};${safeRgb[1]};${safeRgb[2]}`,
    text
  );
};

const SHIMMER_COLORS = [
  [0, 210, 255],   // cyan
  [72, 128, 255],  // blue
  [142, 92, 255],  // violet
  [245, 80, 214],  // magenta
  [255, 104, 120], // coral
  [255, 176, 64],  // orange
  [255, 224, 92],  // yellow
  [92, 224, 190],  // mint
];

const sampleGradient = (colors, position) => {
  const clamped = Math.max(0, Math.min(0.999999, position));
  const scaled = clamped * (colors.length - 1);
  const index = Math.floor(scaled);
  const local = scaled - index;
  return mixRgb(colors[index], colors[index + 1], local);
};

const shimmerText = (text, rowIndex, progress, sweep, bold = false) => {
  if (!useColor) return text;

  const chars = Array.from(text);
  const base = clampByte(42 + 186 * progress);
  const sweepPosition = -10 + sweep * (logoWidth + 30);
  const bandWidth = 14;
  const halfBand = bandWidth / 2;
  const white = [255, 255, 255];

  return chars
    .map((char, columnIndex) => {
      if (char === " ") return char;

      // Slight row offset makes the rainbow travel diagonally across the mark.
      const position = columnIndex + rowIndex * 0.72;
      const distance = position - sweepPosition;
      let rgb = [base, base, base];

      if (Math.abs(distance) <= halfBand) {
        const bandPosition = (distance + halfBand) / bandWidth;
        const spectrum = sampleGradient(SHIMMER_COLORS, bandPosition);
        const edgeFade = 1 - Math.pow(Math.abs(distance) / halfBand, 1.7);
        rgb = mixRgb(rgb, spectrum, 0.96 * edgeFade);

        // A narrow white glint keeps the motion crisp without washing out
        // the spectrum around it.
        if (Math.abs(distance) < 0.75) {
          rgb = mixRgb(rgb, white, 0.58);
        }
      }

      return paintRgb(char, rgb, bold);
    })
    .join("");
};

const buildHeroFrame = (progress, sweep, settle = false) => {
  const frame = buildBorderFrame(1);

  rawLogo.forEach((line, index) => {
    const rendered = settle
      ? palette.logo(line)
      : shimmerText(line, index, progress, sweep);
    frame[2 + index] = row(centerBlockLine(rendered, logoWidth));
  });

  const renderedName = settle
    ? palette.name(rawName)
    : shimmerText(rawName, rawLogo.length + 1, progress, sweep, true);
  frame[10] = row(centerBlockLine(renderedName, rawNameWidth));

  return frame;
};

const buildContentFrame = (lastVisibleLine) => {
  const frame = buildHeroFrame(1, 1, true);

  for (let index = 11; index <= lastVisibleLine; index += 1) {
    frame[index] = lines[index];
  }

  return frame;
};

const renderAnimatedCard = async () => {
  let cursorHidden = false;

  const restoreCursorAndExit = (signal) => {
    if (cursorHidden) {
      process.stdout.write(SHOW_CURSOR);
    }
    process.stdout.write("\r\n");
    process.exit(signal === "SIGINT" ? 130 : 143);
  };

  process.once("SIGINT", restoreCursorAndExit);
  process.once("SIGTERM", restoreCursorAndExit);

  try {
    process.stdout.write(HIDE_CURSOR);
    cursorHidden = true;

    const borderSteps = 28;
    renderFrame(buildBorderFrame(0));

    for (let step = 1; step <= borderSteps; step += 1) {
      await sleep(12);
      renderFrame(buildBorderFrame(step / borderSteps), true);
    }

    await sleep(60);

    const heroSteps = 20;
    for (let step = 0; step <= heroSteps; step += 1) {
      const progress = step / heroSteps;
      const sweep = Math.min(1, progress * 1.18);
      renderFrame(buildHeroFrame(progress, sweep), true);
      await sleep(26);
    }

    renderFrame(buildHeroFrame(1, 1, true), true);
    // Let the completed logo/name composition breathe before revealing INFO.
    await sleep(320);

    const revealSequence = [
      [11, 75],
      [12, 70],
      [13, 34],
      [14, 34],
      [15, 34],
      [16, 60],
      [17, 55],
      [18, 0],
    ];

    for (const [lineIndex, delay] of revealSequence) {
      renderFrame(buildContentFrame(lineIndex), true);
      if (delay > 0) {
        await sleep(delay);
      }
    }

    process.stdout.write("\r\n" + SHOW_CURSOR);
    cursorHidden = false;
  } finally {
    process.removeListener("SIGINT", restoreCursorAndExit);
    process.removeListener("SIGTERM", restoreCursorAndExit);

    if (cursorHidden) {
      process.stdout.write(SHOW_CURSOR);
    }
  }
};

if (shouldAnimate) {
  renderAnimatedCard().catch((error) => {
    process.stdout.write(SHOW_CURSOR + "\r\n");
    console.error(error);
    process.exitCode = 1;
  });
} else {
  console.log(lines.join("\n"));
}
