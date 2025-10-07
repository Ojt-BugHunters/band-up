'use client';
import React, { useState, useEffect } from 'react';

const LiquidLoading = () => {
    const [mounted, setMounted] = useState(false);
    const [time, setTime] = useState(0);
    const [heights, setHeights] = useState([0, 0, 0, 0, 0, 0, 0]);
    const [droplets, setDroplets] = useState([
        false,
        false,
        false,
        false,
        false,
        false,
        false,
    ]);

    const colors = [
        'from-purple-500 to-pink-500',
        'from-blue-500 to-purple-500',
        'from-cyan-400 to-blue-500',
        'from-green-400 to-cyan-400',
        'from-yellow-400 to-green-400',
        'from-orange-400 to-yellow-400',
        'from-red-500 to-orange-400',
    ];

    useEffect(() => {
        setMounted(true);
        const interval = setInterval(() => {
            const t = Date.now() * 0.001; // chỉ tính 1 lần rồi dùng lại
            setTime(t);

            setHeights((prev) =>
                prev.map((_, index) => {
                    const maxHeight = 80;
                    const delay = index * 0.8;
                    const primaryWave = Math.sin(t + delay);
                    const bounceWave = Math.sin(t * 4 + delay) * 0.15;
                    const ripple = Math.sin(t * 8 + delay) * 0.05;
                    return maxHeight * (primaryWave + bounceWave + ripple);
                }),
            );

            setDroplets((prev) =>
                prev.map((_, index) => {
                    const delay = index * 0.8;
                    const waveValue = Math.sin(t + delay);
                    return waveValue > 0.8;
                }),
            );
        }, 32);

        return () => clearInterval(interval);
    }, []);

    if (!mounted) return null; // tránh SSR render lệch

    return (
        <div className="flex items-end space-x-4 p-8">
            {heights.map((height, index) => (
                <div
                    key={index}
                    className="relative flex flex-col items-center"
                >
                    {/* Droplet with liquid physics */}
                    <div
                        className={`h-4 w-4 rounded-full bg-gradient-to-r ${colors[index]} mb-3 transition-all duration-500 ease-out ${
                            droplets[index] ? 'opacity-100' : 'opacity-0'
                        }`}
                        style={{
                            animationDelay: `${index * 0.2}s`,
                            filter: 'blur(0.5px)',
                            transform: droplets[index]
                                ? `translateY(${Math.sin(time * 0.008 + index * 0.5) * 3}px) scale(${0.8 + Math.sin(time * 0.006 + index * 0.3) * 0.4})`
                                : 'translateY(10px) scale(0.5)',
                            boxShadow: droplets[index]
                                ? `0 0 15px ${
                                      colors[index].includes('purple')
                                          ? '#a855f7'
                                          : colors[index].includes('blue')
                                            ? '#3b82f6'
                                            : colors[index].includes('cyan')
                                              ? '#06b6d4'
                                              : colors[index].includes('green')
                                                ? '#10b981'
                                                : colors[index].includes(
                                                        'yellow',
                                                    )
                                                  ? '#eab308'
                                                  : colors[index].includes(
                                                          'orange',
                                                      )
                                                    ? '#f97316'
                                                    : '#ef4444'
                                  }40`
                                : 'none',
                        }}
                    />

                    {/* Main liquid bar with enhanced physics */}
                    <div
                        className={`w-10 bg-gradient-to-t ${colors[index]} relative overflow-hidden rounded-full shadow-lg transition-all duration-200 ease-out`}
                        style={{
                            height: `${Math.abs(height)}px`,
                            transform: height < 0 ? 'scaleY(-1)' : 'scaleY(1)',
                            transformOrigin: 'bottom',
                            filter: 'blur(0.3px)',
                            boxShadow: `0 0 20px ${
                                colors[index].includes('purple')
                                    ? '#a855f7'
                                    : colors[index].includes('blue')
                                      ? '#3b82f6'
                                      : colors[index].includes('cyan')
                                        ? '#06b6d4'
                                        : colors[index].includes('green')
                                          ? '#10b981'
                                          : colors[index].includes('yellow')
                                            ? '#eab308'
                                            : colors[index].includes('orange')
                                              ? '#f97316'
                                              : '#ef4444'
                            }50, inset 0 0 20px rgba(255,255,255,0.1)`,
                        }}
                    >
                        {/* Liquid surface tension effect */}
                        <div
                            className="absolute top-0 right-0 left-0 h-4 rounded-full bg-gradient-to-b from-white/40 to-transparent"
                            style={{
                                transform: `translateY(${Math.sin(time * 0.003 + index * 0.5) * 1}px) scaleY(${0.8 + Math.sin(time * 0.004 + index * 0.3) * 0.3})`,
                            }}
                        />

                        {/* Liquid wave effect */}
                        <div
                            className="absolute inset-0 rounded-full bg-gradient-to-t from-white/20 via-white/10 to-transparent"
                            style={{
                                transform: `translateY(${Math.sin(time * 0.002 + index * 0.5) * 2}px)`,
                                background: `linear-gradient(0deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 50%, transparent 100%)`,
                            }}
                        />

                        {/* Shimmer effect */}
                        <div
                            className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/40 to-transparent"
                            style={{
                                transform: `translateX(${Math.sin(time * 0.0015 + index * 0.7) * 8}px)`,
                                width: '140%',
                                left: '-20%',
                            }}
                        />

                        {/* Bubble effect */}
                        <div
                            className="absolute h-2 w-2 rounded-full bg-white/30"
                            style={{
                                top: `${20 + Math.sin(time * 0.003 + index * 0.8) * 10}%`,
                                left: `${30 + Math.sin(time * 0.002 + index * 0.6) * 20}%`,
                                transform: `scale(${0.5 + Math.sin(time * 0.004 + index * 0.4) * 0.5})`,
                                opacity:
                                    Math.sin(time * 0.005 + index * 0.9) * 0.3 +
                                    0.3,
                            }}
                        />
                    </div>

                    {/* Enhanced base droplet with liquid physics */}
                    <div
                        className={`h-3 w-3 rounded-full bg-gradient-to-r ${colors[index]} mt-2 transition-all duration-300`}
                        style={{
                            opacity:
                                Math.sin(time * 0.003 + index * 0.9) * 0.4 +
                                0.6,
                            transform: `scale(${
                                0.6 + Math.sin(time * 0.002 + index * 0.6) * 0.4
                            }) translateY(${
                                Math.sin(time * 0.004 + index * 0.8) * 1
                            }px)`,
                            filter: 'blur(0.2px)',
                            boxShadow: `0 2px 8px ${
                                colors[index].includes('purple')
                                    ? '#a855f7'
                                    : colors[index].includes('blue')
                                      ? '#3b82f6'
                                      : colors[index].includes('cyan')
                                        ? '#06b6d4'
                                        : colors[index].includes('green')
                                          ? '#10b981'
                                          : colors[index].includes('yellow')
                                            ? '#eab308'
                                            : colors[index].includes('orange')
                                              ? '#f97316'
                                              : '#ef4444'
                            }40`,
                        }}
                    />
                </div>
            ))}
        </div>
    );
};

export default LiquidLoading;
