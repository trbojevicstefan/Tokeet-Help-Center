import ArticleView from '@/components/article-view';
import HeaderComponent from '@/components/header';

export default function ArticlePage() {
  return (
    <div>
      {/* Importing the HeaderComponent */}
      <HeaderComponent />
      
      {/* Main Article View */}
      <ArticleView />
       {/* Footer */}
       <footer className="bg-white mt-16 py-4 text-center text-sm text-gray-600">
        Powered by Tokeet
      </footer>
    </div>
  );
}
