import HeaderComponent from '@/components/header';
import SubcategoryViewComponent from '@/components/subcategoryview';
import Breadcrumbs from '@/components/Breadcrumbs'; // Assuming you have the Breadcrumbs component created


export default function SubcategoryPage() {
  return (
    <div>
      {/* Header */}
      <HeaderComponent />
      
      {/* Subcategory View */}
      <SubcategoryViewComponent />
        {/* Footer */}
        <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
    
  );
}
