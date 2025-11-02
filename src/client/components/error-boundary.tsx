export const ErrorBoundary = ({ error }: { error: any }) => {
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-red-100">
      <h1 className="text-3xl font-bold text-red-700 mb-4">Something went wrong.</h1>
      <p className="text-red-600">{JSON.stringify(error)}</p>
    </div>
  )
}
