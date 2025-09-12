import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

import { BlueskySignInModal } from "~/components/BlueskySignInModal";
import { BlueskyIcon } from "~/components/icons/BlueskyIcon";
import { MisskeyIcon } from "~/components/icons/MisskeyIcon";
import { TwitterIcon } from "~/components/icons/TwitterIcon";
import { MisskeySignInModal } from "~/components/MisskeySignInModal";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { twitterSignIn } from "~/server/twitter";

interface AddAccountModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function AddAccountModal({ open, setOpen }: AddAccountModalProps) {
  const navigate = useNavigate();
  const [isBlueskyModalOpen, setIsBlueskyModalOpen] = useState(false);
  const [isMisskeyModalOpen, setIsMisskeyModalOpen] = useState(false);

  async function handleTwitterSignin() {
    const { url } = await twitterSignIn();

    navigate({ href: url });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="w-sm">
        <DialogHeader>
          <DialogTitle>계정 추가</DialogTitle>
          <DialogDescription>
            추가할 플랫폼을 선택하세요. (현재는 1개의 플랫폼 당 1개의 계정만
            지원합니다.)
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3">
          <Button variant="outline" size="lg" onClick={handleTwitterSignin}>
            <TwitterIcon className="size-6" />
            트위터로 로그인
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsBlueskyModalOpen(true)}
          >
            <BlueskyIcon className="size-6" />
            블루스카이로 로그인
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={() => setIsMisskeyModalOpen(true)}
          >
            <MisskeyIcon className="size-6" />
            미스키로 로그인
          </Button>
        </div>
      </DialogContent>

      <BlueskySignInModal
        open={isBlueskyModalOpen}
        setOpen={setIsBlueskyModalOpen}
      />

      <MisskeySignInModal
        open={isMisskeyModalOpen}
        setOpen={setIsMisskeyModalOpen}
      />
    </Dialog>
  );
}
