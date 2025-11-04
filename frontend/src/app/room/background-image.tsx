import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
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
                <button
                    onClick={() => setShowBackgroundSelector(true)}
                    className="rounded-xl border border-zinc-700/50 bg-zinc-800/80 p-3 shadow-lg shadow-black/20 backdrop-blur-md transition-all hover:scale-105 hover:bg-zinc-700/80"
                >
                    <ImageIcon className="h-5 w-5 text-white" />
                </button>

                <DialogContent className="border-zinc-700/50 bg-zinc-900/95 text-white shadow-2xl shadow-black/40 backdrop-blur-xl sm:max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                        <DialogHeader>
                            <h2 className="text-xl font-semibold">
                                Background Theme
                            </h2>
                        </DialogHeader>

                        <Tabs defaultValue="gallery" className="mt-4">
                            <TabsList className="grid w-full grid-cols-2 border border-zinc-700/30 bg-zinc-800/50">
                                <TabsTrigger
                                    value="gallery"
                                    className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                >
                                    Gallery
                                </TabsTrigger>
                                <TabsTrigger
                                    value="custom"
                                    className="data-[state=active]:bg-zinc-700/80 data-[state=active]:text-white"
                                >
                                    Custom Upload
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="gallery" className="mt-6">
                                <div className="grid max-h-[400px] grid-cols-2 gap-4 overflow-y-auto pr-2">
                                    {BACKGROUND_IMAGES.map((image, index) => (
                                        <button
                                            key={index}
                                            onClick={() =>
                                                selectBackgroundImage(image)
                                            }
                                            className="group relative aspect-video overflow-hidden rounded-xl border-2 border-zinc-700/50 shadow-lg shadow-black/20 transition-all hover:scale-105 hover:border-zinc-500/80 hover:shadow-xl hover:shadow-black/30"
                                        >
                                            <Image
                                                src={
                                                    image || '/placeholder.svg'
                                                }
                                                alt={`Background ${index + 1}`}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover transition-transform group-hover:scale-110"
                                            />
                                            {backgroundImage === image &&
                                                !customBackgroundImage && (
                                                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl">
                                                            <Check className="h-6 w-6 text-black" />
                                                        </div>
                                                    </div>
                                                )}
                                        </button>
                                    ))}
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
                                            <div className="relative aspect-video overflow-hidden rounded-xl border-2 border-zinc-700/50 shadow-lg shadow-black/20">
                                                <Image
                                                    src={
                                                        customBackgroundImage ||
                                                        '/placeholder.svg'
                                                    }
                                                    alt="Custom background"
                                                    className="h-full w-full object-cover"
                                                />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-xl">
                                                        <Check className="h-6 w-6 text-black" />
                                                    </div>
                                                </div>
                                            </div>
                                            <Button
                                                onClick={() =>
                                                    innerInputRef.current?.click()
                                                }
                                                className="w-full border border-zinc-700/50 bg-zinc-800/80 text-white hover:bg-zinc-700/80"
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
                                            className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-zinc-700/50 bg-zinc-800/50 p-12 transition-all hover:border-zinc-600/80 hover:bg-zinc-800/70"
                                        >
                                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-zinc-700/80 shadow-lg shadow-black/20">
                                                <Upload className="h-8 w-8 text-white" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-lg font-medium text-white">
                                                    Upload Custom Background
                                                </p>
                                                <p className="mt-1 text-sm text-white/60">
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
                </DialogContent>
            </Dialog>
        );
    },
);

BackgroundImage.displayName = 'BackgroundImage';
