import { Ear, Settings, Users } from "lucide-react";

const Header = () => {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center glow-primary">
          <Ear className="w-5 h-5 text-primary-foreground" />
        </div>
        <h1 className="text-xl font-display font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Hear-Me
        </h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="pill-badge">
          <Users className="w-3.5 h-3.5 text-accent" />
          <span className="text-foreground/80">2 Connected</span>
        </div>
        <button className="glass-button p-2.5 rounded-xl">
          <Settings className="w-4 h-4 text-foreground/70" />
        </button>
      </div>
    </header>
  );
};

export default Header;
