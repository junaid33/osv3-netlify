import { useState, useRef, useEffect } from "react";
import { useMutation, gql } from "@keystone-6/core/admin-ui/apollo";
import { useRouter } from "next/navigation";
import { useReinitContext, useRawKeystone } from "@keystone/keystoneProvider";
import { useRedirect } from "@keystone/utils/useRedirect";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../primitives/default/ui/card";

import { Button } from "../../primitives/default/ui/button";
import { Input } from "../../primitives/default/ui/input";
import { Label } from "../../primitives/default/ui/label";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "../../primitives/default/ui/alert";
import { AlertCircle } from "lucide-react";
import { Outfit } from "next/font/google";
import { Logo } from "../../components/Logo";

const montserrat = Outfit({ subsets: ["latin"] });

export const SignInPage = ({
  identityField = "email",
  secretField = "password",
  mutationName = "authenticateUserWithPassword",
  successTypename = "UserAuthenticationWithPasswordSuccess",
  failureTypename = "UserAuthenticationWithPasswordFailure",
}) => {
  const mutation = gql`
    mutation($identity: String!, $secret: String!) {
      authenticate: ${mutationName}(${identityField}: $identity, ${secretField}: $secret) {
        ... on ${successTypename} {
          item {
            id
          }
        }
        ... on ${failureTypename} {
          message
        }
      }
    }
  `;

  const [mode, setMode] = useState("signin");
  const [state, setState] = useState({ identity: "", secret: "" });
  const [submitted, setSubmitted] = useState(false);

  const identityFieldRef = useRef(null);
  useEffect(() => {
    identityFieldRef.current?.focus();
  }, [mode]);

  const [mutate, { error, loading, data }] = useMutation(mutation);
  const reinitContext = useReinitContext();
  const router = useRouter();
  const rawKeystone = useRawKeystone();
  const redirect = useRedirect();

  // if we are signed in, redirect immediately
  useEffect(() => {
    if (submitted) return;
    if (rawKeystone.authenticatedItem.state === "authenticated") {
      router.push(redirect);
    }
  }, [rawKeystone.authenticatedItem, router, redirect, submitted]);

  useEffect(() => {
    if (!submitted) return;

    // TODO: this is horrible, we need to resolve this mess
    // @ts-ignore
    if (rawKeystone.adminMeta?.error?.message === "Access denied") {
      router.push("/no-access");
      return;
    }

    router.push(redirect);
  }, [rawKeystone.adminMeta, router, redirect, submitted]);

  const onSubmit = async (event) => {
    event.preventDefault();

    if (mode !== "signin") return;

    try {
      const { data } = await mutate({
        variables: {
          identity: state.identity,
          secret: state.secret,
        },
      });
      if (data.authenticate?.__typename !== successTypename) return;
    } catch (e) {
      return;
    }

    await reinitContext();
    setSubmitted(true);
  };

  return (
    <SignInTemplate
      title="Sign in"
      onSubmit={onSubmit}
      state={state}
      setState={setState}
      identityField={identityField}
      secretField={secretField}
      identityFieldRef={identityFieldRef}
      successTypename={successTypename}
      failureTypename={failureTypename}
      data={data}
      loading={loading}
      error={error}
      mode={mode}
    />
  );
};

const placeholders = {
  email: "m@example.com",
  password: "supersecretpassword",
};

export function SignInTemplate({
  title,
  onSubmit,
  state,
  setState,
  identityField,
  identityFieldRef,
  secretField,
  loading,
  data,
  successTypename,
  error,
  failureTypename,
  mode,
}) {
  return (
    <div
      className={`px-2 h-screen flex justify-center items-center bg-[#0f172a] heropattern-topography-zinc-500/10 dark:bg-background`}
    >
      <div className="flex flex-col gap-2 md:gap-4 basis-[450px] px-2">
        <form onSubmit={onSubmit}>
          <Card className="overflow-hidden shadow-sm dark:bg-zinc-950">
            {/* <CardHeader className="mb-4 p-0">
              <CardTitle className="text-zinc-700 dark:text-white text-xl">
                <div className="heropattern-topography-zinc-200 dark:heropattern-topography-zinc-800/50 px-6 py-3 border-b bg-muted dark:bg-zinc-900">
                  <Logo size="lg" />
                </div>
                <div className="px-6 pt-4">{title}</div>
              </CardTitle>
              
              <CardDescription className="px-6 text-sm">
                Credentials required to access dashboard
              </CardDescription>
            </CardHeader> */}
            <CardHeader>
              <CardTitle className="text-lg font-bold tracking-wide text-slate-600 dark:text-white">
                SIGN IN
                <div className="h-1 w-20 mt-0.5 bg-gradient-to-r from-green-700 to-green-200 dark:from-green-800 dark:to-green-600"></div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid w-full items-center gap-4">
                <div className="flex flex-col space-y-1.5">
                  <Label htmlFor="identity" className="text-md capitalize">
                    {identityField}
                  </Label>
                  <Input
                    id="identity"
                    name="identity"
                    value={state.identity}
                    onChange={(e) =>
                      setState({ ...state, identity: e.target.value })
                    }
                    placeholder={placeholders[identityField] || identityField}
                    ref={identityFieldRef}
                    className="bg-muted"
                  />
                </div>
                {mode === "signin" && (
                  <div className="flex flex-col space-y-1.5">
                    <Label htmlFor="identity" className="text-md capitalize">
                      {secretField}
                    </Label>
                    <Input
                      id="password"
                      name="password"
                      value={state.secret}
                      onChange={(e) =>
                        setState({ ...state, secret: e.target.value })
                      }
                      placeholder={placeholders[secretField] || secretField}
                      type="password"
                      className="bg-muted"
                    />
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex flex-col justify-between">
              <Button
                variant="light"
                className="w-full text-md tracking-wide h-11 md:h-12 font-semibold text-white uppercase transition-all duration-200 ease-in-out bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 dark:from-green-700 dark:to-green-800 dark:hover:from-green-800 dark:hover:to-green-900 dark:text-gray-100"
                isLoading={
                  loading ||
                  // this is for while the page is loading but the mutation has finished successfully
                  data?.authenticate?.__typename === successTypename
                }
                type="submit"
              >
                SIGN IN
              </Button>
            </CardFooter>
          </Card>
        </form>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        )}
        {data?.authenticate?.__typename === failureTypename && (
          <Alert
            variant="destructive"
            className="mt-4 bg-red-100 dark:bg-red-900"
          >
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{data?.authenticate.message}</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}

// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import Link from "next/link"

// export default function Component() {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-[#1a2332]">
//       <Card className="w-full max-w-md">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">
//             SIGN IN
//             <div className="h-1 w-16 bg-green-500 mt-1"></div>
//           </CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="space-y-2">
//             <Label htmlFor="email">Email</Label>
//             <Input id="email" placeholder="you@awesome.com" type="email" />
//           </div>
//           <div className="space-y-2">
//             <div className="flex justify-between items-center">
//               <Label htmlFor="password">Password</Label>
//               <Link className="text-sm text-gray-400 hover:text-gray-300" href="#">
//                 Forgot password
//               </Link>
//             </div>
//             <Input id="password" placeholder="supersecretpassword" type="password" />
//           </div>
//           <Button className="w-full bg-green-500 hover:bg-green-600 text-white">SIGN IN</Button>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }
