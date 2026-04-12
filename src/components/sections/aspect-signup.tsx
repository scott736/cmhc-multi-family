import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default function AspectSignup() {
  return (
    <section className="bg-obsidian overflow-hidden px-2.5 lg:px-0">
      <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray container border-b border-l border-r px-4 py-16 md:px-28 md:py-28 lg:px-32 lg:py-32">
        <Card className="border-dark-gray bg-obsidian mx-auto w-full max-w-sm border">
          <CardHeader className="flex flex-col items-center space-y-4">
            <p className="text-muted-foreground mt-1 text-center text-sm">
              Enter your information to sign up.
            </p>

            <Button variant="ghost" className="w-full">
              <FcGoogle className="mr-2 size-5" />
              Sign up with Google
            </Button>

            <div className="text-muted-foreground flex w-full items-center text-sm">
              <span className="border-dark-gray w-full flex-grow border-t" />
              <span className="whitespace-nowrap px-2">OR</span>
              <span className="border-dark-gray w-full flex-grow border-t" />
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid gap-4">
              <Input
                type="text"
                placeholder="Enter your name"
                required
                className="bg-jet text-foreground border-dark-gray"
              />
              <Input
                type="email"
                placeholder="Enter your email"
                required
                className="bg-jet text-foreground border-dark-gray"
              />
              <Input
                type="password"
                placeholder="Enter your password"
                required
                className="bg-jet text-foreground border-dark-gray"
              />

              <Button type="submit" className="mt-2 w-full">
                Create an account
              </Button>
            </div>

            <div className="text-muted-foreground mx-auto mt-8 flex justify-center gap-1 text-sm">
              <p>Already have an account?</p>
              <a
                href="/login"
                className="text-foreground font-medium hover:underline"
              >
                Log in
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
