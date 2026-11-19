import { useEffect, useState } from "react"
import { useParams, useLocation, useNavigate } from "react-router-dom"
import type { Post } from "@hartat/types/posts"
import LoadingSpinner from "@/components/LoadingSpinner"
import PostPreview from "../features/post-manager/components/PostPreview"
import { fetchPostById } from "../features/post-manager/utils/posts"

function PostPreviewPage() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()

    const draft = location.state?.draft as Post | undefined
    const [post, setPost] = useState<Post | null>(draft || null)
    const [isLoading, setIsLoading] = useState(!draft)

    useEffect(() => {
        if (draft) return

        if (!id || id === "draft") {
            navigate("/posts")
            return
        }

        const postId = Number(id)
        if (isNaN(postId)) {
            navigate("/posts")
            return
        }

        const loadPost = async () => {
            setIsLoading(true)
            try {
                const data = await fetchPostById(postId)
                setPost(data)
            } catch (err: unknown) {
                console.error(err)
                const message = err instanceof Error ? err.message : "Erro ao carregar pré-visualização"
                window.alert(message)
                navigate("/posts")
            } finally {
                setIsLoading(false)
            }
        }

        loadPost()
    }, [id, draft, navigate])

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (!post) {
        return null
    }

    return <PostPreview post={post} isDraft={Boolean(draft)} />
}

export default PostPreviewPage
