export interface QuizSettings {
  selectedModes: string[];
  selectedLines: string[];
  showConnections: boolean;
  showMap: boolean;
  /** Draw stations not found yet as gray dots on the map. */
  showUnfoundOnMap: boolean;
}

export const SETTINGS_STORAGE_KEY = "metro-quiz-settings";

export const DEFAULT_SETTINGS: QuizSettings = {
  selectedModes: ["METRO"],
  selectedLines: [],
  showConnections: true,
  showMap: false,
  showUnfoundOnMap: true,
};

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every((item) => typeof item === "string");

export function parseStoredSettings(raw: string | null): QuizSettings {
  let data: Record<string, unknown> = {};
  try {
    const parsed: unknown = JSON.parse(raw ?? "{}");
    if (parsed && typeof parsed === "object") data = parsed as Record<string, unknown>;
  } catch {
    // Corrupt value: use the defaults.
  }
  const list = (key: "selectedModes" | "selectedLines") => (isStringList(data[key]) ? data[key] : DEFAULT_SETTINGS[key]);
  const flag = (key: "showConnections" | "showMap" | "showUnfoundOnMap") =>
    typeof data[key] === "boolean" ? data[key] : DEFAULT_SETTINGS[key];
  return {
    selectedModes: list("selectedModes"),
    selectedLines: list("selectedLines"),
    showConnections: flag("showConnections"),
    showMap: flag("showMap"),
    showUnfoundOnMap: flag("showUnfoundOnMap"),
  };
}
