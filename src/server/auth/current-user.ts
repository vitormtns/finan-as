import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { defaultCategories } from "@/server/categories/default-categories";

export async function syncProfileForUser(user: User) {
  const displayName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : user.email;

  await prisma.profile.upsert({
    where: {
      userId: user.id,
    },
    update: {
      name: displayName ?? null,
    },
    create: {
      userId: user.id,
      name: displayName ?? null,
    },
  });

  await prisma.category.createMany({
    data: defaultCategories.map((category) => ({
      userId: user.id,
      ...category,
    })),
    skipDuplicates: true,
  });
}

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function requireCurrentUser() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await syncProfileForUser(user);

  return user;
}

export async function requireCurrentUserId() {
  const user = await requireCurrentUser();

  return user.id;
}
