import { PlusIcon } from "lucide-react";
import { useRef } from "react";

import { Button } from "~/components/ui/button";

interface FileButtonProps {
  onFileSelect: (file: File) => void;
}

export function FileButton({ onFileSelect }: FileButtonProps) {
  const file = useRef<HTMLInputElement>(null);

  return (
    <>
      <input
        ref={file}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFileSelect(e.target.files[0]);
          }
        }}
      />
      <Button variant="outline" onClick={() => file.current?.click()}>
        <PlusIcon /> 파일 선택
      </Button>
    </>
  );
}
