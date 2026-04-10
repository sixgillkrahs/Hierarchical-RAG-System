import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className="p-4 w-full h-full">
      <h3 className="text-2xl font-bold">Welcome to Client Portal!</h3>
      <p className="mt-2 text-gray-600 mb-6 font-medium">
        This is the new client portal focusing on end-user RAG queries.
      </p>

      <div className="flex gap-4">
        <Link 
          to="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow transition-colors"
        >
          Go to Login
        </Link>
      </div>
    </div>
  )
}
