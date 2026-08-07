const PASSCODE_KEY = "dealroom_passcode";

export function getPasscode(): string {
  return sessionStorage.getItem(PASSCODE_KEY) ?? "";
}

export function savePasscode(passcode: string) {
  sessionStorage.setItem(PASSCODE_KEY, passcode);
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "x-admin-passcode": getPasscode(),
      ...(options.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, body.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}
