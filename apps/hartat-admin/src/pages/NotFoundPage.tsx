import { LinkBreakIcon } from "@phosphor-icons/react"

function NotFoundPage() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center text-gray-800 select-none">
            <h1 className="text-2xl font-bold"> Erro 404: </h1>
            <h2 className="text-xl"> Página não encontrada. </h2>
            <LinkBreakIcon className="text-4xl" />
        </div>
    )
}

export default NotFoundPage