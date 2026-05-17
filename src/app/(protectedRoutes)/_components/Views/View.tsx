import { ReactNode } from "react";

import { Navbar } from "../Navbar";

interface ViewProps {
  children: ReactNode;
}

export function View({ children }: ViewProps) {
  return (
    <div className="min-h-screen bg-[#070b12] text-white">
      <div className="mx-auto w-full max-w-[1320px] px-4 py-4 md:px-6">
        <Navbar />
        <main>{children}</main>
      </div>
    </div>
  );
}
