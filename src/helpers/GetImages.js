

export const getPhotos = async () =>{
    const url = `https://jsonplaceholder.typicode.com/photos`;

    const resp = await fetch( url );
    const data = await resp.json();

    return data;
}