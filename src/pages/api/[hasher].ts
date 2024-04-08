import cryptoJS from 'crypto-js';
import type {APIRoute} from "astro";

export const GET: APIRoute = ({params, url}) => {
    console.log(url)
    const password = url.searchParams.get('password');
    const hasher = params.hasher

    console.log(password)
    console.log(hasher)
    console.log(params)

    if (!password) {
        console.log("Password is required")
        return new Response(null, {
            status: 400,
            statusText: 'Password is required',

        })
    }

    if (hasher === 'MD5') {
        var hash = cryptoJS.MD5(password).toString();
    } else if (hasher === 'SHA-1') {
        var hash = cryptoJS.SHA1(password).toString();
    } else if (hasher === 'SHA-256') {
        var hash = cryptoJS.SHA256(password).toString();
    } else if (hasher === 'SHA-512') {
        var hash = cryptoJS.SHA512(password).toString();
    } else {
        return new Response(null, {
            status: 400,
            statusText: 'Invalid hasher',
        })
    }

    console.log(hash)


    return new Response(JSON.stringify({ hash }), {
        headers: {
            'Content-Type': 'application/json',
        },
    });
}

export function getStaticPaths() {
    return [
        { params: { hasher: 'MD5' } },
        { params: { hasher: 'SHA-1' } },
        { params: { hasher: 'SHA-256' } },
        { params: { hasher: 'SHA-512' } },
    ];
}