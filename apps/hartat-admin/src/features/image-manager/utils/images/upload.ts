import type { Image, FailedImage, PostImagesResponse } from "@hartat/types/images"
import { convertImage } from "./processing"

interface UploadImagesProps {
    files: File[],
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
    apiUrl: string,
}

const UPLOAD_BATCH_SIZE = 5
const ALLOWED_TYPES = [ 'image/png', 'image/jpeg', 'image/webp' ]

export async function uploadImages(props: UploadImagesProps) {
    const { files, setIsLoading, setForceReload, apiUrl } = props
    setIsLoading(true)

    //Setting up variables
    const images: File[] = []
    const uploadedImages: Image[] = []
    const failedImages: FailedImage[] = []
    
    try {
        //Validating image files
        for (const file of files) {
            if (ALLOWED_TYPES.includes(file.type) === false) {
                failedImages.push(createFailedImage(file, 'Invalid file type'))
                continue
            }

            images.push(file)
        }

        if (images.length === 0) {
            console.error(failedImages)
            window.alert('Nenhum arquivo de imagem válido selecionado')
            throw new Error('No valid files selected')
        }

        //Uploading files per batch
        for (let i = 0; i < images.length; i += UPLOAD_BATCH_SIZE) {
            const batch = images.slice(i, i + UPLOAD_BATCH_SIZE)
            const formData = new FormData()

            const convertedImages: File[] = []

            //Converting images and appending to formData
            for (const image of batch) {
                try {
                    const convertedImage = await convertImage(image)
                    formData.append('image', convertedImage.webp)
                    convertedImages.push(image)
                } catch (err) {
                    console.error(err)
                    failedImages.push(createFailedImage(image, 'Unable to convert image'))
                }
            }

            //If no images were successfully converted, cancel api post
            if (convertedImages.length === 0) {
                console.log('Unable to convert any images in the batch')
                console.log(batch)
                continue
            }

            //Send post request to the api
            try {
                const response = await fetch(`${apiUrl}/admin/images`, { method: 'POST', body: formData })
                const apiResponse = await response.json() as PostImagesResponse

                if (response.ok === false) {
                    console.log(apiResponse.message)

                    if (apiResponse.data.failedImages) {
                        failedImages.push(...apiResponse.data.failedImages)
                    }
                }

                if (apiResponse.data.uploadedImages) {
                    uploadedImages.push(...apiResponse.data.uploadedImages)
                }

            } catch (err) {
                console.error(err)
                for (const image of convertedImages) {
                    failedImages.push(createFailedImage(image, 'Unable to upload image'))
                }
            }
        }

        //Verifying errors
        if (failedImages.length > 0) {
            console.error(failedImages)

            if (uploadedImages.length === 0) { window.alert('Erro ao enviar imagens') } 
            else { window.alert('Erro ao enviar algumas imagens') }
        }

        setForceReload(prev => prev + 1)
    } catch(err) {
        console.error(err)
    } finally {
        setIsLoading(false)
    }
}

function createFailedImage(file: File, cause: string): FailedImage {
    const { name, type, size } = file
    return { name, type, size, cause }
}
