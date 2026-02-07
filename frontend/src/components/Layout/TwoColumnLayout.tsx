import type { ReactNode } from 'react'

interface TwoColumnLayoutProps {
  left: ReactNode
  right: ReactNode
}

function TwoColumnLayout({ left, right }: TwoColumnLayoutProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 relative">
      <div>{left}</div>
      <div className="hidden md:block">
        <div className="sticky top-0 h-screen flex items-center justify-center p-12">
          {right}
        </div>
      </div>
    </div>
  )
}

export default TwoColumnLayout
