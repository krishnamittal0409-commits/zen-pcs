import { supabase } from "@/lib/supabase";

export default async function TestDBPage() {
  const { data, error } = await supabase
    .from("components")
    .select("*");

  if (error) {
    return (
      <div className="p-10 text-red-500">
        Error: {error.message}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black p-10 text-white">
      <h1 className="mb-6 text-4xl font-bold">
        Supabase Test
      </h1>

      <pre>
        {JSON.stringify(data, null, 2)}
      </pre>
    </main>
  );
}