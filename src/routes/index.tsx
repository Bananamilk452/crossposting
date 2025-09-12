import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { AccountList } from "~/components/AccountList";
import { AddAccountModal } from "~/components/AddAccountModal";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { SELECTION_LOCAL_STORAGE_KEY } from "~/constants";
import { getSessionQueryOptions } from "~/server/session";

export const Route = createFileRoute("/")({
  component: Home,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getSessionQueryOptions);
  },
});

function Home() {
  const [selection, setSelection] = useState<string[]>(
    JSON.parse(localStorage.getItem(SELECTION_LOCAL_STORAGE_KEY) || "[]"),
  );
  const [isAddAccountModalOpen, setIsAddAccountModalOpen] = useState(false);

  const { data: session } = useSuspenseQuery(getSessionQueryOptions);

  const isEmpty = !session.twitter && !session.bluesky && !session.misskey;

  function setSelectionAndStore(newSelection: string[]) {
    setSelection(newSelection);
    localStorage.setItem(
      SELECTION_LOCAL_STORAGE_KEY,
      JSON.stringify(newSelection),
    );
  }
  return (
    <div className="mx-auto w-1/2 p-4">
      <Card>
        <CardHeader>
          <CardTitle>계정 목록</CardTitle>
          <CardAction>
            <Button onClick={() => setIsAddAccountModalOpen(true)}>
              <PlusIcon />
              계정 추가
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-3">
            <AccountList
              session={session}
              selection={selection}
              setSelection={setSelectionAndStore}
            />

            {isEmpty && (
              <p className="py-4 text-center text-sm text-gray-500">
                추가된 계정이 없습니다. "계정 추가" 버튼을 눌러 계정을 추가해
                주세요.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <AddAccountModal
        open={isAddAccountModalOpen}
        setOpen={setIsAddAccountModalOpen}
      />
    </div>
  );
}
