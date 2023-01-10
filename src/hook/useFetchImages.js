import { useEffect, useState } from "react"
import { getPhotos } from "../helpers/GetImages";

export const useFetchImages = () =>{

    const [ images, setImages ] = useState([]);
    const [ isLoading, setIsLoading ] = useState( true );

    const getImages = async () =>{
        const newImages = await getPhotos();
        setImages(newImages);
        setIsLoading(false)
    }

    useEffect(()=>{
        getImages()
    },[]);

    return{
        images,
        isLoading
    }

}