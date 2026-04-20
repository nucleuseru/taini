"use client";

import { GoogleIcon } from "@/components/icons/google";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function ContinueWithGoogle() {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);

    void authClient.signIn.social({
      provider: "google",
      callbackURL: "/",
      fetchOptions: {
        onError: ({ error }) => {
          toast.error(error.message);
        },
        onResponse: () => {
          setIsClicked(false);
        },
      },
    });
  };

  return (
    <Button className="w-full py-6" size="lg" onClick={handleClick}>
      {isClicked ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <GoogleIcon className="size-4" />
      )}
      <span>Continue with Google</span>
    </Button>
  );
}
