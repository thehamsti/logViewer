import { Header } from "@/components/Header"

export function Analysis() {

  return (
    <div className="flex flex-col h-screen">
      <Header disableFileOpen={true} disableSearch={true} />

      <main className="flex-1 p-4">
        {/* Content will be added here */}
      </main>
    </div>
  );
}
