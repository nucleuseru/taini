"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createProject } from "./actions";

export function ProjectCreationDialog() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);
  const [isLoading, startTransition] = useTransition();

  const handleSubmit = async () => {
    if (!name.trim()) return;

    try {
      const result = await createProject(name);

      if (!result.success) throw new Error(result.error);

      const projectId = result.data.projectId;

      toast.success("Project created successfully");

      startTransition(() => {
        setOpen(false);
        setName("");
      });

      router.push(`/projects/${projectId}/storyboard`);
    } catch (error: unknown) {
      toast.error(
        `Failed to create project: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      console.error(error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="w-full">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form>
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>
              Give your project a name to get started with your film production.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Field>
              <FieldLabel htmlFor="name">Project Name</FieldLabel>
              <FieldContent>
                <Input
                  id="name"
                  placeholder="e.g. My Awesome Sci-Fi Film"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  autoFocus
                />
              </FieldContent>
            </Field>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setOpen(false);
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              disabled={isLoading || !name.trim()}
              onClick={() => {
                startTransition(async () => {
                  await handleSubmit();
                });
              }}
            >
              {isLoading ? "Creating..." : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
