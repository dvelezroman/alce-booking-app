export type PlatformSkillTypeNotify = 'WRITING' | 'SPEAKING';

export interface PlatformSkillAcceptanceRow {
  points?: number | null;
  platformSkillType?: PlatformSkillTypeNotify | null;
  writingAccepted?: boolean;
  writingApplied?: boolean;
  writingPoints?: number | null;
  speakingAccepted?: boolean;
  speakingApplied?: boolean;
  speakingPoints?: number | null;
  mirrorId?: number | null;
  id?: number;
}

export type PlatformWritingAcceptanceRow = PlatformSkillAcceptanceRow;

function skillApplied(row: PlatformSkillAcceptanceRow, skill: PlatformSkillTypeNotify) {
  return skill === 'SPEAKING' ? row.speakingApplied === true : row.writingApplied === true;
}

function skillAccepted(row: PlatformSkillAcceptanceRow, skill: PlatformSkillTypeNotify) {
  return skill === 'SPEAKING'
    ? row.speakingAccepted === true
    : row.writingAccepted === true;
}

function skillPoints(row: PlatformSkillAcceptanceRow, skill: PlatformSkillTypeNotify) {
  return skill === 'SPEAKING' ? row.speakingPoints : row.writingPoints;
}

export function resolvePlatformSkillType(
  row: PlatformSkillAcceptanceRow,
): PlatformSkillTypeNotify {
  return row.platformSkillType === 'SPEAKING' ? 'SPEAKING' : 'WRITING';
}

export function platformSkillPointsMismatch(
  row: PlatformSkillAcceptanceRow,
  skill: PlatformSkillTypeNotify = resolvePlatformSkillType(row),
): boolean {
  return (
    skillApplied(row, skill) === true &&
    row.points != null &&
    skillPoints(row, skill) != null &&
    row.points !== skillPoints(row, skill)
  );
}

/** Manual apply when S2S did not register the skill or points need correction. */
export function needsManualPlatformSkillAcceptance(
  row: PlatformSkillAcceptanceRow,
  skill: PlatformSkillTypeNotify = resolvePlatformSkillType(row),
): boolean {
  if (row.points == null) {
    return false;
  }
  if (skillAccepted(row, skill)) {
    return false;
  }
  const mirrorId = row.mirrorId ?? row.id ?? null;
  if (mirrorId == null) {
    return false;
  }
  if (skillApplied(row, skill) && !platformSkillPointsMismatch(row, skill)) {
    return false;
  }
  return true;
}

export function platformWritingPointsMismatch(
  row: PlatformWritingAcceptanceRow,
): boolean {
  return platformSkillPointsMismatch(row, 'WRITING');
}

export function needsManualPlatformWritingAcceptance(
  row: PlatformWritingAcceptanceRow,
): boolean {
  return needsManualPlatformSkillAcceptance(row, 'WRITING');
}

export function needsManualPlatformSpeakingAcceptance(
  row: PlatformSkillAcceptanceRow,
): boolean {
  return needsManualPlatformSkillAcceptance(row, 'SPEAKING');
}

export function platformSkillAcceptanceLabel(
  skill: PlatformSkillTypeNotify,
): string {
  return skill === 'SPEAKING' ? 'Speaking' : 'Grammar (Writing)';
}

export function isPlatformSkillAccepted(
  row: PlatformSkillAcceptanceRow,
  skill: PlatformSkillTypeNotify = resolvePlatformSkillType(row),
): boolean {
  return skillAccepted(row, skill);
}
