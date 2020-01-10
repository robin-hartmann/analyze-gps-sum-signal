export function analyzeGpsSequence(sequence: number[]) {
  const expectedLength = 1023;

  if (sequence.length === expectedLength) {
    console.log(`the sequence does have the expected length of ${expectedLength} numbers`);
  } else {
    throw new Error(`expected a sequence length of ${expectedLength} numbers, but got ${sequence.length} numbers instead`);
  }
}
