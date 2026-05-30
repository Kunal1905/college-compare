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

  const pages = Array.from({ length: totalPages }, (_, index) => index + 1).filter(
    (page) =>
      page === 1 ||
      page === totalPages ||
      Math.abs(page - currentPage) <= 1
  );

  const visiblePages = pages.filter(
    (page, index) => index === 0 || page !== pages[index - 1]
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
          onClick={() => onPageChange(page)}
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
