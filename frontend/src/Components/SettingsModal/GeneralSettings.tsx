import ThemePicker from './ThemePicker';

const GeneralSettings = () => {
  return (
    <div className='min-h-[calc(100vh-100px)] max-h-[calc(100vh-100px)] rounded-r-md font-medium overflow-y-auto bg-background '>
        <div className='text-[16px] font-medium pl-4 py-2 pr-2 bg-background sticky top-0'
        >
        General
        </div>
        <div className='h-px bg-border sticky top-10'/>
        <div className='p-6'>
          <ThemePicker />
        </div>
    </div>
  )
}

export default GeneralSettings