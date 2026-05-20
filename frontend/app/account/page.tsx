import AuthPage from "@/components/auth-page";

export default function Account() {
  const authenticated = false;

  if (!authenticated) {
    return <AuthPage />;
  }
}
