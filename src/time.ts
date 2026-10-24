/** Interpret a creator-entered wall-clock time in London, independent of device timezone. */
export function londonLocalToISO(value: string): string {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value))
    throw new Error("Choose a valid launch date and time.");
  const guess = new Date(value + "Z");
  if (!Number.isFinite(guess.getTime()))
    throw new Error("Choose a valid launch date and time.");
  const zone =
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/London",
      timeZoneName: "shortOffset",
    })
      .formatToParts(guess)
      .find((p) => p.type === "timeZoneName")?.value || "GMT";
  const match = zone.match(/GMT([+-])(\d+)(?::(\d+))?/);
  const offset = match
    ? (match[1] === "-" ? -1 : 1) *
      (Number(match[2]) * 60 + Number(match[3] || 0))
    : 0;
  const result = new Date(guess.getTime() - offset * 60000);
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(result);
  const part = (key: string) => parts.find((p) => p.type === key)?.value;
  if (
    `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}` !==
    value
  )
    throw new Error(
      "That London time does not exist because of a clock change. Choose another time.",
    );
  return result.toISOString();
}
