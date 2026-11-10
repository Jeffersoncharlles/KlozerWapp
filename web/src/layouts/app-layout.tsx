import { Outlet } from "react-router"

export const AppLayout = () => {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    )
}