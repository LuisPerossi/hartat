import { ArticleIcon, CalendarIcon, HouseIcon, ImageIcon, ListDashesIcon, ListIcon } from "@phosphor-icons/react"
import { useState } from "react"
import { Link } from "react-router-dom"

const LINKS = [
    { icon: <HouseIcon />, to: "/", text: "Início"},
    { icon: <ListDashesIcon />, to: "/categories", text: "Categorias"},
    { icon: <ArticleIcon />, to: "/posts", text: "Postagens"},
    { icon: <CalendarIcon />, to: "/events", text: "Eventos"},
    { icon: <ImageIcon />, to: "/images", text: "Imagens"}
]

function Sidebar() {

    const [ isOpen, setIsOpen ] = useState(false)
    const toggleSidebar = () => setIsOpen(!isOpen)
    const handleNavigate = () => setIsOpen(false)

    return (
        <aside className="relative text-white bg-slate-600 ">
            <div className="flex gap-2 p-5 text-2xl items-center select-none">
                <ListIcon className="md:hidden" onClick={toggleSidebar}/>
                <h1> Hartãt Admin </h1>
            </div>

            <nav className={`absolute w-full text-xl divide-y divide-white/30 bg-slate-600 md:block ${isOpen ? 'block' : 'hidden'}`}>
                { 
                    LINKS.map(({text, to, icon}, key) => (
                        <Link key={key} to={to} onClick={handleNavigate} className="flex p-3 hover:bg-slate-500"> 
                            <div className="flex gap-2 items-center"> {icon} {text} </div>
                        </Link>
                    ))
                }
            </nav>
        </aside>
    )
}

export default Sidebar