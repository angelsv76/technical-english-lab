/**
 * Authentication service for the Teacher Administration Module.
 */

/**
 * Generates a SHA-256 hash of a string.
 * @param message The string to hash.
 * @returns A promise that resolves to the hex representation of the hash.
 */
async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Validates teacher credentials against environment variables.
 * @param username The username entered.
 * @param password The password entered.
 * @returns A promise that resolves to true if credentials are valid, false otherwise.
 */
export async function validateTeacherCredentials(username: string, password: string): Promise<boolean> {
  const adminUser = import.meta.env.VITE_ADMIN_USER;
  const adminHash = import.meta.env.VITE_ADMIN_HASH;

  if (!adminUser || !adminHash) {
    console.error('Admin credentials not configured in environment variables.');
    return false;
  }

  const passwordHash = await sha256(password);

  return username === adminUser && passwordHash === adminHash;
}

/**
 * Checks if the teacher is currently logged in.
 */
export function isTeacherLoggedIn(): boolean {
  return localStorage.getItem('teacherLoggedIn') === 'true';
}

/**
 * Logs out the teacher.
 */
export function logoutTeacher(): void {
  localStorage.removeItem('teacherLoggedIn');
}
