import AuthPage from "@/components/auth-page";
import ProfilePage from "@/components/profile-page";
import { getMe } from "@/lib/api/user";

export default async function Profile() {
  const res = await getMe();

  if (res.success && res.data) {
    return <ProfilePage user={res.data} />;
  }

  return <AuthPage />;
}
