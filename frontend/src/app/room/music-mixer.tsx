import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
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
                className="relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
            >
                <div
                    className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                    style={{
                        background:
                            'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                    }}
                />
                <div
                    className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                    style={{
                        background:
                            'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                        maskImage:
                            'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                    }}
                />

                <CloudRain className="relative z-10 h-5 w-5 text-white" />
            </button>
            <DialogTitle></DialogTitle>

            <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-lg">
                <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 shadow-[0_20px_60px_rgba(0,0,0,.45)] ring-1 ring-white/10 backdrop-blur-2xl">
                    <div
                        className="pointer-events-none absolute -inset-16 -z-10 opacity-40 blur-3xl"
                        aria-hidden
                        style={{
                            background:
                                'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,.15), transparent 60%), radial-gradient(800px 500px at 80% 0%, rgba(255,255,255,.08), transparent 60%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-50"
                        aria-hidden
                        style={{
                            background:
                                'linear-gradient( to bottom right, rgba(255,255,255,.35), rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 60% )',
                            maskImage:
                                'radial-gradient(120% 120% at 0% 0%, black 40%, transparent 60%)',
                        }}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.06] mix-blend-overlay"
                        aria-hidden
                        style={{
                            backgroundImage:
                                'url("data:image/svg+xml;utf8,<svg xmlns=%27http://www.w3.org/2000/svg%27 width=%27128%27 height=%27128%27 viewBox=%270 0 128 128%27><filter id=%27n%27><feTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%272%27 stitchTiles=%27stitch%27/></filter><rect width=%27128%27 height=%27128%27 filter=%27url(%23n)%27 opacity=%270.5%27/></svg>")',
                        }}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="px-6 pt-5 pb-6"
                    >
                        <DialogHeader>
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-[17px] font-semibold tracking-wide text-white/95">
                                    White Noise Mixer
                                </h2>
                                <Switch
                                    checked={ambientSounds.some(
                                        (s) => s.enabled,
                                    )}
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
                </div>
            </DialogContent>
        </Dialog>
    );
}
