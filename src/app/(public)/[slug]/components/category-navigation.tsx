"use client"

import { memo, useMemo } from 'react';
import { isDarkColor } from '../theme-utils';

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
  accentColor?: string | null;
}

const CategoryNavigation = memo(function CategoryNavigation({ categories, activeCategory, onChange, accentColor }: CategoryNavigationProps) {
  const accentText = useMemo(() => {
    if (!accentColor) return '#FFFFFF';
    return isDarkColor(accentColor) ? '#FFFFFF' : '#111827';
  }, [accentColor]);

  const scrollToCategory = (categoryName: string, buttonEl: HTMLButtonElement) => {
    onChange(categoryName);

    // Rola o botão clicado para dentro da área visível do scroll horizontal
    buttonEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest', block: 'nearest' });

    // Rola a página até a seção da categoria
    const element = document.getElementById(categoryName.toLowerCase().replace(/\s+/g, '-'));
    if (element) {
      const offset = 140;
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

  const activeStyle = accentColor
    ? { backgroundColor: accentColor, color: accentText, borderColor: accentColor }
    : undefined;

  return (
    <div className="w-full">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5">
        <button
          onClick={(e) => scrollToCategory('all', e.currentTarget)}
          className={`
            whitespace-nowrap px-5 py-2 text-sm font-semibold transition-all duration-150 flex-shrink-0 border rounded-md cursor-pointer
            ${activeCategory === 'all'
              ? (accentColor ? '' : 'bg-primary text-white border-primary')
              : 'bg-white text-gray-600 border-[#E5E2DD] hover:border-gray-400 hover:text-gray-900'}
          `}
          style={activeCategory === 'all' ? activeStyle : undefined}
        >
          Tudo
        </button>

        {categories.map(category => (
          <button
            key={category.id}
            onClick={(e) => scrollToCategory(category.attributes.name, e.currentTarget)}
            className={`
              whitespace-nowrap px-5 py-2 text-sm font-semibold transition-all duration-150 flex-shrink-0 border rounded-md cursor-pointer
              ${activeCategory === category.attributes.name
                ? (accentColor ? '' : 'bg-primary text-white border-primary')
                : 'bg-white text-gray-600 border-[#E5E2DD] hover:border-gray-400 hover:text-gray-900'}
            `}
            style={activeCategory === category.attributes.name ? activeStyle : undefined}
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
