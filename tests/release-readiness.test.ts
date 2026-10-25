import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

describe("course release configuration", () => {
  it("keeps the package and Expo versions aligned", () => {
    const app = JSON.parse(readFileSync("app.json", "utf8")).expo;
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));

    expect(app.version).toBe(pkg.version);
    expect(app.android.versionCode).toBeGreaterThan(0);
  });

  it("uses a separate educational Android identity", () => {
    const app = JSON.parse(readFileSync("app.json", "utf8")).expo;

    expect(app.name).toBe("Stavuno Course");
    expect(app.slug).toBe("stavuno-industrial-mobile-course");
    expect(app.android.package).toBe("sk.stavuno.course");
    expect(app.android.package).not.toBe("sk.stavebnydennik.app");
  });

  it("persists Supabase sessions in React Native storage", () => {
    const client = readFileSync("src/services/supabase.ts", "utf8");

    expect(client).toContain(
      "import AsyncStorage from '@react-native-async-storage/async-storage'",
    );
    expect(client).toContain("storage: AsyncStorage");
    expect(client).toContain("persistSession: true");
  });
});
