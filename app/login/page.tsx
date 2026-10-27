import GoogleSignInButton from "@/components/GoogleSignInButton";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="page-shell confirmation-page">
      <p className="eyebrow">Welcome back</p>
      <h1>Sign in</h1>
      <p>Sign in to save your details and keep track of your orders.</p>
      {error ? (
        <div className="form-error" role="alert">
          Sign-in didn&apos;t work. Please try again.
        </div>
      ) : null}
      <div className="login-actions">
        <GoogleSignInButton />
      </div>
    </main>
  );
}
