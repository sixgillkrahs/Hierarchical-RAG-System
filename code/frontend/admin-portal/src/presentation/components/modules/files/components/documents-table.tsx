import { memo } from "react";
import { FileText } from "lucide-react";
import type { DocumentItem } from "@/domain/entities/document.entity";
import { Badge } from "../../../ui/badge";
import { Skeleton } from "../../../ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../ui/table";

type DocumentStatusBadgeVariant =
  | "secondary"
  | "success"
  | "warning"
  | "destructive";

type DocumentsTableProps = {
  currentPath: string;
  documents: DocumentItem[];
  isLoading: boolean;
};

const formatFileSize = (size?: number | null) => {
  if (typeof size !== "number" || Number.isNaN(size) || size < 0) {
    return "--";
  }

  if (size < 1024) {
    return `${size} B`;
  }

  const units = ["KB", "MB", "GB", "TB"];
  let nextSize = size / 1024;
  let unitIndex = 0;

  while (nextSize >= 1024 && unitIndex < units.length - 1) {
    nextSize /= 1024;
    unitIndex += 1;
  }

  return `${nextSize.toFixed(nextSize >= 10 ? 0 : 1)} ${units[unitIndex]}`;
};

const formatDateTime = (value?: string | null) => {
  if (!value) {
    return "--";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString("vi-VN");
};

const getStatusVariant = (
  status?: string | null,
): DocumentStatusBadgeVariant => {
  switch (status) {
    case "ready":
    case "uploaded":
      return "success";
    case "processing":
      return "warning";
    case "failed":
      return "destructive";
    default:
      return "secondary";
  }
};

const getStatusLabel = (status?: string | null) => {
  switch (status) {
    case "ready":
      return "Ready";
    case "uploaded":
      return "Uploaded";
    case "processing":
      return "Processing";
    case "failed":
      return "Failed";
    default:
      return "Unknown";
  }
};

export const DocumentsTable = memo(function DocumentsTable({
  currentPath,
  documents,
  isLoading,
}: DocumentsTableProps) {
  return (
    <Table className="min-w-[720px]">
      <TableHeader>
        <TableRow>
          <TableHead>Document</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Uploaded</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <TableRow key={`document-skeleton-${index}`}>
              <TableCell>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-64" />
                </div>
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-5 w-24 rounded-full" />
              </TableCell>
              <TableCell className="text-right">
                <Skeleton className="ml-auto h-4 w-32" />
              </TableCell>
            </TableRow>
          ))
        ) : documents.length === 0 ? (
          <TableRow>
            <TableCell
              colSpan={5}
              className="h-28 text-center text-muted-foreground"
            >
              {currentPath
                ? "No documents have been uploaded in this folder yet."
                : "No root-level documents have been uploaded yet."}
            </TableCell>
          </TableRow>
        ) : (
          documents.map((document) => (
            <TableRow key={document.id ?? document.path ?? document.name}>
              <TableCell>
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 rounded-lg border border-border/70 bg-muted/40 p-2 text-muted-foreground">
                    <FileText className="size-4" />
                  </div>
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-foreground">
                      {document.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {document.path || document.folderPath || "root"}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {document.mimeType || "--"}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatFileSize(document.size)}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(document.status)}>
                  {getStatusLabel(document.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatDateTime(document.uploadedAt ?? document.createdAt)}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
});
