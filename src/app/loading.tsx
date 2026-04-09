export default function Loading() {
  return (
    <div className="min-h-screen bg-obsidian flex flex-col items-center justify-center relative z-50">
      <div className="relative">
        {/* Animated Glow */}
        <div className="absolute inset-0 bg-admin-accent/20 blur-3xl animate-pulse rounded-full" />
        
        {/* Loading Spinner */}
        <div className="relative flex flex-col items-center gap-6">
          <div className="w-16 h-16 border-4 border-admin-accent/20 border-t-admin-accent rounded-full animate-spin shadow-[0_0_15px_rgba(56,189,248,0.3)]" />
          
          <div className="flex flex-col items-center gap-2">
            <h2 className="text-xl font-serif text-white tracking-widest uppercase animate-pulse">
              Initializing Protocol
            </h2>
            <div className="flex gap-1">
              <div className="w-1 h-1 bg-admin-accent rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-1 h-1 bg-admin-accent rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-1 h-1 bg-admin-accent rounded-full animate-bounce" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Background Status Text */}
      <div className="absolute bottom-12 font-mono text-[10px] text-white/20 tracking-[0.5em] uppercase">
        Secure System Access Verified
      </div>
    </div>
  );
}
