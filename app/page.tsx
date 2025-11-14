import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page() {
  const store = await cookies();
  const isAuthed = store.get('auth')?.value === 'true';
  if (isAuthed) redirect('/dashboard');
  redirect('/login');
}
