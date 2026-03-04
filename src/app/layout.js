import "./globals.css";
import { AppProvider }  from "@/store/AppContext";
import { AuthProvider } from "@/store/AuthContext";
import Header           from "@/components/layout/Header";
import Toast            from "@/components/ui/Toast";
import ModalManager     from "@/components/modals/ModalManager";

export const metadata = {
  title:       "PredictIndia 🔮",
  description: "Predict events. Prove you called it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white font-sans">
        <AuthProvider>
          <AppProvider>
            <Toast />
            <Header />
            <main className="pb-10">{children}</main>
            <ModalManager />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
