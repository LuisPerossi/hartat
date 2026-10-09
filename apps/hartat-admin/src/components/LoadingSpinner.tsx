function LoadingSpinner() {
    return (
        <div className="fixed flex inset-0 z-100 items-center justify-center bg-black/25">
            <div className="w-16 aspect-square rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
        </div>
    )
}

export default LoadingSpinner