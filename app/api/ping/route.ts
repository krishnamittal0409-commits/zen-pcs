import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Ping Supabase to ensure active database activity and prevent the 7-day pause
    const { data, error } = await supabase
      .from("components")
      .select("id")
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          status: "degraded",
          message: "Database ping failed",
          error: error.message,
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      status: "healthy",
      service: "Zen PCs Engine",
      database: "Supabase Postgres Connected",
      active: true,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        error: err.message || "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
