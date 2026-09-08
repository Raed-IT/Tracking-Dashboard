"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Columns3,
  MoreHorizontal,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "./Button";
import { EmptyState } from "./Page";
import { useTranslation } from "@/hooks/useTranslation";

export type DataColumn<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  sortValue?: (row: T) => string | number;
  className?: string;
  priority?: boolean;
};

export function AdvancedDataTable<T extends { id: string }>({
  data,
  columns,
  searchPlaceholder = "Search records",
  onRowClick,
  renderBulkActions,
  isLoading = false,
  error,
  onRetry,
}: {
  data: T[];
  columns: DataColumn<T>[];
  searchPlaceholder?: string;
  onRowClick?: (row: T) => void;
  renderBulkActions?: (rows: T[]) => ReactNode;
  isLoading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [sort, setSort] = useState<{ id: string; direction: 1 | -1 } | null>(null);
  const [visible, setVisible] = useState(
    () => new Set(columns.map((column) => column.id)),
  );
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const rows = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    const matches = data.filter((row) =>
      Object.values(row).join(" ").toLowerCase().includes(normalized),
    );

    if (!sort) return matches;

    const column = columns.find((item) => item.id === sort.id);

    return [...matches].sort((a, b) => {
      const av = column?.sortValue?.(a) ?? "";
      const bv = column?.sortValue?.(b) ?? "";

      if (typeof av === "number" && typeof bv === "number") {
        return (av - bv) * sort.direction;
      }

      return (
        String(av).localeCompare(String(bv), undefined, {
          numeric: true,
          sensitivity: "base",
        }) * sort.direction
      );
    });
  }, [data, query, sort, columns]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));

  useEffect(() => {
    setPage((current) => Math.min(Math.max(current, 1), pageCount));
  }, [pageCount]);

  useEffect(() => {
    setPage(1);
  }, [query, pageSize]);

  const paged = rows.slice((page - 1) * pageSize, page * pageSize);
  const selectedRows = data.filter((row) => selected.includes(row.id));

  const allOnPage =
    paged.length > 0 && paged.every((row) => selected.includes(row.id));

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((value) => value !== id)
        : [...current, id],
    );
  };

  const togglePage = () => {
    setSelected((current) =>
      allOnPage
        ? current.filter((id) => !paged.some((row) => row.id === id))
        : Array.from(new Set([...current, ...paged.map((row) => row.id)])),
    );
  };

  const visibleColumns = columns.filter((column) => visible.has(column.id));

  const pages = Array.from({ length: pageCount }, (_, index) => index + 1).filter(
    (value) =>
      value === 1 ||
      value === pageCount ||
      Math.abs(value - page) <= 1,
  );

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/[.07] dark:bg-slate-900/70">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-3 dark:border-white/[.06] sm:flex-row sm:items-center">
        <label className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-slate-500 focus-within:border-cyan-400/40 focus-within:ring-2 focus-within:ring-cyan-400/10 dark:border-white/10 dark:bg-white/[.03]">
          <Search size={16} />
          <input
            className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white dark:placeholder:text-slate-600"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder || t.tables.searchRecords}
          />
        </label>

        <Button size="sm">
          <SlidersHorizontal size={14} />
          Filters
        </Button>

        <details className="relative">
          <summary className="flex h-8 cursor-pointer list-none items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs text-slate-700 dark:border-white/10 dark:bg-white/[.03] dark:text-slate-300">
            <Columns3 size={14} />
            Columns
          </summary>

          <div className="absolute right-0 top-10 z-30 w-52 rounded-xl border border-slate-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-slate-900">
            {columns.map((column) => (
              <label
                key={column.id}
                className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-xs text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={visible.has(column.id)}
                  onChange={() =>
                    setVisible((current) => {
                      const next = new Set(current);
                      if (next.has(column.id)) next.delete(column.id);
                      else next.add(column.id);
                      return next;
                    })
                  }
                />
                {column.header}
              </label>
            ))}
          </div>
        </details>
      </div>

      {selectedRows.length > 0 && (
        <div className="flex items-center gap-3 border-b border-cyan-400/10 bg-cyan-400/[.04] px-4 py-3 text-xs">
          <strong className="text-cyan-700 dark:text-cyan-200">
            {selectedRows.length} {t.tables.selected}
          </strong>
          {renderBulkActions?.(selectedRows)}
        </div>
      )}

      <div className="max-h-[min(62vh,680px)] overflow-auto">
        <table className="w-full min-w-[780px] text-left text-sm">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-[10px] uppercase tracking-[.16em] text-slate-500 backdrop-blur dark:bg-slate-900/95">
            <tr className="border-b border-slate-200 dark:border-white/[.06]">
              <th className="w-11 px-4 py-3">
                <input
                  type="checkbox"
                  checked={allOnPage}
                  onChange={togglePage}
                  aria-label={t.common.selectCurrentPage}
                />
              </th>

              {visibleColumns.map((column) => (
                <th
                  key={column.id}
                  className={`whitespace-nowrap px-4 py-3 ${column.className ?? ""}`}
                >
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 transition hover:text-slate-900 dark:hover:text-white"
                    onClick={() => {
                      if (!column.sortValue) return;

                      setSort((current) =>
                        current?.id === column.id
                          ? {
                              id: column.id,
                              direction: (current.direction * -1) as 1 | -1,
                            }
                          : { id: column.id, direction: 1 },
                      );
                    }}
                  >
                    {column.header}
                    {column.sortValue && <ArrowDownUp size={12} />}
                  </button>
                </th>
              ))}

              <th className="w-10 px-4 py-3">
                <MoreHorizontal size={14} />
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/[.05]">
            {isLoading ? (
              Array.from({ length: 7 }, (_, index) => (
                <tr key={index}>
                  <td />
                  <td colSpan={visibleColumns.length + 1} className="p-4">
                    <div className="h-4 animate-pulse rounded bg-slate-200 dark:bg-white/5" />
                  </td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={visibleColumns.length + 2}>
                  <div className="p-10 text-center text-sm text-slate-500">
                    {t.tables.couldNotLoad}{" "}
                    <button
                      type="button"
                      className="text-cyan-600 dark:text-cyan-300"
                      onClick={onRetry}
                    >
                      Retry
                    </button>
                  </div>
                </td>
              </tr>
            ) : paged.length === 0 ? (
              <tr>
                <td colSpan={visibleColumns.length + 2}>
                  <EmptyState
                    title="Nothing found"
                    description={
                      query
                        ? t.tables.adjustSearch
                        : t.tables.noRecords
                    }
                  />
                </td>
              </tr>
            ) : (
              paged.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onRowClick?.(row)}
                  className={[
                    onRowClick ? "cursor-pointer" : "",
                    "transition-colors hover:bg-slate-50 dark:hover:bg-white/[.025]",
                  ].join(" ")}
                >
                  <td
                    className="px-4 py-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(row.id)}
                      onChange={() => toggle(row.id)}
                    />
                  </td>

                  {visibleColumns.map((column) => (
                    <td
                      key={column.id}
                      className={`whitespace-nowrap px-4 py-3 text-slate-700 dark:text-slate-300 ${column.className ?? ""}`}
                    >
                      {column.cell(row)}
                    </td>
                  ))}

                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) => event.stopPropagation()}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-500 dark:hover:bg-white/5 dark:hover:text-white"
                      aria-label={t.common.moreActions}
                    >
                      <MoreHorizontal size={15} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <footer className="flex flex-col gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500 dark:border-white/[.06] sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span>
            {rows.length === 0
              ? "0 records"
              : `${(page - 1) * pageSize + 1}-${Math.min(
                  page * pageSize,
                  rows.length,
                )} of ${rows.length}`}
          </span>

          <label className="flex items-center gap-2">
            Rows
            <select
              value={pageSize}
              onChange={(event) => setPageSize(Number(event.target.value))}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 outline-none dark:border-white/10 dark:bg-slate-900 dark:text-slate-300"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="icon"
            disabled={page <= 1}
            onClick={() => setPage((value) => value - 1)}
            aria-label={t.common.previous}
          >
            <ChevronLeft size={15} />
          </Button>

          {pages.map((value, index) => {
            const previous = pages[index - 1];
            const gap = previous && value - previous > 1;

            return (
              <span key={value} className="flex items-center">
                {gap && (
                  <span className="px-1 text-slate-400">…</span>
                )}
                <button
                  type="button"
                  onClick={() => setPage(value)}
                  className={[
                    "grid h-8 min-w-8 place-items-center rounded-lg px-2 transition",
                    page === value
                      ? "bg-cyan-400 font-semibold text-slate-950"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:hover:bg-white/5 dark:hover:text-white",
                  ].join(" ")}
                >
                  {value}
                </button>
              </span>
            );
          })}

          <Button
            size="icon"
            disabled={page >= pageCount}
            onClick={() => setPage((value) => value + 1)}
            aria-label={t.common.next}
          >
            <ChevronRight size={15} />
          </Button>
        </div>
      </footer>
    </section>
  );
}
