
const images: { url: string }[] = []
for (let i = 0; i < 30; i++) { images.push({ url: 'https://placehold.co/600x400' }) } 

function ImageGrid() {
    return (
        <div className="grid w-full flex-1 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-0">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image.url}
                    className="w-full aspect-square object-cover"
                />
            ))}
        </div>
    )
}

export default ImageGrid

/*
function ImageGrid() {
    return (
        <div className="grid w-full flex-1 grid-cols-[repeat(auto-fit,minmax(100px,1fr))] gap-0">
            {images.map((image, index) => (
                <img
                    key={index}
                    src={image.url}
                    className="w-full aspect-square object-cover"
                />
            ))}
        </div>
    )
}
*/