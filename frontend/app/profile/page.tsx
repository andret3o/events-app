import AuthPage from "@/components/auth-page";
import ProfilePage from "@/components/profile/profile";
import { getEventsByOwner } from "@/lib/api/event";
import { getMe } from "@/lib/api/user";

export default async function Profile() {
  const userRes = await getMe();

  if (userRes.success && userRes.data) {
    const user = userRes.data;
    const eventsRes = await getEventsByOwner(
      user.id,
      undefined,
      4,
      "createdAt,desc",
    );

    if (eventsRes.success && eventsRes.data) {
      const events = eventsRes.data;
      return <ProfilePage user={user} eventsPage={events} />;
    }
  }

  return <AuthPage />;
}
