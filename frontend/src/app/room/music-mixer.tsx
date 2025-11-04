import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';
import { AmbientSound } from '@/lib/api/dto/room';

interface MusicMixerProps {
    showAmbientMixer: boolean;
    setShowAmbientMixer: (show: boolean) => void;
    ambientSounds: AmbientSound[];
    setAmbientSounds: (sounds: AmbientSound[]) => void;
    toggleAmbientSound: (id: string) => void;
}

export function MusicMixer({
    showAmbientMixer,
    setShowAmbientMixer,
    ambientSounds,
    setAmbientSounds,
    toggleAmbientSound,
}: MusicMixerProps) {
    return (
        <Dialog open={showAmbientMixer} onOpenChange={setShowAmbientMixer}>
            <button
                onClick={() => setShowAmbientMixer(true)}
                className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
            >
                <CloudRain className="h-5 w-5 text-white" />
            </button>

            <DialogContent className="border-zinc-700/50 bg-zinc-900/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-lg">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                >
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-semibold">
                                White Noise Mixer
                            </h2>
                            <Switch
                                checked={ambientSounds.some((s) => s.enabled)}
                                onCheckedChange={(checked) => {
                                    if (!checked) {
                                        setAmbientSounds(
                                            ambientSounds.map((s) => ({
                                                ...s,
                                                enabled: false,
                                            })),
                                        );
                                    }
                                }}
                                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-zinc-700"
                            />
                        </div>
                    </DialogHeader>

                    <div className="grid grid-cols-5 gap-4 py-6">
                        {ambientSounds.map((sound) => (
                            <button
                                key={sound.id}
                                onClick={() => toggleAmbientSound(sound.id)}
                                className="group relative flex flex-col items-center gap-2"
                            >
                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-xl text-2xl transition-all ${
                                        sound.enabled
                                            ? 'scale-105 border-2 border-zinc-600/50 bg-zinc-700/80 shadow-xl shadow-black/30 backdrop-blur-md'
                                            : 'border border-zinc-700/30 bg-zinc-800/50 shadow-md shadow-black/10 backdrop-blur-md hover:scale-105 hover:bg-zinc-700/50'
                                    }`}
                                >
                                    {sound.icon}
                                </div>
                                {sound.enabled && (
                                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-yellow-400 shadow-lg shadow-yellow-400/50" />
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="text-center text-xs text-white/60">
                        Click on sounds to toggle them on/off
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
}
