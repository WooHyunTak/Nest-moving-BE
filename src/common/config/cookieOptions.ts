export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 1000,
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 7 * 1000,
};

export const deleteCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: 'none' as const,
  path: '/',
  maxAge: 0,
};
