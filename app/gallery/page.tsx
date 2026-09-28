import type { Metadata } from "next";
import { StudioGallery } from "@/components/gallery/studio-gallery";
export const metadata:Metadata={title:"The showroom",description:"Walk through Edgar Acosta’s complete portfolio in an interactive 3D gallery."};
export default async function GalleryPage({searchParams}:{searchParams:Promise<{work?:string}>}){
 const {work}=await searchParams;
 return <StudioGallery initialWork={work}/>;
}
