import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { ContinueWithGoogle } from "./continue-with-google";

export default async function AuthPage() {
  "use cache";

  return (
    <main className="flex h-svh flex-col items-center justify-center space-y-12 p-4">
      <div className="text-center">
        <h1 className="mb-2 text-3xl">Taini</h1>
        <p className="text-muted-foreground uppercase">
          The future of AI film making
        </p>
      </div>

      <Card className="gap-8 pt-8 pb-10">
        <CardHeader>
          <CardTitle className="text-2xl">Welcome to Taini</CardTitle>
          <CardDescription>
            Access your creative dashboard and production tools.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CardAction className="w-full">
            <ContinueWithGoogle />
          </CardAction>
          <div className="relative mt-8 w-full">
            <Separator />
            <div className="text-muted-foreground bg-card absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 text-xs uppercase">
              Secure Access
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-muted-foreground">
            By signing in, you agree to our{" "}
            <Link href="/" className="text-primary">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/" className="text-primary">
              Privacy Policy
            </Link>
          </p>
        </CardFooter>
      </Card>

      <div className="text-muted-foreground text-sm uppercase">
        Editorial grade AI - {new Date().getFullYear()}
      </div>
    </main>
  );
}
