import { Button } from '@/components/ui/button';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import { IconFolderOpen } from '@tabler/icons-react';

interface FileHandlerProps {
  onFileLoad: (headers: string[], rows: string[][]) => void;
  onError: (error: string) => void;
}

export function FileHandler({ onFileLoad, onError }: FileHandlerProps) {
  const handleFileOpen = async () => {
    try {
      const selected = await open({
        multiple: false,
        filters: [{
          name: 'Log Files',
          extensions: ['log']
        }]
      });

      if (selected && typeof selected === 'string') {
        const content = await readTextFile(selected);
        const lines = content.split('\n').filter((line: string) => line.trim());
        
        if (lines.length > 0) {
          const headers = lines[0].split(' ').filter((header: string) => header.trim());
          const rows = lines.slice(1).map((line: string) => 
            line.split(' ').filter((cell: string) => cell.trim())
          );
          
          onFileLoad(headers, rows);
        } else {
          onError('Selected file is empty');
        }
      }
    } catch (err) {
      onError('Error reading file: ' + String(err));
    }
  };

  return (
    <Button
      variant="ghost"
      onClick={handleFileOpen}
      data-action="open-file"
      title="Open log file (⌘O)"
    >
      <IconFolderOpen className="mr-2 h-4 w-4" />
      Open
    </Button>
  );
} 