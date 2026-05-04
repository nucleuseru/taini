"use client";

import * as Dialog from "@/components/ui/dialog";
import * as Drawer from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

// Factory to create DrawerDialog* components
function createDrawerDialogComponent<
  KD extends keyof typeof Dialog,
  KR extends keyof typeof Drawer,
>(dialogComp: KD, drawerComp: KR) {
  type DialogProps = React.ComponentProps<(typeof Dialog)[KD]>;
  type DrawerProps = React.ComponentProps<(typeof Drawer)[KR]>;
  type Props = DialogProps & DrawerProps;

  return function DrawerDialogComponent(props: Props) {
    const isMobile = useIsMobile();
    const Comp = isMobile ? Drawer[drawerComp] : Dialog[dialogComp];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return <Comp {...(props as any)} />;
  };
}

export const DrawerDialog = createDrawerDialogComponent("Dialog", "Drawer");
export const DrawerDialogPortal = createDrawerDialogComponent(
  "DialogPortal",
  "DrawerPortal",
);
export const DrawerDialogOverlay = createDrawerDialogComponent(
  "DialogOverlay",
  "DrawerOverlay",
);
export const DrawerDialogTrigger = createDrawerDialogComponent(
  "DialogTrigger",
  "DrawerTrigger",
);
export const DrawerDialogClose = createDrawerDialogComponent(
  "DialogClose",
  "DrawerClose",
);
export const DrawerDialogContent = createDrawerDialogComponent(
  "DialogContent",
  "DrawerContent",
);
export const DrawerDialogHeader = createDrawerDialogComponent(
  "DialogHeader",
  "DrawerHeader",
);
export const DrawerDialogFooter = createDrawerDialogComponent(
  "DialogFooter",
  "DrawerFooter",
);
export const DrawerDialogTitle = createDrawerDialogComponent(
  "DialogTitle",
  "DrawerTitle",
);
export const DrawerDialogDescription = createDrawerDialogComponent(
  "DialogDescription",
  "DrawerDescription",
);
