import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://lacalhost:3000',
    headers: {
        'Content-Type': 'application/json'
    }
});

api.interceptors.request.use((config)=>{
    const stored = localStorage.getItem('auth')

    if(stored) {
        const { token } = JSON.parse(stored);

        if(token){
            config.headers.Authorization = 'Bearer ${token}'
        }
    }

    return config;
})