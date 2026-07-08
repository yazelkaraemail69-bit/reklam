import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, verifySessionToken } from "./session";

export {
  SESSION_COOKIE_NAME,
  SESSION_COOKIE,
  createSessionToken,
  verifySessionToken,
  verifyPassword,
  isAdminPasswordConfigured,
} from "./session";

/** Route Handler / Server Component context only (uses next/headers). */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  return verifySessionToken(token);
}
