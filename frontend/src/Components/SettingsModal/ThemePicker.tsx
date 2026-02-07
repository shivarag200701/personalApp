import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { themes, type ThemeId } from '@/utils/themes';
import { Check } from 'lucide-react';

const ThemePicker = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const currentTheme = theme as ThemeId || 'dark';

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-medium mb-2">Theme</h3>
        <p className="text-sm text-muted-foreground">
          Choose your preferred theme
        </p>
      </div>
      
      <div className="grid sm:grid-cols-3 gap-4">
        {Object.values(themes).map((themeOption) => {
          const isSelected = currentTheme === themeOption.id;
          
          return (
            <button
              key={themeOption.id}
              onClick={() => setTheme(themeOption.id)}
            >
              {/* Theme Preview */}
              <div 
                className="h-21  mb-2 relative overflow-hidden cursor-pointer rounded-md"
                style={{ 
                  backgroundColor: themeOption.colors.background,
                  border: `1px solid ${themeOption.colors.border}`
                }}
              >
                {/* Preview accent bar */}

                <div className='grid grid-cols-[75px_1fr] h-full'>
                <div 
                style={{
                  backgroundColor: themeOption.colors.sidebar,
                }}
                className='p-2'
                >
                    <div className='flex flex-col gap-[6px]'>
                    <div 
                    className="h-2 rounded"
                    style={{ 
                      backgroundColor: themeOption.colors.accent,
                      width: '100%'
                    }}
                  />
                  <div 
                    className="h-2 rounded"
                    style={{ 
                      backgroundColor: themeOption.colors.muted,
                      width: '100%'
                    }}
                  />
                  <div 
                    className="h-2 rounded"
                    style={{ 
                      backgroundColor: themeOption.colors.muted,
                      width: '100%'
                    }}
                  />
                </div>
                </div>
                {/* Preview content */}
                <div className="px-2 py-1 space-y-1">
                <div className='flex justify-between'>
                <span className="text-xs font-bold text-accent flex justify-start mb-3">{themeOption.name}</span>
                {isSelected &&(<Check size={15}
                    style={{
                        color: themeOption.colors.accent
                    }}
                />)}
                </div>
                <div className='grid grid-cols-[10px_1fr] gap-2'>
                    <div className='rounded-full border-[0.5px] border-accent h-3 w-3'
                        style={{
                            backgroundColor: themeOption.colors.background,
                        }}
                    />
                <div className='flex flex-col gap-[6px]'>
                  <div 
                    className="h-2 rounded"
                    style={{ 
                      backgroundColor: themeOption.colors.muted,
                      width: '100%'
                    }}
                  />
                  <div 
                    className="h-2 rounded"
                    style={{ 
                      backgroundColor: themeOption.colors.muted,
                      width: '60%'
                    }}
                  />
                  </div>
                </div>
                </div>
                </div>
                </div>
              
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ThemePicker;

