import HeaderComponent from '@/components/header';

import { HelpcenterHomepageComponent } from "@/components/helpcenter-homepage";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <HeaderComponent />  {/* Reusable header with search bar and nav */}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <HelpcenterHomepageComponent /> {/* Include the main help center component here */}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}