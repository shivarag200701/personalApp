import { Button } from './ui/button';

type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
}

const WarningModal = ({ isOpen, onClose, onDelete }: WarningModalProps) => {
    if (!isOpen) return null;
  return (
    <div className="fixed inset-0  z-50 flex items-center justify-center">
        <div
        className="fixed inset-0 bg-transparent bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
        <div className="bg-[#131315] p-6 rounded-lg shadow-lg bg-opacity-30 relative  max-h-[90vh] flex flex-col  animate-in fade-in-0 zoom-in-95 duration-300 border border-gray-800 z-10 ">
        <div className="text-white text-center md:text-left text-2xl mb-6 font-bold">
          Warning
        </div>
        <div className="text-white text-md font-extralight mb-3">
          Are you sure you want to delete this task?
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className='cursor-pointer' onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className='cursor-pointer' onClick={onDelete}>Delete</Button>
        </div>
        </div>
    </div>
  )
}

export default WarningModal