import { analyze, ChipSequenceGeneratorConfig, RegisterSum } from './analyzer';

const requiredSumSignalLength = 1023;

export function analyzeGpsSumSignal(
  sumSignal: number[],
  registerSums: RegisterSum[],
  config: ChipSequenceGeneratorConfig,
) {
  if (sumSignal.length !== requiredSumSignalLength) {
    throw new Error(`expected a sum signal length of ${requiredSumSignalLength} numbers, but got ${sumSignal.length} numbers instead`);
  }

  analyze(sumSignal, registerSums, config);
}
