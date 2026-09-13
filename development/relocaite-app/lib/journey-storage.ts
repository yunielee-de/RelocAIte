import { createProfile, parseProfile, type JourneyProfile } from "./journey-profile";

export const STORAGE_KEY = "relocaite.journey.v1";
type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;
export function loadProfile(storage: StorageLike): { profile: JourneyProfile; notice: string } {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return { profile: createProfile(), notice: "" };
    if (raw.length > 100000) throw new Error("Profile too large");
    return { profile: parseProfile(JSON.parse(raw)), notice: "" };
  } catch {
    return { profile: createProfile(), notice: "Your saved profile could not be read. You can start a new journey; the previous data has not been overwritten." };
  }
}
export function saveProfile(storage: StorageLike, profile: JourneyProfile): boolean {
  try { storage.setItem(STORAGE_KEY, JSON.stringify(profile)); return true; } catch { return false; }
}
export function resetProfile(storage: StorageLike): boolean {
  try { storage.removeItem(STORAGE_KEY); return true; } catch { return false; }
}
