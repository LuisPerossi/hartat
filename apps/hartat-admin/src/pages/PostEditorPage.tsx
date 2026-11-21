import { useEffect, useState } from "react"
import { useLocation, useParams, useNavigate } from "react-router-dom"
import type { Post } from "@hartat/types/posts"
import LoadingSpinner from "@/components/LoadingSpinner"
import PostEditor from "../features/post-manager/components/PostEditor"
import { fetchPostById } from "../features/post-manager/utils/posts"

function PostEditorPage() {
    const { id } = useParams<{ id: string }>()
    const location = useLocation()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)
    const [post, setPost] = useState<Post | null>(null)

    const draftPost = (location.state as { draft?: Post } | null)?.draft ?? null
    const isEditing = Boolean(id)

    useEffect(() => {
        if (!id) return

        const postId = Number(id)
        if (isNaN(postId)) {
            window.alert("ID de postagem inválido")
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
                const message = err instanceof Error ? err.message : "Erro ao carregar postagem"
                window.alert(message)
                navigate("/posts")
            } finally {
                setIsLoading(false)
            }
        }

        loadPost()
    }, [id, navigate])

    if (isLoading) {
        return <LoadingSpinner />
    }

    if (isEditing && !post) {
        return null
    }

    return (
        <PostEditor
            key={`${post?.id ?? "new"}-${draftPost ? "draft" : "clean"}`}
            initialPost={post}
            draftPost={draftPost}
            isEditing={isEditing}
        />
    )
}

export default PostEditorPage
