import type { GymSession } from "@/lib/gym-plan-types";

const WEEKDAY_FULL = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday"
] as const;

export type AdminGymPlanRow = {
  day: string;
  title: string;
  exercise: string;
  sets: string;
  reps: string;
  load: string;
  rest: string;
  formCues: string;
};

export function emptyGymPlanRow(): AdminGymPlanRow {
  return { day: "", title: "", exercise: "", sets: "", reps: "", load: "", rest: "", formCues: "" };
}

/** Turn stored sessions into flat grid rows for the admin POST / grid UI. */
export function sessionsToRows(sessions: GymSession[]): AdminGymPlanRow[] {
  const rows: AdminGymPlanRow[] = [];
  for (const s of sessions) {
    const dayLabel =
      typeof s.preferredWeekday === "number" && s.preferredWeekday >= 0 && s.preferredWeekday <= 6
        ? WEEKDAY_FULL[s.preferredWeekday]
        : (s.day?.trim() ?? "");
    const title = s.title?.trim() || s.focus?.trim() || "Session";
    for (const ex of s.exercises) {
      if (!ex.name?.trim()) continue;
      rows.push({
        day: dayLabel,
        title,
        exercise: ex.name,
        sets: ex.sets ?? "",
        reps: ex.reps ?? "",
        load: ex.load ?? "",
        rest: ex.rest ?? "",
        formCues: ex.formCues ?? ""
      });
    }
  }
  return rows.length ? rows : [emptyGymPlanRow()];
}
