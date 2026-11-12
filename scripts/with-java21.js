#!/usr/bin/env node
/**
 * Runs a command with Java 21+ on JAVA_HOME/PATH, without changing the
 * system default (Android builds stay on Java 17).
 *
 * The Firestore emulator in firebase-tools 15 refuses to start below Java 21.
 *
 * Usage: node scripts/with-java21.js <command> [...args]
 * Lookup order: $JAVA21_HOME, $JAVA_HOME (if 21+), then common install dirs.
 */
const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MIN_JAVA = 21;

/** Major version of the `java` binary in `home`, or 0 if it can't be run. */
const javaMajor = (home) => {
  const bin = path.join(home, 'bin', 'java');
  if (!fs.existsSync(bin)) {
    return 0;
  }
  // `java -version` prints to stderr, e.g. openjdk version "21.0.5" 2024-10-15
  const out = spawnSync(bin, ['-version'], { encoding: 'utf8' }).stderr || '';
  const match = out.match(/version "(\d+)/);
  return match ? Number(match[1]) : 0;
};

/** Subdirectories of `parent`, newest-looking version first. */
const listDirs = (parent) => {
  try {
    return fs
      .readdirSync(parent)
      .sort()
      .reverse()
      .map((name) => path.join(parent, name));
  } catch {
    return [];
  }
};

const candidates = [
  process.env.JAVA21_HOME,
  process.env.JAVA_HOME,
  // Every installed JDK; javaMajor() below picks the first that is 21+
  ...listDirs('/usr/lib/jvm'), // Linux (apt)
  ...listDirs('/Library/Java/JavaVirtualMachines').map((dir) =>
    path.join(dir, 'Contents', 'Home'),
  ), // macOS
].filter(Boolean);

const javaHome = candidates.find((home) => javaMajor(home) >= MIN_JAVA);

if (!javaHome) {
  console.error(
    `Java ${MIN_JAVA}+ not found (needed by the Firestore emulator).\n` +
      'Install it alongside your current JDK, e.g. on Ubuntu:\n' +
      '  sudo apt install openjdk-21-jdk-headless\n' +
      'or point JAVA21_HOME at an existing JDK 21 install.',
  );
  process.exit(1);
}

const [command, ...args] = process.argv.slice(2);
if (!command) {
  console.error('Usage: node scripts/with-java21.js <command> [...args]');
  process.exit(1);
}

const result = spawnSync(command, args, {
  stdio: 'inherit',
  env: {
    ...process.env,
    JAVA_HOME: javaHome,
    PATH: `${path.join(javaHome, 'bin')}${path.delimiter}${process.env.PATH}`,
  },
});
process.exit(result.status ?? 1);
