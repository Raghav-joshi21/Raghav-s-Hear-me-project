import Header from "@/components/Header";
import DeafUserPanel from "@/components/DeafUserPanel";
import HearingUserPanel from "@/components/HearingUserPanel";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Animated background gradient */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(260,60%,12%)] via-[hsl(280,50%,8%)] to-[hsl(250,60%,10%)] animate-gradient" />
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/20 rounded-full blur-[128px] animate-pulse-soft" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/20 rounded-full blur-[128px] animate-pulse-soft" style={{ animationDelay: "1s" }} />
      </div>

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1 px-6 pb-6">
        <div className="h-full grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Deaf User Panel */}
          <DeafUserPanel />

          {/* Hearing User Panel */}
          <HearingUserPanel />
        </div>
      </main>
    </div>
  );
};

export default Index;
