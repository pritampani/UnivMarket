import { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import BottomNavigation from "@/components/layout/bottom-navigation";
import InstallPrompt from "@/components/pwa/install-prompt";
import UpdateNotification from "@/components/pwa/update-notification";
import OfflinePage from "@/components/pwa/offline-page";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Offline indicator appears on top of everything when offline */}
      <OfflinePage />
      
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <BottomNavigation />
      <InstallPrompt />
      <UpdateNotification />
    </div>
  );
}
