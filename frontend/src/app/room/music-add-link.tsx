import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Music, X } from 'lucide-react';

interface PlayMusicWithLinkProps {
    showMusicDialog: boolean;
    setShowMusicDialog: (show: boolean) => void;
    musicLink: string;
    setMusicLink: (link: string) => void;
    savedMusicLinks: string[];
    handleMusicLinkSubmit: () => void;
    removeMusicLink: (index: number) => void;
}
export function PlayMusicWithLink({
    showMusicDialog,
    setShowMusicDialog,
    musicLink,
    setMusicLink,
    savedMusicLinks,
    handleMusicLinkSubmit,
    removeMusicLink,
}: PlayMusicWithLinkProps) {
    return (
        <Popover open={showMusicDialog} onOpenChange={setShowMusicDialog}>
            <PopoverTrigger asChild>
                <button className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80">
                    <Music className="h-5 w-5 text-white" />
                </button>
            </PopoverTrigger>
            <PopoverContent
                side="top"
                align="start"
                className="w-96 border-zinc-700/50 bg-zinc-900/95 p-0 shadow-2xl shadow-black/40 backdrop-blur-xl"
            >
                <div className="p-4">
                    <h2 className="mb-4 text-xl font-semibold text-white">
                        Music Links
                    </h2>

                    <div className="mb-4 flex gap-2">
                        <Input
                            type="text"
                            placeholder="Paste YouTube or Spotify link..."
                            value={musicLink}
                            onChange={(e) => setMusicLink(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleMusicLinkSubmit();
                                }
                            }}
                            className="flex-1 border-zinc-700/50 bg-zinc-800/80 text-white placeholder:text-white/50"
                        />
                        <Button
                            onClick={handleMusicLinkSubmit}
                            className="bg-white text-black hover:bg-white/90"
                        >
                            Add
                        </Button>
                    </div>

                    {savedMusicLinks.length === 0 ? (
                        <div className="py-8 text-center">
                            <Music className="mx-auto mb-3 h-12 w-12 text-white/50" />
                            <p className="text-sm text-white/70">
                                No music links yet. Add YouTube or Spotify links
                                to play during your study session.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {savedMusicLinks.map((link, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3 rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-md shadow-black/10 backdrop-blur-md transition-all hover:bg-zinc-700/60"
                                >
                                    <Music className="h-4 w-4 text-white/70" />
                                    <a
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 truncate text-sm text-white hover:text-white/80"
                                    >
                                        {link}
                                    </a>
                                    <button
                                        onClick={() => removeMusicLink(index)}
                                        className="rounded p-1 transition-colors hover:bg-zinc-700/50"
                                    >
                                        <X className="h-4 w-4 text-white/70" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
