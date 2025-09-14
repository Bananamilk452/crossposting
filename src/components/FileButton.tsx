import { PlusIcon } from "lucide-react";
import { useRef } from "react";

import { Button } from "~/components/ui/button";

interface FileButtonProps {
  onFileSelect: (file: File[]) => void;
}

export function FileButton({ onFileSelect }: FileButtonProps) {
  const file = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={file}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(Array.from(e.target.files));
          }
        }}
      />
      <Button
        className="size-9 sm:size-auto"
        type="button"
        variant="outline"
        onClick={() => file.current?.click()}
      >
        <PlusIcon /> <span className="sr-only sm:not-sr-only">파일 선택</span>
      </Button>
    </>
  );
}
