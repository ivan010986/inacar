import { redirect } from 'next/navigation';

export default function Home() {
  // Redirige al login
  redirect('/login');

  return null; // No necesitas renderizar nada
}