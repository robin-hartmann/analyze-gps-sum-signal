export interface RegisterSum {
  op1idx: number;
  op2idx: number;
}
export interface ChipSequenceGeneratorConfig {
  chipSeqLen: number;
  motherSeqConfigs: MotherSequenceConfigs;
}

export type MotherSequenceConfig = number[];
export type MotherSequenceConfigs = [MotherSequenceConfig, MotherSequenceConfig];
type CorrelateResult = false | {
  bit: 0 | 1;
  offset: number;
};

export function analyze(
  sumSignal: number[],
  registerSums: RegisterSum[],
  config: ChipSequenceGeneratorConfig,
): void {
  const { chipSeqLen } = config;
  const activeSatellitesCount = sumSignal.reduce(
    (prevMax, curr) => Math.max(prevMax, Math.abs(curr)),
    0,
  );
  const maxDeviation = 65;
  const peak = chipSeqLen - maxDeviation * (activeSatellitesCount - 1);

  registerSums
    .map(registerSum => generateChipSequence(registerSum, config))
    .map(chipSeq => correlate(sumSignal, chipSeq, peak))
    .map((result, idx) => result
      ? `Satellite ${idx + 1} has sent bit ${result.bit} (delta = ${result.offset})`
      : false,
    )
    .filter(Boolean)
    .forEach(output => console.log(output));
}

function generateChipSequence(
  registerSum: RegisterSum,
  config: ChipSequenceGeneratorConfig,
): number[] {
  const { chipSeqLen, motherSeqConfigs } = config;
  // tslint:disable: prefer-array-literal
  const chipSeq: number[] = [];
  const mother1Seq = new Array(10).fill(1);
  // tslint:enable: prefer-array-literal
  const mother2Seq = [...mother1Seq];

  // tslint:disable-next-line: no-increment-decrement
  for (let i = 0; i < chipSeqLen; i++) {
    const mother1Result = mother1Seq[9];
    const mother2Result =
      mother2Seq[registerSum.op1idx] ^ mother2Seq[registerSum.op2idx];

    chipSeq.push(mother1Result ^ mother2Result);
    rotateMotherSequence(mother1Seq, motherSeqConfigs[0]);
    rotateMotherSequence(mother2Seq, motherSeqConfigs[1]);
  }

  return chipSeq;
}

function rotateMotherSequence(
  motherSeq: number[],
  motherSeqConfig: MotherSequenceConfig,
): void {
  const newStart = motherSeqConfig.reduce(
    (acc, idx) => acc ^ motherSeq[idx], motherSeq[9]);

  motherSeq.unshift(newStart);
  motherSeq.pop();
}

function correlate(sumSignal: number[], chipSeq: number[], peak: number): CorrelateResult {
  // tslint:disable-next-line: no-increment-decrement
  for (let offset = 0; offset < chipSeq.length; offset++) {
    const sum = chipSeq.reduce(
      (acc, _, idx) => {
        return acc + (chipSeq[(idx + offset) % chipSeq.length]
          ? sumSignal[idx]
          : -sumSignal[idx]);
      },
      0,
    );

    if (Math.abs(sum) > peak) {
      return ({
        offset,
        bit: sum > 0 ? 1 : 0,
      });
    }
  }

  return false;
}
