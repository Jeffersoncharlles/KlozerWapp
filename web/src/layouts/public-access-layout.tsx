import { Outlet } from "react-router";

export const PublicAcessLayout = () => {
  return (
    <div className="flex min-h-screen bg-background">
      <main className="flex-1 bg-white p-4 pt-20 md:p-6 md:pt-6">
        <Outlet />
      </main>
    </div>
  );
};
