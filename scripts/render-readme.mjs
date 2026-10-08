// Renders results/ into README.md between the BENCHMARK markers.
// The workflow writes results/<spec>/<tool>.times (one wall-clock second per run) and
// results/<spec>/<tool>.<run>.txt (the tool's output, ending with "exit <code>").
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const readmePath = path.join(root, 'README.md');
const resultsDir = path.join(root, 'results');

const START = '<!-- BENCHMARK:START -->';
const END = '<!-- BENCHMARK:END -->';

// Must match the workflow: 5 runs, 5 s pause, `timeout -s KILL 300` (exit 137).
const RUNS = 5;
const PAUSE_SECONDS = 5;
const TIMEOUT_MINUTES = 5;
const KILLED_EXIT_CODE = 137;
const MAX_BAR_LENGTH = 40;

const specs = [
  { id: 'stripe', label: 'Stripe, single file', input: 'specs/stripe/spec3.yaml' },
  { id: 'stripe-split', label: 'Stripe, split into files', input: 'specs/stripe-split/openapi.yaml' },
  { id: 'digitalocean', label: 'DigitalOcean, split into files as published', input: 'specs/digitalocean/DigitalOcean-public.v2.yaml' },
  { id: 'github', label: 'GitHub, single file', input: 'specs/github/api.github.com.yaml' },
  { id: 'cloudflare', label: 'Cloudflare, single file', input: 'specs/cloudflare/openapi.yaml' },
  { id: 'azure', label: 'Azure Compute, split into files as published (Swagger 2.0)', input: 'specs/azure/specification/compute/resource-manager/Microsoft.Compute/Compute/stable/2026-04-01/ComputeRP.json' },
  { id: 'aws-ec2', label: 'AWS EC2, single file (third-party conversion)', input: 'specs/aws-ec2/openapi.yaml' },
];

const tools = [
  { id: 'vacuum', name: 'vacuum', parse: parseVacuum },
  { id: 'spectral', name: 'Spectral', parse: parseSpectral },
  { id: 'redocly', name: 'Redocly CLI', parse: parseRedocly },
  { id: 'scalar', name: 'Scalar CLI', parse: parseScalar },
  { id: 'speakeasy', name: 'Speakeasy CLI', parse: parseSpeakeasy },
];

const read = (...parts) => readFileSync(path.join(resultsDir, ...parts), 'utf8');
const stripAnsi = (text) => text.replace(/\x1b\[[0-9;?]*[a-zA-Z]/g, '');
const toNumber = (value) => Number((value ?? '0').replaceAll(',', ''));

function parseRedocly(text) {
  return {
    errors: toNumber(text.match(/failed with (\d+) errors?/)?.[1]),
    warnings: toNumber(text.match(/(?:and|have) (\d+) warnings?/)?.[1]),
    infos: 0,
  };
}

function parseVacuum(text) {
  const summary = text.match(/(?:Failed|Passed) with ([\d,]+) errors?, ([\d,]+) warnings? and ([\d,]+) informs?/);
  return {
    errors: toNumber(summary?.[1]),
    warnings: toNumber(summary?.[2]),
    infos: toNumber(summary?.[3]),
  };
}

function parseSpectral(text) {
  const match = text.match(/\((\d+) errors?, (\d+) warnings?, (\d+) infos?, (\d+) hints?\)/);
  return {
    errors: toNumber(match?.[1]),
    warnings: toNumber(match?.[2]),
    infos: toNumber(match?.[3]) + toNumber(match?.[4]),
  };
}

function parseScalar(text) {
  return {
    errors: toNumber(text.match(/^Errors: ([\d,]+)$/m)?.[1]),
    warnings: toNumber(text.match(/^Warnings: ([\d,]+)$/m)?.[1]),
    infos: 0,
  };
}

function parseSpeakeasy(text) {
  const match = text.match(/linting complete\. (\d+) errors?, (\d+) warnings?, (\d+) hints?/);
  return { errors: toNumber(match?.[1]), warnings: toNumber(match?.[2]), infos: toNumber(match?.[3]) };
}

function result(spec, tool) {
  // The shell also writes "Killed" and "Aborted" lines into this file; keep only the times.
  const times = read(spec.id, `${tool.id}.times`)
    .split('\n')
    .filter((line) => /^[\d.]+$/.test(line))
    .map(Number)
    .sort((left, right) => left - right);
  const output = stripAnsi(read(spec.id, `${tool.id}.1.txt`));
  const exitCode = Number(output.match(/^exit (\d+)$/m)[1]);
  return {
    spec,
    tool,
    timedOut: exitCode === KILLED_EXIT_CODE,
    // A process that died from any other signal exits with 128 + the signal number, for example 134 for SIGABRT.
    crashed: exitCode > 128 && exitCode !== KILLED_EXIT_CODE,
    median: times[Math.floor(times.length / 2)],
    ...tool.parse(output),
  };
}

const results = specs.map((spec) => ({
  spec,
  rows: tools.filter((tool) => existsSync(path.join(resultsDir, spec.id, `${tool.id}.times`))).map((tool) => result(spec, tool)),
}));
// One scale for both tables: the slowest finished run gets the longest bar.
const slowest = Math.max(...results.flatMap(({ rows }) => rows.filter((row) => !row.timedOut && !row.crashed).map((row) => row.median)));

function table(rows) {
  const finished = rows.filter((row) => !row.timedOut && !row.crashed).sort((left, right) => left.median - right.median);
  const unfinished = rows.filter((row) => row.timedOut || row.crashed);

  const header = ['Tool', 'Time (median)', 'Errors', 'Warnings<br>+ info'];
  const align = ['---', '---', '---:', '---:'];
  const lines = [...finished, ...unfinished].map((row) => {
    const name = `[${row.tool.name}](results/${row.spec.id}/${row.tool.id}.1.txt)`;
    if (row.timedOut) {
      return [name, `☠️ > ${TIMEOUT_MINUTES} min`, '', ''];
    }
    if (row.crashed) {
      return [name, '💥 crashed', '', ''];
    }
    const barLength = Math.max(1, Math.round((row.median / slowest) * MAX_BAR_LENGTH));
    return [
      name,
      `${row.median.toFixed(2)} s<br>${'▓'.repeat(barLength)}`,
      row.errors.toLocaleString('en-US'),
      (row.warnings + row.infos).toLocaleString('en-US'),
    ];
  });
  return [header, align, ...lines].map((cells) => `| ${cells.join(' | ')} |`).join('\n');
}

// The lines of one spec section: heading, optional note, input path, and the table.
function section(spec, rows) {
  const lines = [`### ${spec.label}`, ''];
  if (spec.note) {
    lines.push(spec.note, '');
  }
  lines.push(`Input: \`${spec.input}\``, '', table(rows), '');
  return lines;
}

const [runUrl, runDate] = read('run.txt').trim().split('\n');
const rendered = [
  START,
  `Generated ${runDate} by [this workflow run](${runUrl}) on ${read('machine.txt').trim()}`,
  `Latest releases at run time: ${read('versions.txt').trim().split('\n').join(', ')}.`,
  `Each command ran ${RUNS} times, one after another, after a ${PAUSE_SECONDS} s pause; ` +
    'the time is wall-clock from process start to exit, as `time` reports it, and the table shows the median. ' +
    `A command that did not finish within ${TIMEOUT_MINUTES} minutes was killed and not repeated. 💥 marks a command that crashed; its output has the error.`,
  '',
  ...results.flatMap(({ spec, rows }) => section(spec, rows)),
  END,
].join('\n');

const readme = readFileSync(readmePath, 'utf8');
const start = readme.indexOf(START);
const end = readme.indexOf(END) + END.length;
writeFileSync(readmePath, readme.slice(0, start) + rendered + readme.slice(end));
console.log('README.md updated');
