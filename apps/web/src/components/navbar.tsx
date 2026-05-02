import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bolt, Coins } from "lucide-react";

export function Navbar() {
  return (
    <nav className="bg-background fixed inset-x-0 top-0 z-50 flex items-center gap-6 px-6 py-4">
      <h1 className="mr-auto text-xl">TAINI</h1>

      <Badge variant="outline" className="h-8 rounded-full px-3">
        <Coins className="text-primary mr-2 size-3" />
        <span className="text-xs font-semibold">2,480 Credits</span>
      </Badge>
      <Button size="sm" className="group rounded-full hover:bg-yellow-500">
        <Bolt className="size-3 transition-transform group-hover:scale-110" />
        <span className="text-xs font-bold">UPGRADE</span>
      </Button>
      <Avatar>
        <AvatarFallback>NU</AvatarFallback>
      </Avatar>
    </nav>
  );
}
