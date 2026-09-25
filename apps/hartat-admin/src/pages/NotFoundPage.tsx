import { LinkBreakIcon } from "@phosphor-icons/react"

function NotFoundPage() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center select-none text-gray-800">
            <h1 className="text-2xl font-bold"> Erro 404: </h1>
            <h2 className="text-xl"> Página não encontrada. </h2>
            <LinkBreakIcon className="text-4xl mt-3" />
        </div>
    )
}

export default NotFoundPage