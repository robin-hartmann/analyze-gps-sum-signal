#!/usr/bin/env node

import meow from 'meow';
import { readFileSync } from 'fs';

import { analyzeGpsSumSignal } from '../lib';
import { RegisterSum, MotherSequenceConfigs } from '../lib/analyzer';

function handleError(message: string, incorrectUsage = false) {
  console.error(message);

  if (incorrectUsage) {
    console.log(cli.help);
    process.exit(2);
  } else {
    process.exit(1);
  }
}

const cli = meow(`
  Usage
    $ analyze-gps-sum-signal <gps-sequence-file>
  Example
    $ analyze-gps-sum-signal ./examples/gps-sequence-1.txt
`);

const sequencePath = cli.input[0];

if (!sequencePath) {
  handleError('gps-sequence-file must be specified', true);
}

let sequence: string;

try {
  sequence = readFileSync(sequencePath, { encoding: 'utf8' });
} catch (e) {
  handleError(`could not read sequence file due to:\n${e}`);
}

// @ts-ignore
const sumSignalStrings = sequence.trim().split(' ');
const sumSignal = sumSignalStrings
  .filter(s => s.trim().length)
  .map(s => parseInt(s.trim(), 10));

if (sumSignal.includes(NaN)) {
  handleError('gps sequence has invalid format; it needs to be a list of numbers separated by spaces');
}

const chipSeqLen = 1023;
const registerSums: RegisterSum[] = [
  { op1idx: 1, op2idx: 5 },
  { op1idx: 2, op2idx: 6 },
  { op1idx: 3, op2idx: 7 },
  { op1idx: 4, op2idx: 8 },
  { op1idx: 0, op2idx: 8 },
  { op1idx: 1, op2idx: 9 },
  { op1idx: 0, op2idx: 7 },
  { op1idx: 1, op2idx: 8 },
  { op1idx: 2, op2idx: 9 },
  { op1idx: 1, op2idx: 2 },
  { op1idx: 2, op2idx: 3 },
  { op1idx: 4, op2idx: 5 },
  { op1idx: 5, op2idx: 6 },
  { op1idx: 6, op2idx: 7 },
  { op1idx: 7, op2idx: 8 },
  { op1idx: 8, op2idx: 9 },
  { op1idx: 0, op2idx: 3 },
  { op1idx: 1, op2idx: 4 },
  { op1idx: 2, op2idx: 5 },
  { op1idx: 3, op2idx: 6 },
  { op1idx: 4, op2idx: 7 },
  { op1idx: 5, op2idx: 8 },
  { op1idx: 0, op2idx: 2 },
  { op1idx: 3, op2idx: 5 },
];
const motherSeqConfigs: MotherSequenceConfigs = [
  [2],
  [1, 2, 5, 7, 8],
];

try {
  analyzeGpsSumSignal(sumSignal, registerSums, { chipSeqLen, motherSeqConfigs });
} catch (e) {
  handleError(`could not finish analysis of gps sum signal due to:\n${e}`);
}
