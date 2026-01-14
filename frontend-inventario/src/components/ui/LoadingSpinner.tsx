import type { FC } from 'react'

const LoadingSpinner: FC<{ fullScreen?: boolean }> = ({ fullScreen }) => {
  return (
    <div className={fullScreen ? 'flex items-center justify-center h-screen' : 'inline-block'}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
    </div>
  )
}

export default LoadingSpinner
