"use client";

import { createClient } from "@/lib/supabase/client";

export default function GoogleSignInButton() {
  async function signIn() {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button className="button button-dark button-full" onClick={signIn} type="button">
      Continue with Google
    </button>
  );
}
