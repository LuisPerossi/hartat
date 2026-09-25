import { useEffect, useState } from "react"
import Spinner from "../../../components/Spinner"
import Searchbar from "../../../components/Searchbar"
import UploadImagesButton from "./UploadImagesButton"

function ImageManager() {
    const [isLoading, setIsLoading] = useState(false)
    const [search, setSearch] = useState("")

    useEffect(() => {
        const fetchImages = async () => {
            setIsLoading(true)
            setIsLoading(false)
        }

        fetchImages()
    }, [search])

    return (
        <>
            {isLoading && <Spinner coverScreen />}

            <h1 className="text-2xl font-bold"> Minhas Imagens </h1>
            
            <div className="flex gap-3">
                <Searchbar onSearch={setSearch} />
                <UploadImagesButton />
            </div>
        </>
    )
}

export default ImageManager