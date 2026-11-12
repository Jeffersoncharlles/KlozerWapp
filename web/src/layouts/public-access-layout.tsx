import { Outlet } from 'react-router'

export const PublicAcessLayout = () => {
  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <main className="flex min-h-screen w-full flex-1">
        <Outlet />
      </main>
    </div>
  )
}
