import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Check, ImageIcon, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BACKGROUND_IMAGES } from './page.data';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React, {
    forwardRef,
    useImperativeHandle,
    useRef,
    type ChangeEvent,
} from 'react';

interface BackgroundImageProps {
    showBackgroundSelector: boolean;
    setShowBackgroundSelector: (show: boolean) => void;
    selectBackgroundImage: (image: string) => void;
    backgroundImage: string;
    customBackgroundImage: string | null;
    handleCustomImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export const BackgroundImage = forwardRef<
    HTMLInputElement,
    BackgroundImageProps
>(
    (
        {
            showBackgroundSelector,
            setShowBackgroundSelector,
            selectBackgroundImage,
            backgroundImage,
            customBackgroundImage,
            handleCustomImageUpload,
        },
        ref,
    ) => {
        const innerInputRef = useRef<HTMLInputElement>(null);
        useImperativeHandle(
            ref,
            () => innerInputRef.current as HTMLInputElement,
            [],
        );

        return (
            <Dialog
                open={showBackgroundSelector}
                onOpenChange={setShowBackgroundSelector}
            >
                {/* Trigger button with liquid-glass styling */}
                <button
                    onClick={() => setShowBackgroundSelector(true)}
                    className="relative rounded-2xl border border-white/10 bg-black/40 p-3 shadow-[0_8px_25px_rgba(0,0,0,0.6),_0_2px_4px_rgba(255,255,255,0.08)_inset] backdrop-blur-xl transition-all hover:scale-110 hover:bg-black/50 active:scale-95"
                >
                    <span
                        aria-hidden
                        className="pointer-events-none absolute -inset-px rounded-2xl opacity-40 blur-md"
                        style={{
                            background:
                                'radial-gradient(120% 100% at 50% 120%, rgba(255,255,255,0.2), transparent 70%)',
                        }}
                    />
                    <span
                        aria-hidden
                        className="pointer-events-none absolute inset-0 rounded-2xl opacity-40"
                        style={{
                            background:
                                'linear-gradient(to bottom, rgba(255,255,255,0.25), rgba(255,255,255,0.05) 40%, transparent 70%)',
                            maskImage:
                                'radial-gradient(120% 100% at 50% -20%, black 50%, transparent 80%)',
                        }}
                    />
                    <ImageIcon className="relative z-10 h-5 w-5 text-white" />
                </button>
                <DialogTitle></DialogTitle>

                {/* Dialog content becomes a transparent shell; inner card carries the liquid-glass */}
                <DialogContent className="border-none bg-transparent p-0 shadow-none sm:max-w-2xl">
                    <div className="relative overflow-hidden rounded-[28px] border border-white/15 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,.55)] ring-1 ring-white/10 backdrop-blur-2xl">
                        {/* glow + grain overlays (purely visual) */}
                        <div
                            aria-hidden
                            className="pointer-events-none absolute -inset-16 -z-10 opacity-40 blur-3xl"
                            style={{
                                background:
                                    'radial-gradient(1200px 600px at 20% 10%, rgba(255,255,255,.15), transparent 60%), radial-gradient(800px 500px at 80% 0%, rgba(255,255,255,.08), transparent 60%)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-50"
                            style={{
                                background:
                                    'linear-gradient(to bottom right, rgba(255,255,255,.35), rgba(255,255,255,.06) 30%, rgba(255,255,255,0) 60%)',
                                maskImage:
                                    'radial-gradient(120% 120% at 0% 0%, black 40%, transparent 60%)',
                            }}
                        />
                        <div
                            aria-hidden
                            className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-[0.06] mix-blend-overlay"
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
                            className="p-6"
                        >
                            <DialogHeader>
                                <h2 className="text-xl font-semibold text-white/95">
                                    Background Theme
                                </h2>
                            </DialogHeader>

                            <Tabs defaultValue="gallery" className="mt-4">
                                <TabsList className="grid w-full grid-cols-2 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
                                    <TabsTrigger
                                        value="gallery"
                                        className="data-[state=active]:bg-white/25 data-[state=active]:text-white"
                                    >
                                        Gallery
                                    </TabsTrigger>
                                    <TabsTrigger
                                        value="custom"
                                        className="data-[state=active]:bg-white/25 data-[state=active]:text-white"
                                    >
                                        Custom Upload
                                    </TabsTrigger>
                                </TabsList>

                                <TabsContent value="gallery" className="mt-6">
                                    <div className="grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto pr-2">
                                        {BACKGROUND_IMAGES.map(
                                            (image, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() =>
                                                        selectBackgroundImage(
                                                            image,
                                                        )
                                                    }
                                                    className="group relative aspect-video overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-[0_10px_30px_rgba(0,0,0,.35)] backdrop-blur-xl transition-all hover:scale-105 hover:bg-white/12"
                                                >
                                                    <Image
                                                        src={
                                                            image ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt={`Background ${index + 1}`}
                                                        fill
                                                        sizes="(max-width: 768px) 100vw, 50vw"
                                                        className="object-cover transition-transform group-hover:scale-110"
                                                    />
                                                    {backgroundImage ===
                                                        image &&
                                                        !customBackgroundImage && (
                                                            <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-sm">
                                                                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl">
                                                                    <Check className="h-6 w-6 text-black" />
                                                                </div>
                                                            </div>
                                                        )}
                                                </button>
                                            ),
                                        )}
                                    </div>
                                </TabsContent>

                                <TabsContent value="custom" className="mt-6">
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <input
                                            ref={innerInputRef}
                                            type="file"
                                            accept="image/*"
                                            onChange={handleCustomImageUpload}
                                            className="hidden"
                                        />

                                        {customBackgroundImage ? (
                                            <div className="w-full space-y-4">
                                                <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/12 bg-white/8 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
                                                    <Image
                                                        src={
                                                            customBackgroundImage ||
                                                            '/placeholder.svg'
                                                        }
                                                        alt="Custom background"
                                                        className="h-full w-full object-cover"
                                                    />
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/45 backdrop-blur-sm">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl">
                                                            <Check className="h-6 w-6 text-black" />
                                                        </div>
                                                    </div>
                                                </div>
                                                <Button
                                                    onClick={() =>
                                                        innerInputRef.current?.click()
                                                    }
                                                    className="w-full border border-white/15 bg-white text-black hover:bg-white/90"
                                                >
                                                    <Upload className="mr-2 h-4 w-4" />
                                                    Upload Different Image
                                                </Button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() =>
                                                    innerInputRef.current?.click()
                                                }
                                                className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-white/20 bg-white/10 p-12 shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl transition-all hover:border-white/30 hover:bg-white/15"
                                            >
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 shadow-[0_10px_30px_rgba(0,0,0,.35)]">
                                                    <Upload className="h-8 w-8 text-white" />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-lg font-medium text-white">
                                                        Upload Custom Background
                                                    </p>
                                                    <p className="mt-1 text-sm text-white/70">
                                                        Click to select an image
                                                        from your device
                                                    </p>
                                                </div>
                                            </button>
                                        )}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </motion.div>
                    </div>
                </DialogContent>
            </Dialog>
        );
    },
);

BackgroundImage.displayName = 'BackgroundImage';
