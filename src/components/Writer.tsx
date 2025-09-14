import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { EarthIcon, HomeIcon, LockIcon } from "lucide-react";
import { useContext, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import { WriterContext } from "~/components/context/WriterContext";
import { FileButton } from "~/components/FileButton";
import { FileList } from "~/components/FileList";
import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { Textarea } from "~/components/ui/textarea";
import { MISSKEY, VISIBILITY_LOCAL_STORAGE_KEY } from "~/constants";
import { Session } from "~/lib/session";
import { blueskyPost, blueskyUploadFile } from "~/server/bluesky";
import { misskeyPost } from "~/server/misskey";
import { twitterPost } from "~/server/twitter";

const writerFormSchema = z.object({
  content: z.string(),
  visibility: z.enum(MISSKEY.VISIBILITIES),
  files: z.array(z.instanceof(File)),
});

type WriterFormData = z.infer<typeof writerFormSchema>;

interface WriterProps {
  session: Session;
  selection: string[];
}

export function Writer({ session, selection }: WriterProps) {
  const { addToQueue, updateQueueItem } = useContext(WriterContext)!;

  const hasMisskey = selection.includes("misskey");
  const localStorageVisibility =
    typeof localStorage !== "undefined"
      ? localStorage.getItem(VISIBILITY_LOCAL_STORAGE_KEY) || "public"
      : "public";

  const form = useForm({
    resolver: zodResolver(writerFormSchema),
    defaultValues: {
      content: "",
      visibility: MISSKEY.VISIBILITIES.includes(localStorageVisibility)
        ? localStorageVisibility
        : "public",
      files: [],
    },
  });

  const content = form.watch("content");
  const visibility = form.watch("visibility");
  const files = form.watch("files");

  useEffect(() => {
    localStorage.setItem(VISIBILITY_LOCAL_STORAGE_KEY, visibility);
  }, [visibility]);

  function handleFileSelect(f: File[]) {
    form.setValue("files", [...files, ...f]);
  }

  function handleFileDelete(index: number) {
    form.setValue(
      "files",
      files.filter((_, i) => i !== index),
    );
  }

  const { mutate: twitterPostMutate } = useMutation({
    mutationFn: (data: { id: string; content: string }) =>
      twitterPost({ data }),
    onMutate: (data) => {
      addToQueue({
        platform: "twitter",
        id: data.id,
        status: "pending",
        message: "작성 중...",
        content: data.content,
      });
    },
    onSuccess: (data, variables) => {
      updateQueueItem(variables.id, {
        status: "success",
        message: "작성 완료",
        link: `https://twitter.com/${session.twitter?.id}/status/${data.id}`,
        content: variables.content,
      });
    },
    onError: (error, variables) => {
      updateQueueItem(variables.id, {
        status: "error",
        message: (error as Error).message,
      });
    },
  });

  type BlueskyImage = Awaited<ReturnType<typeof blueskyUploadFile>>;
  const { mutate: blueskyPostMutate } = useMutation({
    mutationFn: (data: {
      id: string;
      content: string;
      images: BlueskyImage[];
    }) => blueskyPost({ data }),
    onMutate: (data) => {
      addToQueue({
        platform: "bluesky",
        id: data.id,
        status: "pending",
        message: "작성 중...",
        content: data.content,
      });
    },
    onSuccess: (data, variables) => {
      updateQueueItem(variables.id, {
        status: "success",
        message: "작성 완료",
        link: `https://bsky.app/profile/${session.bluesky?.handle}/post/${data.id}`,
        content: variables.content,
      });
    },
    onError: (error, variables) => {
      updateQueueItem(variables.id, {
        status: "error",
        message: (error as Error).message,
      });
    },
  });

  const { mutate: misskeyPostMutate } = useMutation({
    mutationFn: (data: { id: string; content: string; visibility: string }) =>
      misskeyPost({ data }),
    onMutate: (data) => {
      addToQueue({
        platform: "misskey",
        id: data.id,
        status: "pending",
        message: "작성 중...",
        content: data.content,
      });
    },
    onSuccess: (data, variables) => {
      updateQueueItem(variables.id, {
        status: "success",
        message: "작성 완료",
        link: `https://${session.misskey?.host}/notes/${data.id}`,
        content: variables.content,
      });
    },
    onError: (error, variables) => {
      updateQueueItem(variables.id, {
        status: "error",
        message: (error as Error).message,
      });
    },
  });

  function onSubmit(data: WriterFormData) {
    selection.forEach(async (platform) => {
      if (platform === "twitter") {
        const id = crypto.randomUUID();
        twitterPostMutate({ id, content: data.content });
      }

      if (platform === "bluesky") {
        const id = crypto.randomUUID();
        const files = data.files.slice(0, 4); // 최대 4장
        const images =
          (await Promise.all(
            files.map((file) => {
              const formData = new FormData();
              formData.append("file", file);
              return blueskyUploadFile({ data: formData });
            }),
          )) || [];
        blueskyPostMutate({ id, content: data.content, images });
      }

      if (platform === "misskey") {
        const id = crypto.randomUUID();
        misskeyPostMutate({
          id,
          content: data.content,
          visibility: data.visibility,
        });
      }
    });

    form.setValue("content", "");
  }

  return (
    <div className="flex flex-col gap-3">
      <Form {...form}>
        <form
          id="writer"
          className="flex flex-col gap-3"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    className="h-48 resize-none"
                    placeholder="무슨 일이 일어나고 있나요?"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FileList files={files} onDelete={handleFileDelete} />

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-gray-600">{content.length}</p>

            <div className="grow" />

            {form.formState.isSubmitting && <Spinner />}

            {hasMisskey && (
              <FormField
                control={form.control}
                name="visibility"
                render={({ field }) => (
                  <FormItem>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="공개 범위" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">
                          <EarthIcon />
                          공개
                        </SelectItem>
                        <SelectItem value="home">
                          <HomeIcon />홈
                        </SelectItem>
                        <SelectItem value="followers">
                          <LockIcon />
                          팔로워
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            )}

            <FileButton onFileSelect={handleFileSelect} />

            <Button
              type="submit"
              form="writer"
              disabled={
                form.formState.isSubmitting ||
                (content.length === 0 && files.length === 0) ||
                selection.length === 0
              }
            >
              글 작성
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
