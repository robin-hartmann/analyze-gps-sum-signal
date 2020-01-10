#!/usr/bin/env node

import meow from 'meow';
import { readFileSync } from 'fs';

import { analyzeGpsSequence } from '../lib';

function handleError(message: string, showHelp = false) {
  console.error(message);

  if (showHelp) {
    console.log(cli.help);
  }

  process.exit(2);
}

const cli = meow(`
  Usage
    $ analyze-gps-sequence <gps-sequence-file>
  Example
    $ dialog-formatter gps_sequence.txt
`);

const sequencePath = cli.input[0];

if (!sequencePath) {
  handleError('gps-sequence-file must be specified', true);
}

let sequenceRaw: string;

try {
  sequenceRaw = readFileSync(sequencePath, { encoding: 'utf8' });
} catch (e) {
  handleError(`could not read sequence file due to:\n${e}`);
}

// @ts-ignore
const sequenceStrings = sequenceRaw.split(' ');
const sequence = sequenceStrings.map(numberString => parseInt(numberString, 10));

if (sequence.includes(NaN)) {
  handleError('gps sequence has invalid format; it needs to be a list of numbers separated by one space each');
}

try {
  analyzeGpsSequence(sequence);
} catch (e) {
  handleError(`could not finish analysis of gps sequence due to:\n${e}`);
}
