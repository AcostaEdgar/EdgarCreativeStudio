import type { Metadata } from "next";
import { StudioGallery } from "@/components/gallery/studio-gallery";
import { readStudioState } from "@/lib/studio-state";
export const metadata:Metadata={title:"The showroom",description:"Walk through Edgar Acosta’s complete portfolio in an interactive 3D gallery."};
export default async function GalleryPage({searchParams}:{searchParams:Promise<{work?:string}>}){
 const [{work},{portfolio}]=await Promise.all([searchParams,readStudioState()]);
 return <StudioGallery works={portfolio} initialWork={work}/>;
}
