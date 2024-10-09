import HeaderComponent from '@/components/header';
import SearchPageComponent from '@/components/searchview';

export default function SearchPage() {
  return (
    <div>
      {/* Importing the HeaderComponent */}
      <HeaderComponent />
      
      {/* Main Search Page Component */}
      <SearchPageComponent />
    </div>
  );
}
