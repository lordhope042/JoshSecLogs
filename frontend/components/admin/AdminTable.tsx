"use client";

import {
  ReactNode,
  useMemo,
} from "react";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (
    value: any,
    row: T,
  ) => ReactNode;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
}

export default function AdminTable<
  T extends Record<string, any>,
>({
  columns,
  data,
  loading = false,
  emptyText = "No data found.",
}: AdminTableProps<T>) {
  const rows = useMemo(
    () => data ?? [],
    [data],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-[#111827]">

      <div className="overflow-x-auto">

        <table className="min-w-full">

          <thead className="bg-[#1f2937]">

            <tr>
              {columns.map((column) => (
                <th
                  key={column.title}
                  className="whitespace-nowrap px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-zinc-400"
                >
                  {column.title}
                </th>
              ))}
            </tr>

          </thead>

          <tbody>

            {loading ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-zinc-500"
                >
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="py-16 text-center text-zinc-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={index}
                  className="border-t border-zinc-800 transition hover:bg-[#1a2233]"
                >
                  {columns.map((column) => (
                    <td
                      key={column.title}
                      className="whitespace-nowrap px-6 py-4 text-sm text-zinc-300"
                    >
                      {column.render
                        ? column.render(
                            row[column.key as keyof T],
                            row,
                          )
                        : String(
                            row[
                              column.key as keyof T
                            ] ?? "-",
                          )}
                    </td>
                  ))}
                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}