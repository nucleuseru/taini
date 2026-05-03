"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Bolt, Coins, LogOut, Settings, User } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-background/80 fixed inset-x-0 top-0 z-50 flex h-16 items-center gap-6 border-b px-6 backdrop-blur-md">
      <h1 className="mr-auto text-xl font-bold tracking-tighter">TAINI</h1>

      {/* Desktop Navigation Items */}
      <div className="hidden items-center gap-4 md:flex">
        <Badge
          variant="outline"
          className="bg-background/50 flex h-9 items-center rounded-full px-4"
        >
          <Coins className="text-primary mr-2 size-4" />
          <span className="text-sm font-semibold">2,480 Credits</span>
        </Badge>
        <Button
          size="sm"
          className="group h-9 rounded-full hover:bg-yellow-500"
        >
          <Bolt className="mr-1.5 size-4 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold tracking-wide uppercase">
            Upgrade
          </span>
        </Button>
      </div>

      <Dialog>
        <DialogTrigger asChild>
          <Avatar className="ring-offset-background hover:ring-primary/20 size-9 cursor-pointer transition-all hover:ring-2 active:scale-95">
            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
              NU
            </AvatarFallback>
          </Avatar>
        </DialogTrigger>
        <DialogContent className="rounded-3xl sm:max-w-[340px]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Account</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-6 pt-4">
            <div className="flex items-center gap-4">
              <Avatar className="size-12">
                <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                  NU
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-base font-semibold">Nucleus User</span>
                <span className="text-muted-foreground text-xs">
                  user@nucleus.ai
                </span>
              </div>
            </div>

            <Separator className="bg-border/50" />

            {/* Mobile-only credits/upgrade */}
            <div className="flex flex-col gap-3 md:hidden">
              <div className="bg-muted/50 flex items-center justify-between rounded-2xl p-4">
                <div className="flex items-center gap-2">
                  <Coins className="text-primary size-5" />
                  <span className="text-base font-bold">2,480 Credits</span>
                </div>
              </div>
              <Button className="group h-12 w-full rounded-2xl bg-yellow-500 text-black shadow-lg shadow-yellow-500/10 hover:bg-yellow-600 active:scale-[0.98]">
                <Bolt className="mr-2 size-5 transition-transform group-hover:scale-110" />
                <span className="text-sm font-bold uppercase">
                  Upgrade Plan
                </span>
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <Button
                variant="ghost"
                className="hover:bg-accent h-11 justify-start rounded-xl px-3 font-medium transition-colors"
              >
                <User className="mr-3 size-4 opacity-70" />
                Profile Settings
              </Button>
              <Button
                variant="ghost"
                className="hover:bg-accent h-11 justify-start rounded-xl px-3 font-medium transition-colors"
              >
                <Settings className="mr-3 size-4 opacity-70" />
                Preferences
              </Button>
              <div className="my-2 px-3">
                <Separator className="bg-border/50" />
              </div>
              <Button
                variant="ghost"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive h-11 justify-start rounded-xl px-3 font-medium transition-colors"
              >
                <LogOut className="mr-3 size-4 opacity-70" />
                Sign Out
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </nav>
  );
}
