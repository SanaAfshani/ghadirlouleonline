/** کوکی ورود httpOnly است و از جاوااسکریپت پاک نمی‌شود؛ خروج باید از سرور انجام شود */
export async function logoutAdmin(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
}
