import { createClient } from "../../../lib/supabase/server";
import { createAdminClient } from "../../../lib/supabase/admin";

/**
 * Account deletion — required by Apple App Store Guideline 5.1.1(v).
 *
 * Flow:
 *   1. Read the caller's session via the server client (cookie-borne JWT).
 *   2. If not authenticated, return 401.
 *   3. Use the service-role admin client to delete the auth.users row.
 *      All public.* user-owned rows cascade delete via ON DELETE CASCADE
 *      foreign keys defined in migration 0001.
 *   4. Return 204 No Content.
 *
 * The user's chat messages (Phase 3) are NOT deleted by this — they're
 * authored content the squad has the right to see for the moderation
 * appeal trail. We anonymize the author on those messages instead (Phase 3).
 *
 * Auth check is critical: without it, ANY authenticated user could delete
 * any other user just by passing user_id in the body. We never trust
 * client-supplied user_id; we always read it from the session.
 */
export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: sessionError,
  } = await supabase.auth.getUser();

  if (sessionError || !user) {
    return Response.json(
      { ok: false, error: "Not signed in." },
      { status: 401 },
    );
  }

  try {
    const admin = createAdminClient();
    const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);

    if (deleteError) {
      console.error("[account/delete] admin.deleteUser failed:", deleteError);
      return Response.json(
        { ok: false, error: "Couldn't complete deletion." },
        { status: 500 },
      );
    }

    // Sign the session out so the cookie can't be re-used.
    await supabase.auth.signOut();

    return new Response(null, { status: 204 });
  } catch (err) {
    console.error("[account/delete] unexpected error:", err);
    return Response.json(
      { ok: false, error: "Couldn't complete deletion." },
      { status: 500 },
    );
  }
}
