import HeaderComponent from '@/components/header';
import CategoryViewComponent from '@/components/categoryview';
import Breadcrumbs from '@/components/Breadcrumbs';

export default function CategoryPage() {
  return (
    <div>
      {/* Header */}
      <HeaderComponent />
      
      {/* Category View */}
      <CategoryViewComponent />
    </div>
  );
}
