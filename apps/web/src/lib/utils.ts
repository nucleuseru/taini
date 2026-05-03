import { clsx, type ClassValue } from "clsx";
import { toast } from "sonner";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function downloadFile(url: string, fileName: string) {
  try {
    const res = await fetch(url);
    const file = await res.blob();
    const objUrl = URL.createObjectURL(file);
    const link = document.createElement("a");

    link.href = objUrl;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(objUrl);
  } catch {
    toast.error("Failed to download file");
  }
}
