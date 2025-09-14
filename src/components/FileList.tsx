import { XIcon } from "lucide-react";
import { useMemo } from "react";

interface FileListProps {
  files: File[];
  onDelete: (index: number) => void;
}

export function FileList({ files, onDelete }: FileListProps) {
  return (
    <div className="max-h-36 rounded-lg border">
      <div className="flex h-full gap-4 overflow-x-auto p-4">
        {files.length > 0 &&
          files.map((file, index) => (
            <FileListItem
              key={index}
              file={file}
              onDelete={() => onDelete(index)}
            />
          ))}

        {files.length === 0 && (
          <div className="flex items-center justify-center">
            <p className="text-center text-sm text-gray-500">
              선택된 파일이 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function FileListItem({
  file,
  onDelete,
}: {
  file: File;
  onDelete: () => void;
}) {
  const src = useMemo(() => {
    return URL.createObjectURL(file);
  }, [file]);

  return (
    <div className="relative h-28 w-24 shrink-0 rounded-lg border shadow">
      <button
        className="absolute -right-2 -top-2 cursor-pointer rounded-full bg-gray-200 p-1"
        onClick={onDelete}
      >
        <XIcon className="size-4" />
      </button>
      <img src={src} alt={file.name} className="size-full object-contain" />
    </div>
  );
}
