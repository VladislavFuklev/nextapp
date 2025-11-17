import Header from '../components/Header';
import WidgetsClient from './dashboard/WidgetsClient';

export default function Page() {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <div className="mx-auto max-w-5xl p-4">
        <WidgetsClient />
      </div>
    </div>
  );
}
