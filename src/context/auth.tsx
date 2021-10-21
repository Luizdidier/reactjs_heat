import axios from "axios";
import { createContext, ReactNode, useEffect, useState } from "react";
import { FlagIconCode } from "react-flag-kit";
import { api } from "../services/api";

type User = {
    id: string;
    name: string;
    login: string;
    avatar_url: string;
}

type AuthContextData = {
    user: User | null;
    signInUrl: string;
    signOut: () => void; 
    country: FlagIconCode;
}

type AuthResponse = {
    token: string;
    user: {
        id: string;
        avatar_url: string;
        name: string;
        login: string;
    }
}

export const AuthContext = createContext({} as AuthContextData);

type AuthProvider = {
    children: ReactNode;
}

type CountryApi = {
    countryCode: FlagIconCode;
}

const client_id = 'c7f679b97ac1dd52dc98';
const signInUrl = `https://github.com/login/oauth/authorize?scope=user&client_id=${client_id}`; 

export function AuthProvider ({ children }: AuthProvider) {
    const [user, setUser] = useState<User | null>(null);
    const [country, setCountry] = useState<FlagIconCode>('US');

    async function getCountryWithAPI () {
        const{ data } = await axios.get<CountryApi>('https://extreme-ip-lookup.com/json/');
        setCountry(data.countryCode)
    };

    async function signIn(githubCode: string) {
        const { data: { token, user } } = await api.post<AuthResponse>('authenticate', {
            code: githubCode
        });

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        localStorage.setItem('@chat:token', token);
        setUser(user);
        getCountryWithAPI()
    }

    function signOut() {
        setUser(null);
        localStorage.removeItem('@chat:token');
    }

   

    useEffect(() => {
        const token = localStorage.getItem('@chat:token');

        if(token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            api.get<User>('profile').then(({ data }) => setUser(data));
            getCountryWithAPI();
        }

    }, [])

    useEffect(() => {
        const url = window.location.href;
        const codeIdentify = "?code=";
        const hasGithubCode = url.includes(codeIdentify);

        if(hasGithubCode) {
            const [urlWithoutCode, githubCode] = url.split(codeIdentify);

            window.history.pushState({}, '', urlWithoutCode);
            signIn(githubCode);
        }
    }, [])

    return (
        <AuthContext.Provider value={{ signInUrl, user, signOut, country }}>
            {children}
        </AuthContext.Provider>
    );
}