import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("production authentication configuration", () => {
  it("fails closed when Supabase is not configured", () => {
    const auth = readFileSync("src/state/auth.tsx", "utf8");

    expect(auth).toContain("AUTH_CONFIG_MISSING");
    expect(auth).not.toContain("localUserId");
    expect(auth).not.toContain("LOCAL_SESSION");
    expect(auth).not.toContain("password.length < 6");
  });

  it("documents required public Supabase credentials without committing values", () => {
    const example = readFileSync(".env.example", "utf8");

    expect(example).toContain("EXPO_PUBLIC_SUPABASE_URL=");
    expect(example).toContain("EXPO_PUBLIC_SUPABASE_ANON_KEY=");
    expect(example).toContain("your-project.supabase.co");
  });
});
