export default function ProjectLayout({
  children,
}: LayoutProps<"/projects/[projectId]">) {
  return <div>{children}</div>;
}
