import React from "react";
import Header from "./Header";
import FooterNav from "./FooterNav";
import MiniPlayer from "./MiniPlayer";
import { Toaster } from "sonner";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 pb-20">
        {children}
      </main>
      <MiniPlayer />
      <FooterNav />
      <Toaster position="bottom-center" closeButton richColors />
    </div>
  );
};

export default Layout;
