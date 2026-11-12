import fs from "node:fs";
import path from "node:path";
import type { Player } from "@/features/auth/session";

/** Entry of the untracked `src/data/users.json`. */
export interface UserRecord {
  id: string;
  username: string;
  hash: string;
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), "src/data/users.json");

export function readUsers(file: string = USERS_FILE): UserRecord[] {
  return fs.existsSync(file) ? (JSON.parse(fs.readFileSync(file, "utf8")) as UserRecord[]) : [];
}

export function findPlayerByCode(users: UserRecord[], code: string): Player | null {
  const trimmed = code.trim();
  const user = trimmed ? users.find((u) => u.hash === trimmed) : undefined;
  return user ? { id: user.id, username: user.username } : null;
}
