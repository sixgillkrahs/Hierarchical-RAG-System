import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";
import { Skeleton } from "./skeleton";
import { cn } from "@/infrastructure/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "./pagination";

export interface ColumnDef<TData> {
  header: React.ReactNode;
  accessorKey?: keyof TData;
  cell?: (item: TData, index: number) => React.ReactNode;
  className?: string; // Appends to both header and cell
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  emptyMessage?: React.ReactNode;
  className?: string;
  isLoading?: boolean;
  skeletonRows?: number;
  pagination?: {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
}

export function DataTable<TData>({
  columns,
  data,
  emptyMessage = "No data available.",
  className,
  isLoading = false,
  skeletonRows = 5,
  pagination,
}: DataTableProps<TData>) {
  return (
    <div className="space-y-4">
      <Table className={className}>
        <TableHeader>
          <TableRow>
            {columns.map((col, index) => (
              <TableHead
                key={index}
                className={cn(col.className, col.headerClassName)}
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: skeletonRows }).map((_, rowIndex) => (
              <TableRow key={`skeleton-${rowIndex}`}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={`skeleton-cell-${colIndex}`}
                    className={cn(col.className, col.cellClassName)}
                  >
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center text-muted-foreground"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={colIndex}
                    className={cn(col.className, col.cellClassName)}
                  >
                    {col.cell
                      ? col.cell(row, rowIndex)
                      : col.accessorKey
                        ? (row[col.accessorKey] as React.ReactNode)
                        : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {pagination && data.length > 0 && !isLoading && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex-1 text-sm text-muted-foreground">
            Đang hiển thị trang{" "}
            <span className="font-medium">{pagination.page}</span> trên tổng số{" "}
            <span className="font-medium">{pagination.totalPages}</span> trang
          </div>
          <Pagination className="justify-end w-auto mx-0">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  text="Trước"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page > 1) {
                      pagination.onPageChange(Math.max(1, pagination.page - 1));
                    }
                  }}
                  aria-disabled={pagination.page <= 1}
                  className={
                    pagination.page <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  href="#"
                  text="Sau"
                  onClick={(e) => {
                    e.preventDefault();
                    if (pagination.page < pagination.totalPages) {
                      pagination.onPageChange(
                        Math.min(pagination.totalPages, pagination.page + 1),
                      );
                    }
                  }}
                  aria-disabled={pagination.page >= pagination.totalPages}
                  className={
                    pagination.page >= pagination.totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
