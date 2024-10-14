import { ThemeableTextAnimation } from "@/components/helpcenter-homepage";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main >
        <ThemeableTextAnimation /> {/* Include the main help center component here */}
      </main>

      {/* Footer */}
      <footer className="bg-white mt-16 py-0 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}
