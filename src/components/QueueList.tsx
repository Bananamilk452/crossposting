import {
  CheckCircleIcon,
  SquareArrowOutUpRightIcon,
  XCircleIcon,
} from "lucide-react";
import { useContext } from "react";

import { QueueItem, WriterContext } from "~/components/context/WriterContext";
import { BlueskyIcon } from "~/components/icons/BlueskyIcon";
import { MisskeyIcon } from "~/components/icons/MisskeyIcon";
import { TwitterIcon } from "~/components/icons/TwitterIcon";
import { Spinner } from "~/components/Spinner";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export function QueueList() {
  const { queue } = useContext(WriterContext)!;

  return (
    <Card>
      <CardHeader>
        <CardTitle>전송 대기열</CardTitle>
      </CardHeader>

      <CardContent>
        <ul className="flex max-h-96 flex-col gap-2 overflow-y-auto rounded-lg border p-4">
          {queue.map((item) => (
            <QueueListItem key={item.id} item={item} />
          ))}

          {queue.length === 0 && (
            <p className="text-center text-sm text-gray-600">
              전송 대기열이 비어있습니다.
            </p>
          )}
        </ul>
      </CardContent>
    </Card>
  );
}

function QueueListItem({ item }: { item: QueueItem }) {
  return (
    <li className="flex items-center gap-2 rounded-lg border p-3">
      {item.platform === "twitter" && (
        <TwitterIcon className="size-6 shrink-0" />
      )}
      {item.platform === "bluesky" && (
        <BlueskyIcon className="size-6 shrink-0" />
      )}
      {item.platform === "misskey" && (
        <MisskeyIcon className="size-6 shrink-0" />
      )}

      {item.status === "pending" && <Spinner />}
      {item.status === "success" && (
        <CheckCircleIcon className="size-5 shrink-0 text-green-600" />
      )}
      {item.status === "error" && (
        <XCircleIcon className="size-5 shrink-0 text-red-600" />
      )}

      {item.content && (
        <p className="line-clamp-1 shrink overflow-hidden text-ellipsis text-sm text-gray-600">
          {item.content.slice(0, 50)}
        </p>
      )}
      <p className="shrink-0 overflow-hidden text-ellipsis text-sm">
        {item.message}
      </p>

      {item.status === "success" && (
        <a
          href={item.link}
          className="ml-2 flex shrink-0 cursor-pointer items-center gap-1 text-sm text-blue-600 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <SquareArrowOutUpRightIcon className="inline size-4" />
          링크
        </a>
      )}
    </li>
  );
}
