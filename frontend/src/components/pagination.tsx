type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const maxVisiblePages = 5;
  const visiblePageCount = Math.min(totalPages, maxVisiblePages);
  const halfWindow = Math.floor(visiblePageCount / 2);
  const startPage = Math.min(
    Math.max(1, currentPage - halfWindow),
    totalPages - visiblePageCount + 1
  );
  const visiblePages = Array.from(
    { length: visiblePageCount },
    (_, index) => startPage + index
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-3">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="cc-button-secondary inline-flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        ‹
      </button>

      {visiblePages.map((page) => (
        <button
          key={page}
          type="button"
          onClick={() => {
            if (page !== currentPage) {
              onPageChange(page);
            }
          }}
          className={`h-10 w-10 rounded-lg border text-sm font-semibold transition ${
            page === currentPage
              ? "border-primary bg-primary text-white"
              : "border-outline-variant bg-surface text-on-surface-variant hover:border-primary hover:text-primary"
          }`}
        >
          {page}
        </button>
      ))}

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="cc-button-secondary inline-flex h-10 w-10 items-center justify-center disabled:cursor-not-allowed disabled:opacity-50"
      >
        ›
      </button>
    </div>
  );
};
