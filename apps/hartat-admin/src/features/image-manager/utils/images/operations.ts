import type { Image } from "@hartat/types/images"

//Renaming an image with the api
interface RenameImageProps {
    image: Image,
    apiUrl: string,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

export async function renameImage(props: RenameImageProps) {
    const { image, apiUrl, setForceReload } = props
    const input = window.prompt('Digite o novo nome da imagem:', image.name)
    if (input === null) { return }

    if (input.trim().length === 0) {
        window.alert('O nome não pode ser vazio')
        return
    }

    try {
        const body = JSON.stringify({ name: input })
        const response = await fetch(`${apiUrl}/admin/images/id/${image.id}`, { method: 'PATCH', body })
        if (response.ok === false) { throw new Error(await response.json()) }

        setForceReload(prev => prev + 1)
    } catch (err) {
        console.error(err)
        window.alert('Erro ao renomear imagem')
    }
}

//Deleting an image with the api
interface DeleteImageProps {
    image: Image,
    apiUrl: string,
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

export async function deleteImage(props: DeleteImageProps) {
    const { image, apiUrl, setForceReload } = props
    const confirm = window.confirm(`Tem certeza que deseja excluir a imagem "${image.name}"?`)
    if (confirm === false) { return }

    try {
        const response = await fetch(`${apiUrl}/admin/images/id/${image.id}`, { method: 'DELETE' })
        if (response.ok === false) { throw new Error(await response.json()) }
        
        setForceReload(prev => prev + 1)
    } catch (err) {
       console.error(err)
       window.alert('Erro ao excluir imagem') 
    }
}

//Deleting multiple images with the api
interface DeleteSelectedImagesProps {
    apiUrl: string,
    selectedImages: Map<string, Image>,
    setIsLoading: React.Dispatch<React.SetStateAction<boolean>>
    setForceReload: React.Dispatch<React.SetStateAction<number>>
}

export async function deleteSelectedImages(props: DeleteSelectedImagesProps) {
    const { apiUrl, selectedImages, setIsLoading, setForceReload } = props

    if (selectedImages.size === 0) {
        window.alert('Nenhuma imagem selecionada')
        return
    }

    setIsLoading(true)
    let errorCount = 0

    try {
        const confirm = window.confirm('Tem certeza que deseja excluir as imagens selecionadas?')
        if (confirm === false) { return }

        for (const [, image] of selectedImages) {
            const fileName = `${image.name}${image.extension}`

            try {
                const response = await fetch(`${apiUrl}/admin/images/id/${image.id}`, { method: 'DELETE' })

                if (response.ok === false) {
                    console.error(`Unable to delete ${fileName}`)
                    throw new Error(await response.json())
                }

            } catch (err) {
                console.error(err)
                errorCount++
            }
        }
    } catch (err) {
        console.error(err)
    } finally {
        if (errorCount > 0) { window.alert('Erro ao excluir algumas imagens') }
        setIsLoading(false)
        setForceReload(prev => prev + 1)
    }
}