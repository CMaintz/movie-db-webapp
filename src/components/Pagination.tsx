import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { useFocusable, FocusContext } from '@noriginmedia/norigin-spatial-navigation';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MAX_PAGE_LIMIT = 500;

/** Single focusable pagination button */
const PageBtn: React.FC<{
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  ariaLabel?: string;
  children: React.ReactNode;
}> = ({ onClick, disabled, active, ariaLabel, children }) => {
  const { ref, focused } = useFocusable({ onEnterPress: disabled ? undefined : onClick });
  const base =
    'flex items-center justify-center w-10 h-10 rounded-lg text-sm font-medium transition-colors focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed';
  const variant = active
    ? 'bg-primary text-white'
    : `bg-bg-paper text-white hover:bg-primary/20 ${focused ? 'ring-2 ring-primary' : ''}`;

  return (
    <button
      ref={ref}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={`${base} ${variant}`}
    >
      {children}
    </button>
  );
};

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const safeMax = Math.min(totalPages, MAX_PAGE_LIMIT);
  const showLimitWarning = totalPages > MAX_PAGE_LIMIT;

  const { ref, focusKey } = useFocusable({ focusKey: 'PAGINATION' });

  const pages: (number | '...')[] = [];
  if (safeMax <= 7) {
    for (let i = 1; i <= safeMax; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(safeMax - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < safeMax - 2) pages.push('...');
    pages.push(safeMax);
  }

  return (
    <FocusContext.Provider value={focusKey}>
      <div ref={ref} className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-1 flex-wrap justify-center">
          <PageBtn
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            ariaLabel="First page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </PageBtn>
          <PageBtn
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            ariaLabel="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </PageBtn>

          {pages.map((page, i) =>
            page === '...' ? (
              <span
                key={`ellipsis-${i}`}
                className="w-10 h-10 flex items-center justify-center text-text-secondary"
              >
                …
              </span>
            ) : (
              <PageBtn
                key={page}
                onClick={() => onPageChange(page)}
                active={page === currentPage}
              >
                {page}
              </PageBtn>
            )
          )}

          <PageBtn
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === safeMax}
            ariaLabel="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </PageBtn>
          <PageBtn
            onClick={() => onPageChange(safeMax)}
            disabled={currentPage === safeMax}
            ariaLabel="Last page"
          >
            <ChevronsRight className="w-4 h-4" />
          </PageBtn>
        </div>

        {showLimitWarning && (
          <p className="text-text-secondary text-xs">
            Results limited to {MAX_PAGE_LIMIT} pages due to API constraints
          </p>
        )}
      </div>
    </FocusContext.Provider>
  );
};

export default Pagination;
