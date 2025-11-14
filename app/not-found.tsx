import Link from 'next/link';

export default function NotFound() {
  return (
    <main style={{ padding: '2rem' }}>
      <h1>Страница не найдена</h1>
      <p>К сожалению, такой страницы не существует.</p>
      <p>
        <Link href="/">Вернуться на главную</Link>
      </p>
    </main>
  );
}
