import { Copyrights } from "../copyrights/copyrights";
import { Header } from "../header/header";
import { Routing } from "../routing/routing";
import "./layout.css";

export function Layout() {
    return (
        <div className="Layout">

            <header>
                <Header />
            </header>

            <main>
                <Routing />
            </main>

            <footer>
                <Copyrights />
            </footer>

        </div>
    );
}
