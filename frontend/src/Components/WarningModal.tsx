import { Button } from './ui/button';
import { createPortal } from 'react-dom';

type WarningModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onDelete?: (() => void) | undefined;
  onDiscard?: (() => void) | undefined;
  title: string;
  description: string;
  buttonText: string;
}

  const WarningModal = ({ isOpen, onClose, onDelete, onDiscard, title, description, buttonText }: WarningModalProps) => {
      if (!isOpen) return null;
  return createPortal(
    <div className="fixed inset-0  z-50 flex items-center justify-center">
        <div
        className={`fixed inset-0 bg-black/30 transition-opacity duration-100 ${isOpen ? "opacity-100 " : "pointer-events-none opacity-0"} transition-opacity duration-100`}
        onClick={onClose}
      />
        <div className="bg-card p-6 rounded-lg shadow-lg bg-opacity-30 relative  max-h-[90vh] flex flex-col  animate-in fade-in-0 zoom-in-95 duration-300 border border-border z-10 ">
        <div className="text-foreground text-center md:text-left text-2xl mb-1 font-bold">
          {title}
        </div>
        <div className="text-white text-md font-extralight mb-6">
          {description}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" className='cursor-pointer' onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className='cursor-pointer' onClick={onDelete || onDiscard}>{buttonText}</Button>
        </div>
        </div>
    </div>,
    document.body,
  )
}

export default WarningModal