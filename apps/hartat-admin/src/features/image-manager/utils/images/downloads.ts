import type { Image } from "@hartat/types/images";
import JSZip from "jszip";

//Downloading a single image file
interface DownloadImageProps {
    image: Image
    imageUrl: string,
}

export async function downloadImage(props: DownloadImageProps) {
    const { image, imageUrl } = props
    const fileName = `${image.name}${image.extension}`

    try {
        //Fetching from api
        const response = await fetch(imageUrl)
        if (response.ok === false) { throw new Error(await response.json()) }

        //Generating blob url and downloading
        const blob = await response.blob()
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = fileName
        link.click()

        URL.revokeObjectURL(link.href)
    } catch(err) {
        console.error(err)
        window.alert('Erro ao baixar imagem')
    }
}

//Downloading multiple files in a .zip
interface DownloadSelectedImagesProps {
    apiUrl: string,
    selectedImages: Map<string, Image>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
}

export async function downloadSelectedImages(props: DownloadSelectedImagesProps) {
    const { apiUrl, selectedImages, setIsLoading } = props

    //Checking for empty selection
    if (selectedImages.size === 0) {
        window.alert('Nenhuma imagem selecionada')
        return
    }

    setIsLoading(true)
    let errorCount = 0

    try {
        const zip = new JSZip()

        //Adding each file to the .zip
        for (const [, image] of selectedImages) {
            const fileName = `${image.name}${image.extension}`
            const imageUrl = `${apiUrl}/admin/images/${image.key}`

            try {
                const response = await fetch(imageUrl)
                if (response.ok === false) { 
                    console.error(`Unable to download ${fileName}`)
                    throw new Error(await response.json()) 
                }
    
                const blob = await response.blob()
                zip.file(fileName, blob)
            } catch (err) {
                console.error(err)
                errorCount++
            }
        }

        //Generating zip blob url and downloading
        const content = await zip.generateAsync({ type: 'blob' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(content)
        link.download = 'imagens.zip'
        link.click()

        URL.revokeObjectURL(link.href)
    } catch (err) {
        console.error('Unable to create zip:', err)
    } finally {
        if (errorCount > 0) { window.alert('Erro ao baixar algumas imagens') }
        setIsLoading(false)
    }
}
