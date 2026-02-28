"use client"

import { memo } from 'react';

interface Category {
  id: string;
  attributes: {
    name: string;
    description?: string;
  };
}

interface CategoryNavigationProps {
  categories: Category[];
  activeCategory: string;
  onChange: (category: string) => void;
}

const CategoryNavigation = memo(function CategoryNavigation({ categories, activeCategory, onChange }: CategoryNavigationProps) {
  const scrollToCategory = (categoryName: string) => {
    onChange(categoryName);
    const element = document.getElementById(categoryName.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      const offset = 130; // header (64px) + sticky bar (~66px)
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="w-full overflow-hidden">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={() => scrollToCategory('all')}
          className={`
            whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0
            ${activeCategory === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 hover:text-foreground'}
          `}
        >
          Tudo
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={() => scrollToCategory(category.attributes.name)}
            className={`
              whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 flex-shrink-0
              ${activeCategory === category.attributes.name
                ? 'bg-primary text-white shadow-sm'
                : 'bg-gray-100 text-muted-foreground hover:bg-gray-200 hover:text-foreground'}
            `}
          >
            {category.attributes.name}
          </button>
        ))}
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
});

export default CategoryNavigation;
