import { FcGoogle } from "react-icons/fc";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const AspectLogin = () => {
  return (
    <section className="bg-obsidian relative overflow-hidden px-2.5 lg:px-0">
      <div className="border-b-dark-gray border-l-dark-gray border-r-dark-gray container relative border-b border-l border-r px-4 py-16 md:px-28 md:py-28 lg:px-32 lg:py-32">
        <div className="flex flex-col gap-4">
          <Card className="border-dark-gray bg-obsidian mx-auto w-full max-w-sm border">
            <CardHeader className="flex flex-col items-center space-y-4">
              <p className="text-muted-foreground mt-1 text-center text-sm">
                Enter your information to login.
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
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="bg-jet text-foreground border-dark-gray"
                />
                <div>
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    required
                    className="bg-jet text-foreground border-dark-gray"
                  />
                </div>
                <Button type="submit" className="mt-2 w-full">
                  Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AspectLogin;
