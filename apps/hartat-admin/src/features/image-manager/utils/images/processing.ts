const MAX_SIZE = 1920
const QUALITY = 0.8

//Webp conversion
export async function convertImage(image: File) {
    const bitmap = await createImageBitmap(image)

    //Resizing the image if it exceeds the max size
    const ratio =  Math.min(
        MAX_SIZE / bitmap.width, 
        MAX_SIZE / bitmap.height,
        1
    )

    //Creating the webp canvas
    const webpCanvas = createCanvas(
        Math.round(bitmap.width * ratio),
        Math.round(bitmap.height * ratio)
    )

    //Drawing the image onto context
    webpCanvas.ctx.drawImage(bitmap, 0, 0, webpCanvas.canvas.width, webpCanvas.canvas.height)

    //Generating the blob
    const webpBlob = await canvasToBlob(webpCanvas.canvas, QUALITY)

    //Generating file name
    const baseName = image.name.substring(0, image.name.lastIndexOf('.'))
    const fileName = `${baseName}.webp`

    return {
        webp: new File([webpBlob], fileName, { type: 'image/webp' }),
    }
}

//Canvas creation helper
function createCanvas(width: number, height: number) {
    const canvas = document.createElement('canvas')

    canvas.width = width
    canvas.height = height

    const ctx = canvas.getContext('2d')
    if (ctx === null) { throw new Error('Unable to create 2D context') }

    return { canvas, ctx }
}

//Canvas to blob conversion helper
function canvasToBlob(canvas: HTMLCanvasElement, quality = 0.8): Promise<Blob> {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) { resolve(blob) }
            else { reject(new Error('Unable to generate blob')) }
        }, 'image/webp', quality)
    })
}