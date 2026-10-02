export interface PlatformWritingAcceptanceRow {
  points?: number | null;
  writingAccepted?: boolean;
  writingApplied?: boolean;
  writingPoints?: number | null;
  mirrorId?: number | null;
  id?: number;
}

export function platformWritingPointsMismatch(
  row: PlatformWritingAcceptanceRow,
): boolean {
  return (
    row.writingApplied === true &&
    row.points != null &&
    row.writingPoints != null &&
    row.points !== row.writingPoints
  );
}

/** Manual apply only when S2S did not register Grammar or points need correction. */
export function needsManualPlatformWritingAcceptance(
  row: PlatformWritingAcceptanceRow,
): boolean {
  if (row.points == null) {
    return false;
  }
  if (row.writingAccepted === true) {
    return false;
  }
  const mirrorId = row.mirrorId ?? row.id ?? null;
  if (mirrorId == null) {
    return false;
  }
  if (row.writingApplied && !platformWritingPointsMismatch(row)) {
    return false;
  }
  return true;
}
