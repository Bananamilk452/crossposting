import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Spinner } from "~/components/Spinner";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { blueskySignin, BlueskySignInSchema } from "~/server/bluesky";

interface BlueskySignInModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type BlueskySignInFormData = z.infer<typeof BlueskySignInSchema>;

export function BlueskySignInModal({ open, setOpen }: BlueskySignInModalProps) {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(BlueskySignInSchema),
    defaultValues: {
      handle: "",
    },
  });

  async function onSubmit(data: BlueskySignInFormData) {
    const { url } = await blueskySignin({
      data: {
        handle: data.handle,
      },
    });

    navigate({ href: url });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>블루스카이 로그인</DialogTitle>
          <DialogDescription>
            로그인하려는 계정의 핸들을 입력해주세요. @는 포함하지 마세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="handle"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="example.bsky.social"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="items-center">
          {form.formState.isSubmitting && <Spinner className="mr-2" />}
          <Button
            type="submit"
            form="form"
            disabled={form.formState.isSubmitting}
          >
            로그인
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
