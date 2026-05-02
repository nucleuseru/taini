import { Navbar } from "@/components/navbar";

export default function ProjectLayout({
  children,
}: LayoutProps<"/projects/[projectId]">) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
