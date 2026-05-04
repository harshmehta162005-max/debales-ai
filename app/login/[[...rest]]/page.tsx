import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F3EF",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Warm decorative blobs */}
      <div style={{
        position: "absolute", top: "-15%", left: "-8%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(193,127,89,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "-15%", right: "-8%",
        width: 700, height: 700, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(139,115,85,0.07) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, width: "100%", display: "flex", justifyContent: "center", padding: "24px" }}>
        <SignIn
          routing="path"
          path="/login"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          appearance={{
            variables: {
              colorPrimary: "#C17F59",
              colorBackground: "#FFFFFF",
              colorInputBackground: "#FAFAF8",
              colorInputText: "#1A1A1A",
              colorText: "#1A1A1A",
              colorTextSecondary: "#6B6560",
              colorNeutral: "#F0EDE8",
              borderRadius: "12px",
              fontFamily: "Inter, sans-serif",
            },
            elements: {
              rootBox: "w-full flex justify-center",
              card: "shadow-lg",
              headerTitle: "font-bold",
              socialButtonsBlockButton: "border-[#E8E4DE] hover:border-[#C8C3BD] bg-white hover:bg-[#FAFAF8] transition-all",
              dividerLine: "bg-[#E8E4DE]",
              dividerText: "text-[#A39E97]",
              formFieldLabel: "font-medium",
              formButtonPrimary: "font-semibold tracking-wide transition-all",
              footerActionLink: "font-semibold",
            },
          }}
        />
      </div>
    </div>
  );
}
