interface SpinnerProps {
    coverScreen?: boolean
}

function Spinner({ coverScreen }: SpinnerProps) {
    const spinner = <div className="w-16 h-16 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"/>

    if (coverScreen) {
        return <div children={spinner} className="flex fixed top-0 left-0 w-full h-full items-center justify-center bg-black/10" />
    }

    return spinner
}

export default Spinner