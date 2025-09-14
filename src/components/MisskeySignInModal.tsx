import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { misskeySignin, MisskeySignInSchema } from "~/server/misskey";

interface MisskeySignInModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

type MisskeySignInFormData = z.infer<typeof MisskeySignInSchema>;

export function MisskeySignInModal({ open, setOpen }: MisskeySignInModalProps) {
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(MisskeySignInSchema),
    defaultValues: {
      hostname: "",
    },
  });

  async function onSubmit(data: MisskeySignInFormData) {
    try {
      const { url } = await misskeySignin({
        data: {
          hostname: data.hostname,
        },
      });

      navigate({ href: url });
    } catch (error) {
      if (error instanceof Error) {
        console.error(error);
        toast.error(error.message);
      }
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>미스키 로그인</DialogTitle>
          <DialogDescription>
            로그인하려는 계정의 서버 도메인을 입력해주세요.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id="form" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="hostname"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      disabled={form.formState.isSubmitting}
                      placeholder="misskey.io"
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
