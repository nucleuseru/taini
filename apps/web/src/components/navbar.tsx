"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from "@/hooks/use-mobile";
import { authClient } from "@/lib/auth-client";
import { getInitials } from "@/lib/utils";
import { Bolt, BoltIcon, Coins, CoinsIcon, LogOutIcon } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "./ui/skeleton";

export interface NavbarProps {
  LeftComponent?: React.ReactNode;
  CenterComponent?: React.ReactNode;
  RightComponent?: React.ReactNode;
}

export function Navbar({
  LeftComponent,
  CenterComponent,
  RightComponent,
}: NavbarProps) {
  const isMobile = useIsMobile();
  const { data, isPending } = authClient.useSession();

  return (
    <nav className="bg-background/50 fixed inset-x-0 top-0 z-50 flex items-center gap-2 px-4 py-4 backdrop-blur-md sm:gap-4 sm:px-6 lg:gap-6">
      {LeftComponent}
      <Link href="/" className="mr-auto">
        <h1 className="text-lg font-bold tracking-tighter sm:text-xl">TAINI</h1>
      </Link>
      {CenterComponent}
      <div className="hidden items-center gap-4 md:flex">
        <Badge
          variant="outline"
          className="bg-background/50 flex h-8 items-center rounded-full px-4"
        >
          <Coins className="text-primary mr-2 size-4" />
          <span className="text-sm font-semibold">2,480 Credits</span>
        </Badge>
        <Button size="sm" className="group rounded-full hover:bg-yellow-500">
          <Bolt className="mr-1.5 size-4 transition-transform group-hover:scale-110" />
          <span className="text-xs font-bold tracking-wide uppercase">
            Upgrade
          </span>
        </Button>
      </div>

      {isPending ? (
        <Skeleton className="bg-primary/10 size-8 rounded-full" />
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="ring-offset-background hover:ring-primary/20 size-9 cursor-pointer transition-all hover:ring-2 active:scale-95">
              <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                {getInitials(data?.user.name ?? "")}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-64" align="end">
            <DropdownMenuLabel className="flex flex-col gap-1">
              <p className="text-sm leading-none font-semibold">
                {data?.user.name}
              </p>
              <p className="text-muted-foreground text-xs leading-none">
                {data?.user.email}
              </p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border/50" />

            {isMobile && (
              <>
                <DropdownMenuItem>
                  <CoinsIcon className="text-primary" />
                  <span>2,480 Credits</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="group">
                  <BoltIcon />
                  <span>Upgrade</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border/50" />
              </>
            )}

            <DropdownMenuItem variant="destructive">
              <LogOutIcon />
              <span>Sign Out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
      {RightComponent}
    </nav>
  );
}
