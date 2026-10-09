import type { Dispatch, SetStateAction } from "react"

interface PaginationProps {
    page: number,
    totalPages: number,
    onChange: Dispatch<SetStateAction<number>>
}

function Pagination({ page, totalPages, onChange: setPage }: PaginationProps) {
    const pagesPerGroup = 10
    const pageGroup = Math.floor((page - 1) / pagesPerGroup)
    const pageGroupStart = (pageGroup * pagesPerGroup) + 1

    const handlePreviousPage = () => setPage(Math.max((page - 1), 1))
    const handleNextPage = () => setPage(Math.min((page + 1), totalPages))

    const handlePreviousPageGroup = () => setPage(Math.max(pageGroupStart - pagesPerGroup, 1))
    const handleNextPageGroup = () => setPage(Math.min(pageGroupStart + pagesPerGroup, totalPages))

    return (
        <div className="flex flex-wrap justify-between">
            <div className="flex gap-3 *:text-blue-600 *:cursor-pointer *:hover:text-blue-400 *:disabled:text-gray-400">
                <button children={"<<"} onClick={handlePreviousPageGroup} disabled={page === 1} />
                <button children={"< Anterior"} onClick={handlePreviousPage} disabled={page === 1} />
            </div>

            <div>
                { page } / { totalPages }
            </div>

            <div className="flex gap-3 *:text-blue-600 *:cursor-pointer *:hover:text-blue-400 *:disabled:text-gray-400">
                <button children={"Próxima >"} onClick={handleNextPage} disabled={page === totalPages} />
                <button children={">>"} onClick={handleNextPageGroup} disabled={page === totalPages} />
            </div>
        </div>
    )
}

export default Pagination