'use server';

export const getApiUrl = async () => {
    return process.env.API_URL || 'http://localhost:8080/api';
};

export const getWebSocketUrl = async () => {
    return process.env.WS_URL || 'http://localhost:8080/ws';
};
