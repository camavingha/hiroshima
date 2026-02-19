import Sidebar from '@/components/habits/Sidebar';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Sidebar />
        <main className="ml-64 p-8"> {/* ml-64 pushes content to the right of Sidebar */}
          {children}
        </main>
      </body>
    </html>
  );
}