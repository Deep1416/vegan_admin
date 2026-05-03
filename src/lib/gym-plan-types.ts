export type GymExercise = {
  name: string;
  sets: string;
  reps: string;
  load: string;
  rest: string;
  note?: string;
  formCues?: string;
};

export type GymSession = {
  day: string;
  focus: string;
  objective: string;
  title?: string;
  subtitle?: string;
  exercises: GymExercise[];
  preferredWeekday?: number | null;
};

const emptyExercise = (): GymExercise => ({
  name: "",
  sets: "",
  reps: "",
  load: "",
  rest: "",
  note: "",
  formCues: ""
});

export function parseGymSessionsJson(raw: string): GymSession[] {
  try {
    const p = JSON.parse(raw) as unknown;
    if (!Array.isArray(p) || p.length === 0) return [];
    return p.map((item: any) => ({
      day: typeof item?.day === "string" ? item.day : "Day",
      focus: typeof item?.focus === "string" ? item.focus : "",
      objective: typeof item?.objective === "string" ? item.objective : "",
      title: typeof item?.title === "string" ? item.title : undefined,
      subtitle: typeof item?.subtitle === "string" ? item.subtitle : undefined,
      preferredWeekday:
        typeof item?.preferredWeekday === "number" &&
        item.preferredWeekday >= 0 &&
        item.preferredWeekday <= 6
          ? item.preferredWeekday
          : null,
      exercises: Array.isArray(item?.exercises)
        ? item.exercises.map((ex: any) => ({
            name: typeof ex?.name === "string" ? ex.name : "",
            sets: typeof ex?.sets === "string" ? ex.sets : "",
            reps: typeof ex?.reps === "string" ? ex.reps : "",
            load: typeof ex?.load === "string" ? ex.load : "",
            rest: typeof ex?.rest === "string" ? ex.rest : "",
            note: typeof ex?.note === "string" ? ex.note : undefined,
            formCues: typeof ex?.formCues === "string" ? ex.formCues : undefined
          }))
        : [emptyExercise()]
    }));
  } catch {
    return [];
  }
}

export function emptySession(): GymSession {
  return {
    day: "New day",
    focus: "",
    objective: "",
    title: "",
    subtitle: "",
    exercises: [emptyExercise()]
  };
}
