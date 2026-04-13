import { memo } from "react";
import type { Dispatch, SetStateAction } from "react";
import { ChevronRight, Home } from "lucide-react";
import { navigateToFolder } from "../folder-selection";

type FolderBreadcrumbProps = {
  path: string;
  setCurrentPath: Dispatch<SetStateAction<string>>;
  setSelected: Dispatch<SetStateAction<Set<string>>>;
};

export const FolderBreadcrumb = memo(function FolderBreadcrumb({
  path,
  setCurrentPath,
  setSelected,
}: FolderBreadcrumbProps) {
  const parts = path ? path.split("/").filter(Boolean) : [];

  return (
    <nav className="flex items-center gap-1 text-sm">
      <button
        onClick={() => navigateToFolder("", setCurrentPath, setSelected)}
        className="flex items-center gap-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <Home className="size-3.5" />
        <span>Root</span>
      </button>
      {parts.map((part, index) => {
        const partPath = parts.slice(0, index + 1).join("/");
        const isLast = index === parts.length - 1;

        return (
          <span key={partPath} className="flex items-center gap-1">
            <ChevronRight className="size-3.5 text-muted-foreground" />
            {isLast ? (
              <span className="font-medium text-foreground">{part}</span>
            ) : (
              <button
                onClick={() =>
                  navigateToFolder(partPath, setCurrentPath, setSelected)
                }
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {part}
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
});
