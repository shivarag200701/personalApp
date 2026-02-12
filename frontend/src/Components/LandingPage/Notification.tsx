export type NotificationProps = {
  name: string
  description: string
  time: string
  color: string
  icon: string
}

const Notification = ({ name, description, time, color,icon }: NotificationProps) => {
  return (
    <div className="flex w-full max-w-[300px] gap-3 rounded-2xl border border-gray-200 bg-white/90 px-3 py-2 shadow-sm transition-all duration-200 hover:scale-[101%] [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)] cursor-pointer items-center justify-center">
      <div
          className="flex size-10 items-center justify-center rounded-lg"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-center text-xs text-gray-500">
          <span className="font-medium text-gray-900 text-sm sm:text-[16px] truncate">{name}</span>
          <span className="mx-1 text-gray-800">•</span>
          <span className="whitespace-nowrap text-[10px]">{time}</span>
        </div>
        <p className="text-[12px] font-normal text-gray-600 leading-snug line-clamp-2">
          {description}
        </p>
      </div>
    </div>
  )
}

export default Notification
