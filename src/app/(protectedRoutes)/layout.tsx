import { ReactNode } from "react";

import { View } from "./_components/Views";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
  return <View>{children}</View>;
}
